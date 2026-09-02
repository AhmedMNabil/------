import React, { useState, useRef, useEffect, useMemo } from 'react';
import { User, Chat, ThemePreference } from '../types';
import { groupChatsByDate } from '../utils';
import { LogoLockup } from './Logo';
import { totalLessons, courseSections, toArabicDigits } from '../course';
import {
  EditIcon,
  TrashIcon,
  ShareIcon,
  CheckIcon,
  UserAvatarIcon,
  SettingsIcon,
  LogoutIcon,
  SearchIcon,
  PlayCircleIcon,
  SidebarIcon,
  SunIcon,
  MoonIcon,
  MonitorIcon,
  PlusIcon,
} from './icons';

interface SidebarProps {
  user: User;
  chats: Chat[];
  activeChatId: string | null;
  copiedChatId: string | null;
  theme: ThemePreference;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onShareChat: (chatId: string) => void;
  onLogout: () => void;
  onOpenSettings: () => void;
  onToggle: () => void;
  onRenameChat: (chatId: string, newTitle: string) => void;
  onOpenCourse: () => void;
  onSetTheme: (theme: ThemePreference) => void;
}

const THEME_OPTIONS: { value: ThemePreference; label: string; Icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
  { value: 'light', label: 'فاتح', Icon: SunIcon },
  { value: 'dark', label: 'داكن', Icon: MoonIcon },
  { value: 'system', label: 'النظام', Icon: MonitorIcon },
];

const ThemeSwitch: React.FC<{ theme: ThemePreference; onSetTheme: (t: ThemePreference) => void }> = ({
  theme,
  onSetTheme,
}) => (
  <div className="flex items-center gap-0.5 rounded-lg border border-nav-line bg-nav-ink/[0.04] p-0.5">
    {THEME_OPTIONS.map(({ value, label, Icon }) => (
      <button
        key={value}
        onClick={() => onSetTheme(value)}
        title={label}
        aria-label={label}
        aria-pressed={theme === value}
        className={`flex flex-1 items-center justify-center rounded-md py-1 transition-colors ${
          theme === value ? 'bg-nav-ink/10 text-nav-ink' : 'text-nav-faint hover:text-nav-muted'
        }`}
      >
        <Icon className="h-3.5 w-3.5" />
      </button>
    ))}
  </div>
);

