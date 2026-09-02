import React from 'react';

const Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    {props.children}
  </svg>
);

export const EditIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
  </Icon>
);

export const ShareIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.186 2.25 2.25 0 00-3.933 2.186z" />
  </Icon>
);

export const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </Icon>
);

export const CopyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a2.25 2.25 0 01-2.25 2.25h-1.5a2.25 2.25 0 01-2.25-2.25v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
  </Icon>
);

export const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </Icon>
);

export const RegenerateIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </Icon>
);

export const ThumbsUpIcon: React.FC<React.SVGProps<SVGSVGElement> & { solid?: boolean }> = ({ solid, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill={solid ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
  </svg>
);

export const ThumbsDownIcon: React.FC<React.SVGProps<SVGSVGElement> & { solid?: boolean }> = ({ solid, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill={solid ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
  </svg>
);

export const SendIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
  </svg>
);

export const StopIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" />
  </svg>
);

export const SettingsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </Icon>
);

export const LogoutIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
  </Icon>
);

export const MenuIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </Icon>
);

export const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </Icon>
);

export const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </Icon>
);

export const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </Icon>
);

export const DotsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
  </Icon>
);

export const PlayCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
  </Icon>
);

export const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </Icon>
);

export const ChevronUpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
  </Icon>
);

export const AppIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 2.2l.95 2.55L15.5 5.7l-2.55.95L12 9.2l-.95-2.55L8.5 5.7l2.55-.95L12 2.2z" />
        <path d="M4.2 9.4c2.7-1.15 5.4-.65 7.8.95v8.3c-2.5-1.55-5.3-2.15-8.5-1.05V9.4z" />
        <path d="M19.8 9.4c-2.7-1.15-5.4-.65-7.8.95v8.3c2.5-1.55 5.3-2.15 8.5-1.05V9.4z" opacity="0.82" />
    </svg>
);

export const UserAvatarIcon: React.FC<{ name: string; className?: string }> = ({ name, className }) => (
    <div
      className={`flex items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand/70 font-bold text-brand-ink ${className}`}
    >
        {(name?.trim()?.charAt(0) || '؟').toUpperCase()}
    </div>
);

// Demo component
export default function IconShowcase() {
  const iconSize = "w-6 h-6";
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">ChatGPT-Style Icons</h1>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <IconCard name="Edit" icon={<EditIcon className={iconSize} />} />
          <IconCard name="Share" icon={<ShareIcon className={iconSize} />} />
          <IconCard name="Trash" icon={<TrashIcon className={iconSize} />} />
          <IconCard name="Copy" icon={<CopyIcon className={iconSize} />} />
          <IconCard name="Check" icon={<CheckIcon className={iconSize} />} />
          <IconCard name="Regenerate" icon={<RegenerateIcon className={iconSize} />} />
          <IconCard name="Thumbs Up" icon={<ThumbsUpIcon className={iconSize} />} />
          <IconCard name="Thumbs Down" icon={<ThumbsDownIcon className={iconSize} />} />
          <IconCard name="Send" icon={<SendIcon className={iconSize} />} />
          <IconCard name="Stop" icon={<StopIcon className={iconSize} />} />
          <IconCard name="Settings" icon={<SettingsIcon className={iconSize} />} />
          <IconCard name="Logout" icon={<LogoutIcon className={iconSize} />} />
          <IconCard name="Menu" icon={<MenuIcon className={iconSize} />} />
          <IconCard name="Close" icon={<CloseIcon className={iconSize} />} />
          <IconCard name="Search" icon={<SearchIcon className={iconSize} />} />
          <IconCard name="Plus" icon={<PlusIcon className={iconSize} />} />
          <IconCard name="Dots" icon={<DotsIcon className={iconSize} />} />
          <IconCard name="App (ChatGPT Logo)" icon={<AppIcon className={iconSize} />} />
        </div>

        <div className="mt-8 p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">User Avatar</h2>
          <div className="flex items-center gap-4">
            <UserAvatarIcon name="John Doe" className="w-10 h-10 text-sm" />
            <UserAvatarIcon name="Sarah Smith" className="w-12 h-12" />
            <UserAvatarIcon name="Mike Wilson" className="w-14 h-14 text-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

function IconCard({ name, icon }: { name: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex flex-col items-center gap-3">
        <div className="text-gray-700">{icon}</div>
        <p className="text-sm text-gray-600 text-center">{name}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Added for the redesigned shell. Stroke-based so they inherit currentColor
// and stay legible in both themes at 16-20px.
// ---------------------------------------------------------------------------

const stroke = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
};

export const SunIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
);

export const MoonIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
);

export const MonitorIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
        <rect x="2" y="4" width="20" height="13" rx="2" />
        <path d="M8 21h8M12 17v4" />
    </svg>
);

export const ArrowDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
        <path d="M12 5v14M19 12l-7 7-7-7" />
    </svg>
);

