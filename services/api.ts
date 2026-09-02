
import { User } from '../types';
import { auth, database } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { ref, set } from "firebase/database";

// In development, empty string uses Vite proxy forwarding to http://63.184.29.99:7000.
// In production, set VITE_API_BASE_URL in .env if not hosting behind a proxy.
export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? "";

interface AskResponse {
    result: string;
    video_path: string;
}

export const askQuestion = async (
    question: string,
    threadId: string,
    controller: AbortController,
): Promise<AskResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/ask`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question, thread_id: threadId }),
            signal: controller.signal,
        });

        if (!response.ok) {
            let errorDetail = `HTTP error! status: ${response.status}`;
            try {
                const errorData = await response.json();
                errorDetail = errorData.detail || errorDetail;
            } catch (e) {
                errorDetail = response.statusText || errorDetail;
            }
            throw new Error(errorDetail);
        }

        const data: AskResponse = await response.json();
        return data;

    } catch (error) {
        throw error;
    }
};

// Firebase Authentication Functions

export const login = async (email: string, password: string): Promise<User> => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        if (!firebaseUser) throw new Error("Login failed: No user returned");

        return {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || email.split('@')[0],
            email: firebaseUser.email || ''
        };
    } catch (error: any) {
        let errorMessage = "Login failed";
        if (error.code === 'auth/invalid-credential') {
            errorMessage = "Invalid email or password.";
        } else if (error.code === 'auth/user-not-found') {
            errorMessage = "User not found.";
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = "Incorrect password.";
        } else {
            errorMessage = error.message;
        }
        throw new Error(errorMessage);
    }
};

export const signup = async (name: string, email: string, password: string): Promise<User> => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        if (!firebaseUser) throw new Error("Signup failed: No user returned");

        // Update the user's profile with their name
        await updateProfile(firebaseUser, {
            displayName: name
        });

        // Store user data in Realtime Database
        await set(ref(database, 'users/' + firebaseUser.uid), {
            name: name,
            email: email,
            createdAt: new Date().toISOString()
        });

        return {
            id: firebaseUser.uid,
            name: name,
            email: firebaseUser.email || ''
        };
    } catch (error: any) {
        let errorMessage = "Signup failed";
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = "Email is already in use.";
        } else if (error.code === 'auth/weak-password') {
            errorMessage = "Password should be at least 6 characters.";
        } else {
            errorMessage = error.message;
        }
        throw new Error(errorMessage);
    }
};

export const logout = async (): Promise<void> => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Logout error", error);
        throw error;
    }
};

export const getVideoUrl = (videoPath: string): string => {
    if (!videoPath) return '';

    let videoId = videoPath;

    // Handle Windows paths (replace backslashes with forward slashes)
    videoId = videoId.replace(/\\/g, '/');

    // Extract filename if path contains directories
    if (videoId.includes('/')) {
        const parts = videoId.split('/');
        videoId = parts[parts.length - 1];
    }

    // The backend handles "output_" prefix and ".mp4" extension automatically
    // We can strip them to keep the URL clean, or pass them as is.
    // Your backend logic:
    // if not video_id.startswith("output_"): video_id = f"output_{video_id}"
    // if not video_id.endswith(".mp4"): video_id = f"{video_id}.mp4"

    // Let's strip them to pass a clean UUID, but it works either way.
    if (videoId.endsWith('.mp4')) {
        videoId = videoId.substring(0, videoId.length - 4);
    }

    if (videoId.startsWith('output_')) {
        videoId = videoId.substring(7);
    }

    return `${API_BASE_URL}/video/${videoId}`;
};
