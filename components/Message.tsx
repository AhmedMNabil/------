import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message as MessageType, MessageRole } from '../types';
import {
  CopyIcon,
  CheckIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  RegenerateIcon,
  VideoIcon,
} from './icons';
import { LogoMark } from './Logo';
import { getVideoUrl } from '../services/api';

declare global {
  interface Window {
    Prism: { highlightElement(element: Element): void };
  }
}

interface MessageProps {
  message: MessageType;
  isTyping?: boolean;
  isLastMessage?: boolean;
  onRateMessage?: (rating: 'like' | 'dislike') => void;
  onRegenerate?: () => void;
}

const ARABIC = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;

/** Flattens ReactMarkdown's code children down to a copyable string. */
const toText = (node: React.ReactNode): string => {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(toText).join('');
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) return toText(node.props.children);
  return '';
};

const ThinkingIndicator: React.FC = () => (
  <div className="flex items-center gap-2.5 py-1">
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-breathe rounded-full bg-brand"
          style={{ animationDelay: `${i * 160}ms` }}
        />
      ))}
    </div>
    <span className="text-sm text-muted">بيراجع محتوى الكورس…</span>
  </div>
);

/** Copy button used by both the code block and the message action row. */
const useCopy = (getText: () => string) => {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(getText()).then(
      () => {
        setCopied(true);
        if (timer.current) window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setCopied(false), 1800);
      },
      () => {},
    );
  }, [getText]);

  return [copied, copy] as const;
};

const CodeBlock: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const codeEl = React.Children.toArray(children).find(
    (c): c is React.ReactElement<{ className?: string; children?: React.ReactNode }> =>
      React.isValidElement(c) && c.type === 'code',
  );

  const language = codeEl?.props.className?.replace(/^language-/, '') || '';
  const source = useMemo(() => toText(codeEl?.props.children ?? children), [codeEl, children]);
  const ref = useRef<HTMLElement>(null);
  const [copied, copy] = useCopy(() => source);

  useEffect(() => {
    if (ref.current && window.Prism) window.Prism.highlightElement(ref.current);
  }, [source, language]);

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-line/70 bg-[#1e1f22]" dir="ltr">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
        <span className="font-latin text-[11px] font-medium uppercase tracking-wide text-white/45">
          {language || 'code'}
        </span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 rounded-md px-1.5 py-1 font-latin text-[11px] text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          {copied ? <CheckIcon className="h-3.5 w-3.5" /> : <CopyIcon className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="!m-0 overflow-x-auto !bg-transparent !p-4 font-latin text-[13px] leading-relaxed">
        <code ref={ref} className={language ? `language-${language}` : undefined}>
          {source}
        </code>
      </pre>
    </div>
  );
};

const VideoCard: React.FC<{ path: string }> = ({ path }) => {
  const [failed, setFailed] = useState(false);

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-surface not-prose">
      <div className="flex items-center gap-2 border-b border-line px-3 py-2">
        <VideoIcon className="h-4 w-4 text-brand" />
        <span className="text-xs font-medium text-muted">المقطع المرتبط بالإجابة</span>
      </div>
      {failed ? (
        <p className="px-3 py-6 text-center text-xs text-muted">تعذّر تحميل المقطع.</p>
      ) : (
        <video
          key={path}
          controls
          playsInline
          preload="metadata"
          src={getVideoUrl(path)}
          onError={() => setFailed(true)}
          className="block w-full bg-black"
        />
      )}
    </div>
  );
};

const ActionButton: React.FC<{
  onClick: () => void;
  label: string;
  active?: boolean;
  children: React.ReactNode;
}> = ({ onClick, label, active, children }) => (
  <button
    onClick={onClick}
    title={label}
    aria-label={label}
    className={`rounded-lg p-1.5 transition-colors hover:bg-ink/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
      active ? 'text-brand' : 'text-faint hover:text-ink'
    }`}
  >
    {children}
  </button>
);

const Message: React.FC<MessageProps> = ({
  message,
  isTyping = false,
  isLastMessage = false,
  onRateMessage,
  onRegenerate,
}) => {
  const isUser = message.role === MessageRole.USER;
  const isRTL = useMemo(() => ARABIC.test(message.content), [message.content]);
  const [copied, copy] = useCopy(() => message.content);

  // The assistant placeholder is empty until the first chunk arrives.
  if (!message.content && !isTyping && !isUser) return null;

  const awaitingFirstChunk = !message.content && isTyping;
  const isStreaming = isTyping && isLastMessage && !isUser && !!message.content;
  const showActions = !isUser && !isTyping && !!message.content;

  if (isUser) {
    return (
      <div className="w-full px-4">
        <div className="mx-auto flex max-w-3xl justify-end" style={{ paddingTop: 'var(--msg-y)', paddingBottom: 'var(--msg-y)' }}>
          <div
            dir={isRTL ? 'rtl' : 'ltr'}
            className="max-w-[85%] animate-fade-up whitespace-pre-wrap break-words bg-bubble px-4 py-2.5 leading-relaxed text-bubble-ink shadow-lift sm:max-w-[75%]"
            style={{ textAlign: isRTL ? 'right' : 'left', borderRadius: 'var(--r-composer)' }}
          >
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group/msg w-full px-4">
      <div className="mx-auto flex max-w-3xl gap-3" style={{ paddingTop: 'var(--msg-y)', paddingBottom: 'var(--msg-y)' }}>
        <div className="mt-0.5 shrink-0">
          <LogoMark size={32} className="ring-1 ring-line/70" alt="" />
        </div>

        <div className="min-w-0 flex-1">
          {awaitingFirstChunk ? (
            <ThinkingIndicator />
          ) : (
            <>
              <div
                dir={isRTL ? 'rtl' : 'ltr'}
                style={{ textAlign: isRTL ? 'right' : 'left' }}
                className={`prose max-w-none prose-headings:font-semibold prose-p:leading-[1.85] prose-strong:font-semibold prose-a:no-underline hover:prose-a:underline ${
                  isStreaming ? 'is-streaming' : ''
                }`}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ pre: CodeBlock }}>
                  {message.content}
                </ReactMarkdown>

                {!isTyping && message.video_path && <VideoCard path={message.video_path} />}
              </div>

              {showActions && (
                <div
                  className={`mt-1.5 flex items-center gap-0.5 transition-opacity duration-200 ${
                    isLastMessage ? 'opacity-100' : 'opacity-0 group-hover/msg:opacity-100'
                  }`}
                >
                  <ActionButton onClick={copy} label="نسخ" active={copied}>
                    {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                  </ActionButton>

                  {onRegenerate && (
                    <ActionButton onClick={onRegenerate} label="إعادة توليد الإجابة">
                      <RegenerateIcon className="h-4 w-4" />
                    </ActionButton>
                  )}

                  {onRateMessage && (
                    <>
                      <ActionButton
                        onClick={() => onRateMessage('like')}
                        label="إجابة مفيدة"
                        active={!!message.liked}
                      >
                        <ThumbsUpIcon className="h-4 w-4" solid={!!message.liked} />
                      </ActionButton>
                      <ActionButton
                        onClick={() => onRateMessage('dislike')}
                        label="إجابة غير مفيدة"
                        active={!!message.disliked}
                      >
                        <ThumbsDownIcon className="h-4 w-4" solid={!!message.disliked} />
                      </ActionButton>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;
