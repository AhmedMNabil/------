
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { User, Chat, Message, MessageRole, AppSettings } from './types';
import { useLocalStorage } from './utils';
import AuthPage from './components/AuthPage';
import ChatPage from './components/ChatPage';
import { SplashScreen } from './components/Logo';
import { applyAppearance, DEFAULT_APPEARANCE } from './appearance';
import { askQuestion, logout } from './services/api';
import { auth, database } from './services/firebase';
import { onAuthStateChanged } from "firebase/auth";
import { ref, onValue, set, push, get } from "firebase/database";

const App: React.FC = () => {
  // User state is now managed via Firebase observer, initialized to null.
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Replace useLocalStorage with standard state for chats
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useLocalStorage<string | null>('activeChatId', null);
  const [settings, setSettings] = useLocalStorage<AppSettings>('settings', {
    sidebarCollapsed: false,
    language: 'ar',
    fontSize: 'base',
    theme: 'system',
    ...DEFAULT_APPEARANCE,
  });
  const [isTyping, setIsTyping] = useState(false);
  const [copiedChatId, setCopiedChatId] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const initialLoadDoneForUser = useRef<{ [key: string]: boolean }>({});

  // Monitor Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const mappedUser: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email || ''
        };
        setUser(mappedUser);
      } else {
        setUser(null);
      }
      setIsLoadingUser(false);
    });

    return () => unsubscribe();
  }, []);

  // Sync chats from Firebase Realtime Database
  useEffect(() => {
    if (!user) {
      setChats([]);
      return;
    }

    const chatsRef = ref(database, `users/${user.id}/chats`);
    const unsubscribe = onValue(chatsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert object to array if needed, or just use the array
        // Firebase might store arrays as objects with numeric keys if sparse
        const rawChats = Array.isArray(data) ? data : Object.values(data);
        const loadedChats = rawChats.map((c: any) => ({
          ...c,
          messages: Array.isArray(c.messages) ? c.messages : []
        }));

        // Sort by updatedAt desc
        loadedChats.sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        setChats(loadedChats as Chat[]);

        // If no active chat, select the most recent one
        setActiveChatId(prev => {
          if (!prev && loadedChats.length > 0) {
            return loadedChats[0].id;
          }
          return prev;
        });

      } else {
        setChats([]);
        // If no chats, create one after initial load for this user
        if (user && !initialLoadDoneForUser.current[user.id]) {
          handleNewChat();
          initialLoadDoneForUser.current[user.id] = true;
        }
      }
    }, (error) => {
      console.error("Firebase onValue error:", error);
      // Don't crash, just log. User might see empty chats.
    });

    return () => unsubscribe();
  }, [user]);

  // Helper to save chats to Firebase
  const saveChatsToFirebase = async (newChats: Chat[]) => {
    if (!user) return;
    try {
      const chatsRef = ref(database, `users/${user.id}/chats`);
      await set(chatsRef, newChats);
    } catch (error) {
      console.error("Error saving chats to Firebase:", error);
      // We could show a toast here if we had one.
    }
  };

  // Derives the one true active chat object from the available chats and the last active ID.
  const activeChat = useMemo(() => {
    if (activeChatId) {
      const foundChat = chats.find(c => c.id === activeChatId);
      if (foundChat) {
        return foundChat;
      }
    }
    if (chats.length > 0) {
      return [...chats].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
    }
    return null;
  }, [chats, activeChatId]);

  useEffect(() => {
    const newActiveId = activeChat?.id || null;
    if (activeChatId !== newActiveId) {
      setActiveChatId(newActiveId);
    }
  }, [activeChat, activeChatId, setActiveChatId]);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = settings.language;
    root.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
    root.classList.remove('font-size-sm', 'font-size-base', 'font-size-lg');
    root.classList.add(`font-size-${settings.fontSize}`);
  }, [settings.language, settings.fontSize]);

  // Theme + appearance: an explicit choice wins, 'system' follows the OS and
  // keeps following it if the user flips their OS theme while the tab is open.
  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const apply = () => {
      const dark = settings.theme === 'dark' || (settings.theme === 'system' && media.matches);
      root.classList.toggle('dark', dark);
      applyAppearance({
        accentColor: settings.accentColor || DEFAULT_APPEARANCE.accentColor,
        sidebarColor: settings.sidebarColor || DEFAULT_APPEARANCE.sidebarColor,
        canvasColor: settings.canvasColor || '',
        bubbleColor: settings.bubbleColor || '',
        radius: settings.radius || DEFAULT_APPEARANCE.radius,
        density: settings.density || DEFAULT_APPEARANCE.density,
        ambient: settings.ambient !== false,
        dark,
      });

      const canvas = getComputedStyle(root).getPropertyValue('--c-canvas').trim();
      document.querySelectorAll('meta[name="theme-color"]').forEach((el) => {
        (el as HTMLMetaElement).content = canvas ? `rgb(${canvas})` : dark ? '#101313' : '#F7F8F6';
      });
    };

    apply();
    if (settings.theme !== 'system') return;
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [
    settings.theme,
    settings.accentColor,
    settings.sidebarColor,
    settings.canvasColor,
    settings.bubbleColor,
    settings.radius,
    settings.density,
    settings.ambient,
  ]);

  const handleLogin = (authenticatedUser: User) => {
    // Note: The onAuthStateChanged hook will handle setting the user.
    // This function primarily handles post-login navigation/setup logic.
    // We do NOT want to manipulate chats here because they are loading asynchronously from Firebase.
    // Creating a new chat here would overwrite the DB before data loads.
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setChats([]);
    setActiveChatId(null);
  };

  const handleNewChat = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsTyping(false);

    const newChat: Chat = {
      id: uuidv4(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updatedChats = [newChat, ...chats];
    setChats(updatedChats); // Optimistic update
    saveChatsToFirebase(updatedChats);

    setActiveChatId(newChat.id);
  }, [chats, setActiveChatId, user]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        handleNewChat();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleNewChat]);

  const handleSelectChat = (chatId: string) => {
    abortControllerRef.current?.abort();
    setIsTyping(false);
    setActiveChatId(chatId);
  };

  const handleDeleteChat = (chatId: string) => {
    const updatedChats = chats.filter(c => c.id !== chatId);
    setChats(updatedChats); // Optimistic update
    saveChatsToFirebase(updatedChats);
  };

  const handleRenameChat = (chatId: string, newTitle: string) => {
    if (!newTitle.trim()) return;

    const updatedChats = chats.map(c => {
      if (c.id === chatId) {
        return {
          ...c,
          title: newTitle.trim(),
          updatedAt: new Date().toISOString(),
        };
      }
      return c;
    });
    saveChatsToFirebase(updatedChats);
  };

  const handleClearConversations = () => {
    setChats([]); // Optimistic update
    saveChatsToFirebase([]);
    setActiveChatId(null);
    // handleNewChat will be called by user if they want, or we can trigger it
    // handleNewChat(); // This might cause issues if called immediately after clearing
  };

  const handleShareChat = (chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      const shareText = chat.messages
        .map(m => `${m.role === 'user' ? 'You' : 'Assistant'}:\n${m.content}`)
        .join('\n\n');
      navigator.clipboard.writeText(shareText);
      setCopiedChatId(chatId);
      setTimeout(() => setCopiedChatId(null), 2000);
    }
  };

  const handleToggleSidebar = () => {
    setSettings(prev => ({ ...prev, sidebarCollapsed: !prev.sidebarCollapsed }));
  };

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const handleRateMessage = (chatId: string, messageId: string, rating: 'like' | 'dislike') => {
    const updatedChats = chats.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          messages: chat.messages.map(msg => {
            if (msg.id === messageId) {
              return {
                ...msg,
                liked: rating === 'like' ? !msg.liked : false,
                disliked: rating === 'dislike' ? !msg.disliked : false,
              };
            }
            return msg;
          })
        };
      }
      return chat;
    });
    saveChatsToFirebase(updatedChats);
  };

  const handleStopGenerating = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsTyping(false);
  }, []);

  // Reveals the finished answer on a fixed timeline (~0.9s) rather than a fixed
  // per-character delay, so a long answer does not take half a minute to appear.
  // One update per animation frame; `Message` renders whatever it is given.
  const streamText = (
    text: string,
    onUpdate: (currentText: string) => void,
    signal: AbortSignal
  ) =>
    new Promise<void>(resolve => {
      if (!text) {
        onUpdate('');
        resolve();
        return;
      }

      const DURATION = 900;
      const start = performance.now();

      const tick = () => {
        if (signal.aborted) {
          resolve();
          return;
        }

        const progress = Math.min(1, (performance.now() - start) / DURATION);
        // Ease-out so the tail of a long answer does not crawl.
        const eased = 1 - Math.pow(1 - progress, 2);
        onUpdate(text.slice(0, Math.max(1, Math.ceil(text.length * eased))));

        if (progress >= 1) {
          onUpdate(text);
          resolve();
          return;
        }
        requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    });

  const handleSendMessage = async (message: string) => {
    const currentChatId = activeChat?.id;
    if (!currentChatId) return;

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const chatBeforeSend = chats.find(c => c.id === currentChatId);
    const isFirstExchange = chatBeforeSend?.messages.length === 0;

    const userMessage: Message = {
      id: uuidv4(),
      role: MessageRole.USER,
      content: message,
      timestamp: new Date().toISOString(),
    };

    const assistantMessageId = uuidv4();
    const assistantPlaceholder: Message = {
      id: assistantMessageId,
      role: MessageRole.ASSISTANT,
      content: '', // Start empty for streaming
      timestamp: new Date().toISOString(),
    };

    const updatedChats = chats.map(c => {
      if (c.id === currentChatId) {
        return {
          ...c,
          messages: [...c.messages, userMessage, assistantPlaceholder],
          updatedAt: new Date().toISOString(),
        };
      }
      return c;
    });

    setChats(updatedChats);
    saveChatsToFirebase(updatedChats);
    setIsTyping(true);

    try {
      const response = await askQuestion(message, currentChatId, controller);

      // Start simulated streaming
      await streamText(
        response.result,
        (currentText) => {
          setChats(prevChats => prevChats.map(c => {
            if (c.id === currentChatId) {
              return {
                ...c,
                messages: c.messages.map(m =>
                  m.id === assistantMessageId
                    ? { ...m, content: currentText }
                    : m
                ),
              };
            }
            return c;
          }));
        },
        controller.signal
      );

      // After streaming is done, update with video path if available
      setChats(prevChats => {
        const finalChats = prevChats.map(c => {
          if (c.id === currentChatId) {
            return {
              ...c,
              messages: c.messages.map(m =>
                m.id === assistantMessageId
                  ? { ...m, content: response.result, video_path: response.video_path }
                  : m
              ),
            };
          }
          return c;
        });

        // Save to Firebase only after full response
        saveChatsToFirebase(finalChats);
        return finalChats;
      });

      if (isFirstExchange) {
        setChats(prevChats => {
          const titledChats = prevChats.map(c =>
            c.id === currentChatId
              ? { ...c, title: message.substring(0, 30) || 'New Chat' }
              : c
          );
          saveChatsToFirebase(titledChats);
          return titledChats;
        });
      }

    } catch (error) {
      console.error('Error asking question:', error);
      let errorMessage = 'An unknown error occurred.';

      if (error instanceof Error) {
        if (error.name === 'AbortError') return;
        errorMessage = error.message;
      }

      setChats(prevChats => {
        const errorChats = prevChats.map(c => {
          if (c.id === currentChatId) {
            return {
              ...c,
              messages: c.messages.map(m =>
                m.id === assistantMessageId
                  ? { ...m, content: `Sorry, I encountered an error: ${errorMessage}` }
                  : m
              ),
            };
          }
          return c;
        });
        saveChatsToFirebase(errorChats);
        return errorChats;
      });
    } finally {
      setIsTyping(false);
      abortControllerRef.current = null;
    }
  };

  const handleRegenerate = async () => {
    const currentChatId = activeChat?.id;
    if (!currentChatId) return;

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const chatToUpdate = chats.find(c => c.id === currentChatId);
    if (!chatToUpdate) return;

    const lastUserMessageIndex = chatToUpdate.messages.map(m => m.role).lastIndexOf(MessageRole.USER);
    if (lastUserMessageIndex === -1) return;

    const messagesForContext = chatToUpdate.messages.slice(0, lastUserMessageIndex + 1);
    const lastUserMessage = messagesForContext[messagesForContext.length - 1];

    if (!lastUserMessage?.content) return;

    const assistantMessageId = uuidv4();
    const assistantPlaceholder: Message = {
      id: assistantMessageId,
      role: MessageRole.ASSISTANT,
      content: '',
      timestamp: new Date().toISOString(),
    };

    const updatedChats = chats.map(c =>
      c.id === currentChatId
        ? { ...c, messages: [...messagesForContext, assistantPlaceholder] }
        : c
    );
    setChats(updatedChats);
    saveChatsToFirebase(updatedChats);
    setIsTyping(true);

    try {
      const response = await askQuestion(lastUserMessage.content, currentChatId, controller);

      await streamText(
        response.result,
        (currentText) => {
          setChats(prevChats => prevChats.map(c => {
            if (c.id === currentChatId) {
              return {
                ...c,
                messages: c.messages.map(m =>
                  m.id === assistantMessageId
                    ? { ...m, content: currentText }
                    : m
                ),
              };
            }
            return c;
          }));
        },
        controller.signal
      );

      setChats(prevChats => {
        const finalChats = prevChats.map(c => {
          if (c.id === currentChatId) {
            return {
              ...c,
              messages: c.messages.map(m =>
                m.id === assistantMessageId
                  ? { ...m, content: response.result, video_path: response.video_path }
                  : m
              ),
            };
          }
          return c;
        });
        saveChatsToFirebase(finalChats);
        return finalChats;
      });

    } catch (error) {
      console.error('Error regenerating response:', error);
      let errorMessage = 'An unknown error occurred.';

      if (error instanceof Error) {
        if (error.name === 'AbortError') return;
        errorMessage = error.message;
      }

      setChats(prevChats => {
        const errorChats = prevChats.map(c => {
          if (c.id === currentChatId) {
            return {
              ...c,
              messages: c.messages.map(m =>
                m.id === assistantMessageId
                  ? { ...m, content: `Sorry, I encountered an error: ${errorMessage}` }
                  : m
              ),
            };
          }
          return c;
        });
        saveChatsToFirebase(errorChats);
        return errorChats;
      });
    } finally {
      setIsTyping(false);
      abortControllerRef.current = null;
    }
  };

  if (isLoadingUser) {
    return <SplashScreen />;
  }

  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <ChatPage
      user={user}
      chats={chats}
      activeChat={activeChat}
      isTyping={isTyping}
      settings={settings}
      copiedChatId={copiedChatId}
      onSendMessage={handleSendMessage}
      onNewChat={handleNewChat}
      onSelectChat={handleSelectChat}
      onDeleteChat={handleDeleteChat}
      onShareChat={handleShareChat}
      onClearConversations={handleClearConversations}
      onLogout={handleLogout}
      onToggleSidebar={handleToggleSidebar}
      onRateMessage={handleRateMessage}
      onRegenerate={handleRegenerate}
      onStopGenerating={handleStopGenerating}
      onRenameChat={handleRenameChat}
      onUpdateSettings={handleUpdateSettings}
    />
  );
};

export default App;