const Sidebar: React.FC<SidebarProps> = ({
  user,
  chats,
  activeChatId,
  copiedChatId,
  theme,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onShareChat,
  onLogout,
  onOpenSettings,
  onToggle,
  onRenameChat,
  onOpenCourse,
  onSetTheme,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [newChatTitle, setNewChatTitle] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const groupedChats = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const filtered = term
      ? chats.filter((c) => c.title.toLowerCase().includes(term))
      : chats;
    return groupChatsByDate(filtered);
  }, [chats, searchTerm]);

  const isEmpty = Object.keys(groupedChats).length === 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (editingChatId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingChatId]);

  const handleStartEditing = (chat: Chat) => {
    setEditingChatId(chat.id);
    setNewChatTitle(chat.title);
  };

  const handleSaveRename = (chatId: string) => {
    if (newChatTitle.trim()) onRenameChat(chatId, newChatTitle);
    setEditingChatId(null);
  };

  return (
    <aside className="flex h-full w-[var(--side-w)] flex-col bg-nav text-nav-ink">
      <div className="flex items-center gap-1 px-2.5 py-2">
        <LogoLockup onNav compact className="min-w-0 flex-1" />
        <button
          onClick={onToggle}
          title="إخفاء الشريط الجانبي"
          aria-label="إخفاء الشريط الجانبي"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-nav-muted transition-colors hover:bg-nav-ink/[0.08] hover:text-nav-ink"
        >
          <SidebarIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-1.5 px-2.5 pb-2">
        <button
          onClick={onNewChat}
          className="flex w-full items-center gap-2 rounded-xl bg-brand px-2.5 py-2 text-[13px] font-bold text-brand-ink shadow-brand/40 transition-all hover:opacity-90 active:scale-[0.98]"
          title="محادثة جديدة (Ctrl+K)"
        >
          <PlusIcon className="h-4 w-4" />
          <span>محادثة جديدة</span>
          <kbd className="ms-auto hidden rounded-md bg-brand-ink/15 px-1.5 py-0.5 font-latin text-[10px] font-medium text-brand-ink/80 xl:inline">
            Ctrl+K
          </kbd>
        </button>

        <button
          onClick={onOpenCourse}
          className="flex w-full items-center gap-2 rounded-xl border border-nav-line bg-nav-ink/[0.04] px-2.5 py-2 text-start text-[13px] font-medium text-nav-ink transition-colors hover:bg-nav-ink/[0.08]"
        >
          <PlayCircleIcon className="h-4 w-4 shrink-0 text-accent" />
          <span className="min-w-0 flex-1">
            <span className="block">مشاهدة الكورس</span>
            <span className="block text-[10px] font-normal text-nav-faint">
              {toArabicDigits(totalLessons)} درس · {toArabicDigits(courseSections.length)} أقسام
            </span>
          </span>
        </button>

        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-nav-faint ltr:left-2.5 rtl:right-2.5" />
          <input
            type="text"
            placeholder="بحث في المحادثات"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-nav-line bg-nav-ink/[0.04] py-1.5 text-[13px] text-nav-ink placeholder:text-nav-faint focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/20 ltr:pl-8 ltr:pr-2 rtl:pr-8 rtl:pl-2"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-1.5 pb-1">
        {isEmpty ? (
          <p className="px-2 py-6 text-center text-xs text-nav-faint">
            {searchTerm ? 'مفيش نتائج للبحث ده.' : 'لسه مفيش محادثات.'}
          </p>
        ) : (
          Object.entries(groupedChats).map(([group, chatsInGroup]) => (
            <div key={group} className="mb-0.5">
              <h3 className="px-2 pb-0.5 pt-2 text-[10px] font-semibold text-nav-faint">{group}</h3>
              <ul className="space-y-px">
                {chatsInGroup.map((chat) => {
                  const isActive = activeChatId === chat.id;
                  const isEditing = editingChatId === chat.id;
                  const isConfirming = confirmDeleteId === chat.id;

                  return (
                    <li key={chat.id}>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => !isEditing && onSelectChat(chat.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !isEditing) onSelectChat(chat.id);
                        }}
                        onDoubleClick={() => handleStartEditing(chat)}
                        className={`group flex cursor-pointer items-center gap-0.5 rounded-xl px-2 py-1.5 text-[13px] transition-colors ${
                          isActive
                            ? 'bg-nav-ink/12 font-medium text-nav-ink'
                            : 'text-nav-muted hover:bg-nav-ink/[0.06] hover:text-nav-ink'
                        }`}
                      >
                        {isEditing ? (
                          <input
                            ref={editInputRef}
                            type="text"
                            value={newChatTitle}
                            onChange={(e) => setNewChatTitle(e.target.value)}
                            onBlur={() => handleSaveRename(chat.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRename(chat.id);
                              if (e.key === 'Escape') setEditingChatId(null);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full min-w-0 rounded-md border border-brand/50 bg-nav px-1.5 py-0.5 text-[13px] text-nav-ink focus:outline-none"
                          />
                        ) : (
                          <span className="min-w-0 flex-1 truncate">{chat.title}</span>
                        )}

                        {!isEditing && (
                          <div
                            className={`flex shrink-0 items-center gap-0.5 transition-opacity ${
                              isConfirming ? 'opacity-100' : 'opacity-0 focus-within:opacity-100 group-hover:opacity-100'
                            }`}
                          >
                            {isConfirming ? (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteChat(chat.id);
                                    setConfirmDeleteId(null);
                                  }}
                                  className="rounded-md px-1.5 py-0.5 text-[11px] font-semibold text-danger hover:bg-danger/15"
                                >
                                  حذف
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmDeleteId(null);
                                  }}
                                  className="rounded-md px-1.5 py-0.5 text-[11px] text-nav-faint hover:text-nav-ink"
                                >
                                  إلغاء
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartEditing(chat);
                                  }}
                                  title="إعادة تسمية"
                                  className="rounded-md p-1 text-nav-faint transition-colors hover:bg-nav-ink/10 hover:text-nav-ink"
                                >
                                  <EditIcon className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onShareChat(chat.id);
                                  }}
                                  title={copiedChatId === chat.id ? 'تم النسخ' : 'نسخ المحادثة'}
                                  className="rounded-md p-1 text-nav-faint transition-colors hover:bg-nav-ink/10 hover:text-nav-ink"
                                >
                                  {copiedChatId === chat.id ? (
                                    <CheckIcon className="h-3.5 w-3.5 text-brand" />
                                  ) : (
                                    <ShareIcon className="h-3.5 w-3.5" />
                                  )}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmDeleteId(chat.id);
                                  }}
                                  title="حذف"
                                  className="rounded-md p-1 text-nav-faint transition-colors hover:bg-danger/15 hover:text-danger"
                                >
                                  <TrashIcon className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </div>

      <div className="space-y-1.5 border-t border-nav-line px-2.5 py-2" ref={menuRef}>
        <ThemeSwitch theme={theme} onSetTheme={onSetTheme} />

        <div className="relative">
          {menuOpen && (
            <div className="absolute bottom-full mb-1.5 w-full overflow-hidden rounded-lg border border-nav-line bg-nav shadow-pop animate-fade-in">
              <button
                onClick={() => {
                  onOpenSettings();
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2.5 px-2.5 py-2 text-[13px] text-nav-ink transition-colors hover:bg-nav-ink/[0.06]"
              >
                <SettingsIcon className="h-4 w-4 text-nav-muted" />
                <span>الإعدادات</span>
              </button>
              <div className="border-t border-nav-line" />
              <button
                onClick={onLogout}
                className="flex w-full items-center gap-2.5 px-2.5 py-2 text-[13px] text-danger transition-colors hover:bg-danger/10"
              >
                <LogoutIcon className="h-4 w-4" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex w-full items-center gap-2 rounded-xl p-1.5 text-start transition-colors hover:bg-nav-ink/[0.06]"
          >
            <UserAvatarIcon name={user.name} className="h-8 w-8 shrink-0 text-xs" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold text-nav-ink">{user.name}</span>
              <span className="block truncate font-latin text-[10px] text-nav-faint">{user.email}</span>
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
