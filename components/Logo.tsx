import React from 'react';

interface LogoMarkProps {
  size?: number;
  className?: string;
  alt?: string;
}

/** Raster brand mark — generated logo, sharp enough for UI chrome and splash. */
export const LogoMark: React.FC<LogoMarkProps> = ({
  size = 40,
  className = '',
  alt = 'التعليم هو الحل',
}) => (
  <img
    src="/logo-192.png"
    alt={alt}
    width={size}
    height={size}
    draggable={false}
    className={`select-none rounded-[22%] object-contain ${className}`}
    style={{ width: size, height: size }}
  />
);

interface LogoLockupProps {
  inverted?: boolean;
  onNav?: boolean;
  compact?: boolean;
  showTagline?: boolean;
  className?: string;
  markSize?: number;
}

export const LogoLockup: React.FC<LogoLockupProps> = ({
  inverted = false,
  onNav = false,
  compact = false,
  showTagline,
  className = '',
  markSize,
}) => {
  const tagline = showTagline ?? !compact;
  const size = markSize ?? (compact ? 28 : 42);
  const titleColor = onNav ? 'text-nav-ink' : inverted ? 'text-white' : 'text-ink';
  const subColor = onNav ? 'text-nav-muted' : inverted ? 'text-white/55' : 'text-muted';

  return (
    <div className={`flex min-w-0 items-center gap-2 ${className}`}>
      <LogoMark size={size} className="shrink-0" alt="" />
      <div className="min-w-0 text-start">
        <p
          className={`truncate font-extrabold leading-tight tracking-tight ${
            compact ? 'text-[13px]' : 'text-[15px]'
          } ${titleColor}`}
        >
          التعليم هو الحل
        </p>
        {tagline && (
          <p className={`truncate text-[11px] leading-4 ${subColor}`}>
            مساعد الكورس الذكي
          </p>
        )}
      </div>
    </div>
  );
};

export const SplashScreen: React.FC = () => (
  <div className="relative flex h-[100dvh] w-screen flex-col items-center justify-center overflow-hidden bg-nav">
    <div className="auth-mesh pointer-events-none absolute inset-0" />
    <LogoMark size={84} className="relative animate-logo-pulse drop-shadow-2xl" />
    <p className="relative mt-6 text-base font-extrabold text-white">التعليم هو الحل</p>
    <p className="relative mt-1.5 text-xs text-white/50">جاري تجهيز مساحتك…</p>
  </div>
);

export default LogoMark;
