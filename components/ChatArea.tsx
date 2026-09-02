import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Chat, MessageRole } from '../types';
import { ArrowDownIcon } from './icons';
import WelcomeScreen from './WelcomeScreen';
import Message from './Message';
import ChatInput from './ChatInput';

interface ChatAreaProps {
  activeChat: Chat | null;
  isTyping: boolean;
  userName?: string;
  onSendMessage: (message: string) => void;
  onRateMessage: (chatId: string, messageId: string, rating: 'like' | 'dislike') => void;
  onRegenerate: () => void;
  onStopGenerating: () => void;
}

/** Distance from the bottom, in px, still considered "pinned". */
const PIN_THRESHOLD = 120;

const ChatArea: React.FC<ChatAreaProps> = ({
  activeChat,
  isTyping,
  userName,
  onSendMessage,
  onRateMessage,
  onRegenerate,
  onStopGenerating,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(true);

  const messages = activeChat?.messages ?? [];
  const isEmpty = messages.length === 0;
  const lastContent = messages[messages.length - 1]?.content ?? '';

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    setPinned(distance < PIN_THRESHOLD);
  }, []);

  // Follow new content only while the reader is already at the bottom, so
  // scrolling up to re-read an earlier answer is not yanked back down.
  useLayoutEffect(() => {
    if (pinned) scrollToBottom(isTyping ? 'auto' : 'smooth');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, lastContent, isTyping]);

  // Jump straight to the bottom when switching chats.
  useEffect(() => {
    setPinned(true);
    scrollToBottom('auto');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChat?.id]);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
      >
        {isEmpty ? (
          <div className="flex min-h-full items-center justify-center py-10">
            <WelcomeScreen userName={userName} onSelectPrompt={onSendMessage} />
          </div>
        ) : (
          <div className="py-4 sm:py-6">
            {messages.map((msg, index) => {
              const isLast = index === messages.length - 1;
              return (
                <Message
                  key={msg.id}
                  message={msg}
                  isLastMessage={isLast}
                  isTyping={isTyping && isLast && msg.role === MessageRole.ASSISTANT}
                  onRateMessage={(rating) => onRateMessage(activeChat!.id, msg.id, rating)}
                  onRegenerate={
                    isLast && msg.role === MessageRole.ASSISTANT && !isTyping ? onRegenerate : undefined
                  }
                />
              );
            })}
            <div className="h-4" />
          </div>
        )}
      </div>

      <div className="relative">
        {!isEmpty && !pinned && (
          <button
            onClick={() => scrollToBottom()}
            aria-label="النزول لآخر الرسائل"
            className="absolute -top-11 left-1/2 z-10 flex h-9 w-9 -translate-x-1/2 animate-fade-in items-center justify-center rounded-full border border-line bg-elevated/95 text-muted shadow-pop backdrop-blur-sm transition-colors hover:text-ink"
          >
            <ArrowDownIcon className="h-4 w-4" />
          </button>
        )}

        <ChatInput
          onSendMessage={onSendMessage}
          isTyping={isTyping}
          onStopGenerating={onStopGenerating}
        />
      </div>
    </div>
  );
};

export default ChatArea;
