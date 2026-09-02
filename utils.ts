import React, { useState, useEffect } from 'react';
import { Chat, Message } from './types';

export function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        return initialValue;
      }
      
      const parsedValue = JSON.parse(item);

      // --- Final Data Integrity Checks ---

      // Ensure `activeChatId` is either a string or null, discarding any other type.
      if (key === 'activeChatId') {
        if (parsedValue !== null && typeof parsedValue !== 'string') {
            console.warn(`LocalStorage: Invalid type for activeChatId. Expected string or null, got ${typeof parsedValue}. Discarding.`);
            window.localStorage.removeItem(key);
            return initialValue; // which is null
        }
      }

      // Specific validation for 'user' object structure.
      if (key === 'user' && parsedValue) {
        if (
          typeof parsedValue.id !== 'string' ||
          typeof parsedValue.name !== 'string' ||
          typeof parsedValue.email !== 'string'
        ) {
          console.warn(`LocalStorage: Found corrupted user object for key "${key}". Discarding.`, parsedValue);
          window.localStorage.removeItem(key);
          return initialValue; // which is null for the 'user' key
        }
      }

      // If initial value is an array, perform deep validation.
      if (Array.isArray(initialValue)) {
        if (!Array.isArray(parsedValue)) {
          console.warn(`LocalStorage: Expected array for key "${key}", found ${typeof parsedValue}. Removing corrupted item.`);
          window.localStorage.removeItem(key);
          return initialValue;
        }
        
        // Step 1: Filter out any null, undefined, or non-object items within the array.
        let cleanedArray = parsedValue.filter(v => v && typeof v === 'object');
        if (cleanedArray.length < parsedValue.length) {
            console.warn(`LocalStorage: Removed ${parsedValue.length - cleanedArray.length} invalid (null/non-object) items from array for key "${key}".`);
        }
        
        // Step 2: For chats, perform a deep structural validation on each object AND its nested messages.
        if (key === 'chats') {
          const originalCount = cleanedArray.length;
          
          const structurallyValidatedArray = cleanedArray.map((chat: Chat) => {
            const isChatStructurallyValid = 
              chat &&
              typeof chat.id === 'string' &&
              typeof chat.title === 'string' &&
              Array.isArray(chat.messages) &&
              typeof chat.createdAt === 'string' && !isNaN(new Date(chat.createdAt).getTime()) &&
              typeof chat.updatedAt === 'string' && !isNaN(new Date(chat.updatedAt).getTime());
            
            if (!isChatStructurallyValid) {
              console.warn('LocalStorage: Filtering out structurally corrupted chat object (e.g., invalid date):', chat);
              return null;
            }

            const originalMessagesCount = chat.messages.length;
            const cleanedMessages = chat.messages.filter((msg: Message | null) => {
              const isMessageValid = 
                msg &&
                typeof msg.id === 'string' &&
                typeof msg.role === 'string' &&
                typeof msg.content === 'string' &&
                typeof msg.timestamp === 'string';
              
              if (!isMessageValid) {
                console.warn('LocalStorage: Filtering out corrupted message object within chat:', { chatId: chat.id, message: msg });
              }
              return isMessageValid;
            });

            if (cleanedMessages.length < originalMessagesCount) {
              console.warn(`LocalStorage: Removed ${originalMessagesCount - cleanedMessages.length} invalid messages from chat ID "${chat.id}".`);
            }
            
            return { ...chat, messages: cleanedMessages };
          }).filter(Boolean);

          if (structurallyValidatedArray.length < originalCount) {
            console.warn(`LocalStorage: Removed ${originalCount - structurallyValidatedArray.length} structurally invalid chat objects for key "${key}".`);
          }
          cleanedArray = structurallyValidatedArray as any[];
        }
        return cleanedArray as T;

      } 
      // If initial value is a non-null object, validate and merge to ensure all keys are present.
      else if (typeof initialValue === 'object' && initialValue !== null) {
        if (typeof parsedValue !== 'object' || parsedValue === null || Array.isArray(parsedValue)) {
          console.warn(`LocalStorage: Expected object for key "${key}", found invalid type. Using initial value.`);
          return initialValue;
        }
        // Merge stored value over defaults to fill in any missing properties.
        return { ...initialValue, ...parsedValue };
      }

      // For primitives or other types, return the parsed value.
      return parsedValue;

    } catch (error) {
      console.error(`Error reading or parsing localStorage key "${key}":`, error);
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.removeItem(key);
        } catch (removeError) {
          console.error(`Failed to remove corrupted localStorage key "${key}":`, removeError);
        }
      }
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      }
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);


  return [storedValue, setStoredValue];
}


export const groupChatsByDate = (chats: Chat[]): { [key: string]: Chat[] } => {
    const groups: { [key: string]: Chat[] } = {
        'اليوم': [],
        'أمس': [],
        'آخر ٧ أيام': [],
        'آخر ٣٠ يوم': [],
        'أقدم': [],
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const sortedChats = [...chats].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    sortedChats.forEach(chat => {
        // A chat could be null if data is corrupted, but the enhanced useLocalStorage hook
        // provides stronger guarantees. This check remains as a fallback.
        if (!chat || !chat.createdAt) return;

        const chatDate = new Date(chat.createdAt);
        const chatDay = new Date(chatDate.getFullYear(), chatDate.getMonth(), chatDate.getDate());
        
        const diffTime = today.getTime() - chatDay.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) {
            groups['اليوم'].push(chat);
        } else if (diffDays === 1) {
            groups['أمس'].push(chat);
        } else if (diffDays <= 7) {
            groups['آخر ٧ أيام'].push(chat);
        } else if (diffDays <= 30) {
            groups['آخر ٣٠ يوم'].push(chat);
        } else {
            // Anything older still belongs in the list; it used to be dropped.
            groups['أقدم'].push(chat);
        }
    });

    // Remove empty groups
    Object.keys(groups).forEach(key => {
        if (groups[key].length === 0) {
            delete groups[key];
        }
    });

    return groups;
};