import React, { useEffect, useState } from 'react';
import { User, Chat, AppSettings, ThemePreference } from '../types';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import { EditIcon, SidebarIcon, SparkleIcon, PaletteIcon } from './icons';
import { LogoMark } from './Logo';
import SettingsModal from './SettingsModal';
import CourseModal from './CourseModal';

interface ChatPageProps {
  user: User;
  chats: Chat[];
  activeChat: Chat | null;
  isTyping: boolean;
  settings: AppSettings;
  copiedChatId: string | null;
  onSendMessage: (message: string) => void;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onShareChat: (chatId: string) => void;
  onClearConversations: () => void;
  onLogout: () => void;
  onToggleSidebar: () => void;
  onRateMessage: (chatId: string, messageId: string, rating: 'like' | 'dislike') => void;
  onRegenerate: () => void;
  onStopGenerating: () => void;
  onRenameChat: (chatId: string, newTitle: string) => void;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

const iconBtn =
  'flex h-9 w-9 items-center justify-center rounded-xl text-muted transition-all hover:bg-ink/[0.06] hover:text-ink active:scale-95';

const ChatPage: React.FC<ChatPageProps> = (props) => {
  const { settings, onToggleSidebar, onUpdateSettings } = props;
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const setTheme = (theme: ThemePreference) => onUpdateSettings({ theme });

  useEffect(() => {
    if (!isDrawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsDrawerOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isDrawerOpen]);

  const sidebar = (
    <Sidebar
      user={props.user}
      chats={props.chats}
      activeChatId={props.activeChat?.id || null}
      copiedChatId={props.copiedChatId}
      theme={settings.theme}
      onNewChat={() => {
        props.onNewChat();
        setIsDrawerOpen(false);
      }}
      onSelectChat={(id) => {
        props.onSelectChat(id);
        setIsDrawerOpen(false);
      }}
      onDeleteChat={props.onDeleteChat}
      onShareChat={props.onShareChat}
      onLogout={props.onLogout}
      onOpenSettings={() => setIsSettingsOpen(true)}
      onToggle={() => {
        setIsDrawerOpen(false);
        onToggleSidebar();
      }}
      onRenameChat={props.onRenameChat}
      onOpenCourse={() => {
        setIsCourseModalOpen(true);
        setIsDrawerOpen(false);
      }}
      onSetTheme={setTheme}
    />
  );

  const hasMessages = (props.activeChat?.messages.length ?? 0) > 0;
  const title =
    hasMessages && props.activeChat?.title ? props.activeChat.title : 'التعليم هو الحل';

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-canvas text-ink">
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onClearConversations={props.onClearConversations}
        settings={settings}
        onUpdateSettings={onUpdateSettings}
        chats={props.chats}
      />
      <CourseModal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        onAskAboutLesson={(prompt) => {
          setIsCourseModalOpen(false);
          props.onSendMessage(prompt);
        }}
      />

      <div
        className={`hidden shrink-0 overflow-hidden bg-nav transition-[width] duration-300 ease-out lg:block ${
          settings.sidebarCollapsed ? 'w-0' : 'w-[var(--side-w)]'
        }`}
      >
        {!settings.sidebarCollapsed && sidebar}
      </div>

      <div
        className={`fixed inset-0 z-40 lg:hidden ${isDrawerOpen ? '' : 'pointer-events-none'}`}
        aria-hidden={!isDrawerOpen}
      >
        <div
          onClick={() => setIsDrawerOpen(false)}
          className={`absolute inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity duration-300 ${
            isDrawerOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div
          className={`absolute inset-y-0 w-[var(--side-w)] max-w-[85vw] overflow-hidden bg-nav shadow-pop transition-transform duration-300 ease-out ltr:left-0 rtl:right-0 ${
            isDrawerOpen ? 'translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full'
          }`}
        >
          {sidebar}
        </div>
      </div>

      <main className="app-ambient flex min-w-0 flex-1 flex-col">
        <header
          className="glass-header flex shrink-0 items-center gap-1 border-b border-line/70 px-2.5"
          style={{ height: 'var(--header-h)' }}
        >
          <button
            onClick={() => setIsDrawerOpen(true)}
            aria-label="فتح القائمة"
            className={`${iconBtn} lg:hidden`}
          >
            <SidebarIcon className="h-[18px] w-[18px]" />
          </button>

          {settings.sidebarCollapsed && (
            <button
              onClick={onToggleSidebar}
              aria-label="إظهار الشريط الجانبي"
              className={`${iconBtn} hidden lg:flex`}
            >
              <SidebarIcon className="h-[18px] w-[18px]" />
            </button>
          )}

          <div className="flex min-w-0 flex-1 items-center gap-2.5 px-1">
            <LogoMark
              size={30}
              className={`shrink-0 ring-1 ring-line/80 ${settings.sidebarCollapsed ? '' : 'lg:hidden'}`}
              alt=""
            />
            <div className="min-w-0">
              <h1 className="min-w-0 truncate text-sm font-bold tracking-tight text-ink">{title}</h1>
              <p className="hidden items-center gap-1.5 text-[11px] text-faint sm:flex">
                <SparkleIcon className="h-3 w-3 text-brand" />
                <span>مساعد الكورس</span>
                {props.isTyping && (
                  <>
                    <span className="text-line">·</span>
                    <span className="text-brand">بيكتب…</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSettingsOpen(true)}
            aria-label="المظهر والإعدادات"
            title="المظهر والإعدادات"
            className={`${iconBtn} max-sm:hidden`}
          >
            <PaletteIcon className="h-[18px] w-[18px]" />
          </button>

          <button
            onClick={props.onNewChat}
            aria-label="محادثة جديدة"
            title="محادثة جديدة"
            className={`${iconBtn} lg:hidden`}
          >
            <EditIcon className="h-[18px] w-[18px]" />
          </button>
        </header>

        <ChatArea
          activeChat={props.activeChat}
          isTyping={props.isTyping}
          userName={props.user.name}
          onSendMessage={props.onSendMessage}
          onRateMessage={props.onRateMessage}
          onRegenerate={props.onRegenerate}
          onStopGenerating={props.onStopGenerating}
        />
      </main>
    </div>
  );
};

export default ChatPage;
