import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SendIcon, StopIcon, SparkleIcon } from './icons';

interface ChatInputProps {
    onSendMessage: (msg: string) => void;
    isTyping: boolean;
    onStopGenerating: () => void;
}

const MAX_HEIGHT = 208;

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isTyping, onStopGenerating }) => {
    const [input, setInput] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const submitLock = useRef(false);
    const hasInput = input.trim().length > 0;

    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = 'auto';
        const next = Math.min(el.scrollHeight, MAX_HEIGHT);
        el.style.height = `${next}px`;
        el.style.overflowY = el.scrollHeight > MAX_HEIGHT ? 'auto' : 'hidden';
    }, [input]);

    useEffect(() => {
        if (!isTyping) {
            submitLock.current = false;
            textareaRef.current?.focus();
        }
    }, [isTyping]);

    const handleSubmit = useCallback(
        (e?: React.FormEvent | React.KeyboardEvent) => {
            e?.preventDefault();
            if (!hasInput || isTyping || submitLock.current) return;
            submitLock.current = true;
            onSendMessage(input.trim());
            setInput('');
        },
        [hasInput, isTyping, input, onSendMessage],
    );

    return (
        <div className="w-full shrink-0 bg-gradient-to-t from-canvas via-canvas/95 to-transparent px-3 pb-3 pt-2 sm:px-4 sm:pb-5">
            <div className="mx-auto w-full max-w-3xl">
                <form
                    onSubmit={handleSubmit}
                    className="group relative flex items-end gap-2 border border-line bg-elevated/90 p-2 shadow-composer backdrop-blur-md transition-all duration-200 focus-within:border-brand/55 focus-within:shadow-[0_0_0_4px_rgb(var(--c-brand)/0.12)]"
                    style={{ borderRadius: 'var(--r-composer)' }}
                >
                    <span className="mb-1.5 hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand sm:flex">
                        <SparkleIcon className="h-3.5 w-3.5" />
                    </span>

                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                                handleSubmit(e);
                            }
                        }}
                        placeholder="اسأل عن أي حاجة في الكورس…"
                        rows={1}
                        aria-label="اكتب رسالتك"
                        dir="auto"
                        className="max-h-[208px] min-h-[28px] flex-1 resize-none bg-transparent px-2 py-2 leading-relaxed text-ink placeholder:text-faint focus:outline-none disabled:opacity-60 sm:px-1"
                        style={{ height: '44px' }}
                        disabled={isTyping}
                    />

                    <button
                        type={isTyping ? 'button' : 'submit'}
                        onClick={isTyping ? onStopGenerating : undefined}
                        disabled={!isTyping && !hasInput}
                        aria-label={isTyping ? 'إيقاف التوليد' : 'إرسال'}
                        title={isTyping ? 'إيقاف التوليد' : 'إرسال'}
                        className={`mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
                            isTyping
                                ? 'bg-ink text-canvas hover:opacity-85'
                                : hasInput
                                  ? 'scale-100 bg-brand text-brand-ink shadow-brand hover:opacity-90'
                                  : 'scale-95 cursor-not-allowed bg-ink/10 text-faint'
                        }`}
                    >
                        {isTyping ? <StopIcon className="h-3.5 w-3.5" /> : <SendIcon className="h-[18px] w-[18px] rtl:-scale-x-100" />}
                    </button>
                </form>

                <p className="mt-2.5 text-center text-[11px] leading-4 text-faint">
                    الإجابات مبنية على محتوى الكورس. Enter للإرسال · Shift+Enter لسطر جديد
                </p>
            </div>
        </div>
    );
};

export default ChatInput;