export const SidebarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M9 4v16" />
    </svg>
);

export const SparkleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 2.5l1.9 5.1a4 4 0 0 0 2.4 2.4l5.2 1.9-5.2 1.9a4 4 0 0 0-2.4 2.4L12 21.5l-1.9-5.2a4 4 0 0 0-2.4-2.4L2.5 12l5.2-1.9a4 4 0 0 0 2.4-2.4L12 2.5z" />
        <path d="M19 2.5l.7 1.8a2 2 0 0 0 1 1L22.5 6l-1.8.7a2 2 0 0 0-1 1L19 9.5l-.7-1.8a2 2 0 0 0-1-1L15.5 6l1.8-.7a2 2 0 0 0 1-1L19 2.5z" opacity="0.65" />
    </svg>
);

export const VideoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
        <rect x="2" y="5" width="14" height="14" rx="2.5" />
        <path d="M16 10.5l5-3v9l-5-3z" />
    </svg>
);

export const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
        <path d="M12 3v12M7.5 10.5L12 15l4.5-4.5M4 19h16" />
    </svg>
);

export const EyeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
        <path d="M2.5 12s3.6-7 9.5-7 9.5 7 9.5 7-3.6 7-9.5 7-9.5-7-9.5-7z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

export const EyeOffIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
        <path d="M3 3l18 18M10.5 10.7a3 3 0 004 4" />
        <path d="M6.1 6.3C3.9 7.8 2.5 12 2.5 12s3.6 7 9.5 7c1.9 0 3.6-.5 5.1-1.3M17.7 15.4C20 13.8 21.5 12 21.5 12s-3.6-7-9.5-7c-.7 0-1.4.08-2.1.22" />
    </svg>
);

export const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3.6 19c.5-3 2.6-4.6 5.4-4.6s4.9 1.6 5.4 4.6" />
        <circle cx="17" cy="9" r="2.4" />
        <path d="M15.4 14.6c2.2.3 3.8 1.7 4.4 4.4" />
    </svg>
);

export const WalletIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
        <rect x="3" y="6" width="18" height="13" rx="2.5" />
        <path d="M3 10h18" />
        <circle cx="16.5" cy="14.5" r="1" fill="currentColor" stroke="none" />
    </svg>
);

export const RocketIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
        <path d="M12 3c3.2 1.2 6 4.4 6 9.2 0 2.2-.6 4-1.4 5.5l-4.6 1.3-4.6-1.3C6.6 16.2 6 14.4 6 12.2 6 7.4 8.8 4.2 12 3z" />
        <path d="M9.2 20.2c.8-.8 1.7-1.2 2.8-1.2s2 .4 2.8 1.2" />
        <circle cx="12" cy="11" r="1.6" />
    </svg>
);

export const MegaphoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
        <path d="M4 10v4c0 .8.6 1.5 1.4 1.6L9 16.2V9.8L5.4 10.4C4.6 10.5 4 11.2 4 12z" />
        <path d="M9 9.8l9.2-3.4v13.2L9 16.2z" />
        <path d="M9.4 16.4l.8 3.4c.1.6.7 1 1.3.9l1.7-.3" />
    </svg>
);

export const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12.3l2.6 2.6L16.4 9.2" />
    </svg>
);

export const PaletteIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
        <path d="M12 3a9 9 0 1 0 0 18h1.2a2.4 2.4 0 0 0 2.3-3.1 2.4 2.4 0 0 1 2.2-3.3H19a3 3 0 0 0 3-3.2A9 9 0 0 0 12 3z" />
        <circle cx="7.5" cy="10" r="1" fill="currentColor" stroke="none" />
        <circle cx="10.5" cy="7.2" r="1" fill="currentColor" stroke="none" />
        <circle cx="14.5" cy="7.6" r="1" fill="currentColor" stroke="none" />
        <circle cx="16.6" cy="11" r="1" fill="currentColor" stroke="none" />
    </svg>
);

export const SlidersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
        <path d="M4 8h16M4 16h16M8 5v6M16 13v6" />
    </svg>
);

export const ResetIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
        <path d="M3.5 12a8.5 8.5 0 1 0 2.1-5.6" />
        <path d="M3.5 4.5v4.2H7.8" />
    </svg>
);

export const KeyboardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M7 10h.01M11 10h.01M15 10h.01M7 14h10" />
    </svg>
);

export const SkipPrevIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
        <path d="M7 5v14M18 6.2v11.6L9.5 12 18 6.2z" />
    </svg>
);

export const SkipNextIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
        <path d="M17 5v14M6 6.2v11.6L14.5 12 6 6.2z" />
    </svg>
);

export const MaximizeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
        <path d="M8 4H4v4M16 4h4v4M8 20H4v-4M16 20h4v-4" />
    </svg>
);

export const ListIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
        <path d="M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01" />
    </svg>
);
