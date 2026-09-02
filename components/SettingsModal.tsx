import React, { useEffect, useState } from 'react';
import { AppSettings, Chat, DensityPreference, RadiusPreference, ThemePreference } from '../types';
import {
  CloseIcon,
  TrashIcon,
  DownloadIcon,
  SunIcon,
  MoonIcon,
  MonitorIcon,
  CheckIcon,
  PaletteIcon,
  SlidersIcon,
  ResetIcon,
} from './icons';
import { LogoMark } from './Logo';
import {
  ACCENT_SWATCHES,
  APPEARANCE_PRESETS,
  BUBBLE_SWATCHES,
  CANVAS_SWATCHES,
  DEFAULT_ACCENT_COLOR,
  DEFAULT_APPEARANCE,
  DEFAULT_SIDEBAR_COLOR,
  SIDEBAR_PRESETS,
  appearanceFromPreset,
  isLightColor,
  matchingAppearancePreset,
  matchingPresetId,
  normalizeHex,
} from '../appearance';

declare global {
  interface Window {
    jspdf: any;
  }
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearConversations: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  chats: Chat[];
}

type TabId = 'look' | 'ui' | 'data';

const TABS: { id: TabId; label: string; Icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
  { id: 'look', label: 'المظهر', Icon: PaletteIcon },
  { id: 'ui', label: 'الواجهة', Icon: SlidersIcon },
  { id: 'data', label: 'البيانات', Icon: DownloadIcon },
];

const Row: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({
  label,
  hint,
  children,
}) => (
  <div className="flex flex-wrap items-center justify-between gap-3 py-3">
    <div className="min-w-0">
      <p className="text-sm font-medium text-ink">{label}</p>
      {hint && <p className="mt-0.5 text-xs leading-5 text-muted">{hint}</p>}
    </div>
    <div className="flex shrink-0 items-center gap-2">{children}</div>
  </div>
);

const Segment: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({
  active,
  onClick,
  children,
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
      active ? 'bg-ink text-canvas shadow-sm' : 'text-muted hover:bg-ink/[0.06] hover:text-ink'
    }`}
  >
    {children}
  </button>
);

const Swatch: React.FC<{
  hex: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}> = ({ hex, label, selected, onClick }) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    aria-pressed={selected}
    onClick={onClick}
    className={`relative h-8 w-8 rounded-full border-2 transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
      selected ? 'border-ink scale-105' : 'border-line'
    }`}
    style={{ backgroundColor: hex }}
  >
    {selected && (
      <CheckIcon className={`absolute inset-0 m-auto h-4 w-4 ${isLightColor(hex) ? 'text-ink' : 'text-white'}`} />
    )}
  </button>
);

const CustomPicker: React.FC<{
  value: string;
  selected: boolean;
  label: string;
  onChange: (hex: string) => void;
}> = ({ value, selected, label, onChange }) => (
  <label
    className={`relative flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 ${
      selected ? 'border-ink' : 'border-dashed border-line'
    }`}
    title={label}
  >
    <span
      className="absolute inset-0"
      style={{
        background: selected
          ? value
          : 'conic-gradient(from 90deg, #ef4444, #eab308, #22c55e, #3b82f6, #a855f7, #ef4444)',
      }}
    />
    <input
      type="color"
      aria-label={label}
      value={normalizeHex(value || DEFAULT_ACCENT_COLOR, DEFAULT_ACCENT_COLOR)}
      onChange={(e) => onChange(normalizeHex(e.target.value, DEFAULT_ACCENT_COLOR))}
      className="absolute inset-0 cursor-pointer opacity-0"
    />
  </label>
);

const ColorRow: React.FC<{
  label: string;
  hint: string;
  value: string;
  fallback: string;
  swatches: readonly { hex: string; label: string }[];
  onChange: (hex: string) => void;
  allowAuto?: boolean;
  autoLabel?: string;
}> = ({ label, hint, value, fallback, swatches, onChange, allowAuto, autoLabel = 'تلقائي' }) => {
  const current = value ? normalizeHex(value, fallback) : '';
  const isAuto = allowAuto && !value;
  return (
    <div className="py-3">
      <p className="text-sm font-medium text-ink">{label}</p>
      <p className="mt-0.5 text-xs leading-5 text-muted">{hint}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {allowAuto && (
          <button
            type="button"
            aria-pressed={isAuto}
            onClick={() => onChange('')}
            className={`h-8 rounded-full border-2 px-3 text-[11px] font-semibold transition-colors ${
              isAuto ? 'border-ink bg-ink text-canvas' : 'border-line text-muted hover:text-ink'
            }`}
          >
            {autoLabel}
          </button>
        )}
        {swatches.map((swatch) => (
          <Swatch
            key={swatch.hex}
            hex={swatch.hex}
            label={swatch.label}
            selected={!isAuto && current.toLowerCase() === swatch.hex.toLowerCase()}
            onClick={() => onChange(swatch.hex)}
          />
        ))}
        <CustomPicker
          value={current || fallback}
          selected={!isAuto && !swatches.some((s) => s.hex.toLowerCase() === current.toLowerCase())}
          label={`${label} مخصص`}
          onChange={onChange}
        />
      </div>
      <p className="mt-2 font-latin text-[11px] uppercase tracking-wide text-faint">
        {isAuto ? autoLabel : current}
      </p>
    </div>
  );
};

const LivePreview: React.FC = () => (
  <div className="overflow-hidden rounded-2xl border border-line bg-elevated shadow-lift">
    <div className="flex h-[108px]">
      <div className="flex w-[72px] shrink-0 flex-col gap-1.5 bg-nav p-2">
        <div className="h-1.5 w-10 rounded-full bg-nav-ink/25" />
        <div className="h-6 rounded-lg bg-brand" />
        <div className="h-1.5 w-full rounded-full bg-nav-ink/15" />
        <div className="h-1.5 w-8 rounded-full bg-nav-ink/10" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-end gap-1.5 bg-canvas p-2.5">
        <div className="ms-auto h-6 w-[42%] rounded-[var(--r-composer)] bg-bubble" />
        <div className="h-8 w-[58%] rounded-xl border border-line bg-elevated" />
        <div className="h-6 rounded-[var(--r-composer)] border border-line bg-elevated" />
      </div>
    </div>
  </div>
);

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onClearConversations,
  settings,
  onUpdateSettings,
  chats,
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [tab, setTab] = useState<TabId>('look');

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setShowClearConfirm(false);
      setTab('look');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClear = () => {
    onClearConversations();
    setShowClearConfirm(false);
    onClose();
  };

  const formatChatsForExport = (chatsToExport: Chat[]): string =>
    chatsToExport
      .map((chat) => {
        const messages = chat.messages
          .map((message) => {
            const author = message.role === 'user' ? 'أنت' : 'المساعد';
            const timestamp = new Date(message.timestamp).toLocaleString('ar-EG');
            return `${author} (${timestamp}):\n${message.content}`;
          })
          .join('\n\n');

        return `المحادثة: ${chat.title}\nالتاريخ: ${new Date(chat.createdAt).toLocaleString('ar-EG')}\n\n${messages}\n\n========================================\n\n`;
      })
      .join('');

  const handleExportTxt = () => {
    if (chats.length === 0) {
      alert('مفيش محادثات للتصدير.');
      return;
    }

    const blob = new Blob([formatChatsForExport(chats)], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat-history-${new Date().toISOString().replace(/:/g, '-').slice(0, -5)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onClose();
  };

  const handleExportPdf = () => {
    if (chats.length === 0) {
      alert('مفيش محادثات للتصدير.');
      return;
    }
    if (!window.jspdf) {
      alert('مكتبة تصدير PDF لسه بتحمّل. جرّب تاني بعد لحظة.');
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });

    let y = 40;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 40;
    const contentWidth = doc.internal.pageSize.width - margin * 2;

    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    };

    chats.forEach((chat, chatIndex) => {
      if (chatIndex > 0) {
        y += 20;
        checkPageBreak(0);
      }

      checkPageBreak(20);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(chat.title, margin, y);
      y += 15;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(150);
      doc.text(`Created At: ${new Date(chat.createdAt).toLocaleString()}`, margin, y);
      y += 25;
      doc.setTextColor(0);

      chat.messages.forEach((message) => {
        checkPageBreak(15);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(message.role === 'user' ? 'User' : 'Assistant', margin, y);
        y += 15;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        const textLines = doc.splitTextToSize(message.content, contentWidth);
        const linesHeight = textLines.length * 12;
        checkPageBreak(linesHeight);

        doc.text(textLines, margin, y);
        y += linesHeight + 10;
      });
    });

    doc.save(`chat-history-${new Date().toISOString().replace(/:/g, '-').slice(0, -5)}.pdf`);
    onClose();
  };

  const themeOptions: { value: ThemePreference; label: string; Icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
    { value: 'light', label: 'فاتح', Icon: SunIcon },
    { value: 'dark', label: 'داكن', Icon: MoonIcon },
    { value: 'system', label: 'النظام', Icon: MonitorIcon },
  ];

  const radiusOptions: { value: RadiusPreference; label: string }[] = [
    { value: 'sm', label: 'حاد' },
    { value: 'md', label: 'وسط' },
    { value: 'lg', label: 'ناعم' },
    { value: 'xl', label: 'دائري' },
  ];

  const densityOptions: { value: DensityPreference; label: string }[] = [
    { value: 'compact', label: 'مضغوط' },
    { value: 'comfortable', label: 'مريح' },
    { value: 'spacious', label: 'واسع' },
  ];

  const activePreset = matchingAppearancePreset(settings);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-3 animate-fade-in sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="الإعدادات"
    >
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-line bg-elevated shadow-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <LogoMark size={28} alt="" />
            <div>
              <h2 className="text-base font-bold text-ink">الإعدادات</h2>
              <p className="text-[11px] text-faint">مظهر المنتج بالكامل — مش الشريط الجانبي بس</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-ink/[0.06] hover:text-ink"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex gap-1 border-b border-line px-4 pt-2">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                tab === id ? 'text-ink' : 'text-muted hover:text-ink'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
              {tab === id && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand" />}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-2">
          {tab === 'look' && (
            <section>
              <div className="py-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-faint">معاينة مباشرة</p>
                <LivePreview />
              </div>

              <Row label="الوضع" hint="فاتح أو داكن أو يتبع إعداد النظام.">
                <div className="flex items-center gap-0.5 rounded-xl border border-line p-0.5">
                  {themeOptions.map(({ value, label, Icon }) => (
                    <Segment
                      key={value}
                      active={settings.theme === value}
                      onClick={() => onUpdateSettings({ theme: value })}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </Segment>
                  ))}
                </div>
              </Row>

              <div className="border-t border-line py-3">
                <p className="text-sm font-medium text-ink">ثيمات جاهزة</p>
                <p className="mt-0.5 text-xs leading-5 text-muted">
                  كل ثيم بيظبط اللون الأساسي والشريط والخلفية والفقاعات مع بعض.
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {APPEARANCE_PRESETS.map((preset) => {
                    const selected = activePreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => {
                          const next = appearanceFromPreset(preset.id);
                          if (next) onUpdateSettings(next);
                        }}
                        className={`overflow-hidden rounded-xl border text-start transition-all hover:-translate-y-0.5 ${
                          selected ? 'border-brand ring-2 ring-brand/25' : 'border-line hover:border-brand/40'
                        }`}
                      >
                        <span className="flex h-12">
                          <span className="w-5 shrink-0" style={{ backgroundColor: preset.sidebar }} />
                          <span
                            className="relative min-w-0 flex-1"
                            style={{ backgroundColor: preset.canvas || (preset.id === 'midnight' ? '#070B14' : '#F7F8F6') }}
                          >
                            <span
                              className="absolute bottom-1.5 end-1.5 h-3.5 w-8 rounded-full"
                              style={{ backgroundColor: preset.bubble || preset.accent }}
                            />
                            <span
                              className="absolute bottom-1.5 start-1.5 h-3 w-3 rounded-full"
                              style={{ backgroundColor: preset.accent }}
                            />
                          </span>
                        </span>
                        <span className="flex items-center justify-between px-2 py-1.5">
                          <span className="text-[11px] font-semibold text-ink">{preset.label}</span>
                          {selected && <CheckIcon className="h-3.5 w-3.5 text-brand" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-line" />

              <ColorRow
                label="اللون الأساسي"
                hint="الأزرار، الروابط، وحلقات التركيز في كل الشاشات."
                value={settings.accentColor || DEFAULT_ACCENT_COLOR}
                fallback={DEFAULT_ACCENT_COLOR}
                swatches={ACCENT_SWATCHES}
                onChange={(hex) => onUpdateSettings({ accentColor: hex })}
              />

              <div className="border-t border-line" />

              <ColorRow
                label="الشريط الجانبي"
                hint="لون القائمة. النص بيتظبط تلقائي عشان يبان."
                value={settings.sidebarColor || DEFAULT_SIDEBAR_COLOR}
                fallback={DEFAULT_SIDEBAR_COLOR}
                swatches={SIDEBAR_PRESETS.map((p) => ({ hex: p.hex, label: p.label }))}
                onChange={(hex) => onUpdateSettings({ sidebarColor: hex })}
              />
              {matchingPresetId(settings.sidebarColor || DEFAULT_SIDEBAR_COLOR) === 'custom' && (
                <p className="pb-1 text-[11px] text-faint">لون شريط مخصص</p>
              )}

              <div className="border-t border-line" />

              <ColorRow
                label="خلفية المحادثة"
                hint="سيبها تلقائي عشان تتبع الوضع الفاتح/الداكن، أو اختار لون ثابت."
                value={settings.canvasColor || ''}
                fallback="#F7F8F6"
                swatches={CANVAS_SWATCHES}
                allowAuto
                onChange={(hex) => onUpdateSettings({ canvasColor: hex })}
              />

              <div className="border-t border-line" />

              <ColorRow
                label="فقاعات رسائلك"
                hint="لون رسائل المستخدم. تلقائي بيشتق من الخلفية."
                value={settings.bubbleColor || ''}
                fallback={settings.accentColor || DEFAULT_ACCENT_COLOR}
                swatches={BUBBLE_SWATCHES}
                allowAuto
                onChange={(hex) => onUpdateSettings({ bubbleColor: hex })}
              />
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({
                    bubbleColor: normalizeHex(settings.accentColor || DEFAULT_ACCENT_COLOR, DEFAULT_ACCENT_COLOR),
                  })
                }
                className="mb-3 text-xs font-medium text-brand hover:underline"
              >
                استخدم اللون الأساسي للفقاعات
              </button>

              <div className="border-t border-line" />

              <Row label="الاستدارة" hint="من حواف حادة لشكل أكثر دائرية.">
                <div className="flex items-center gap-0.5 rounded-xl border border-line p-0.5">
                  {radiusOptions.map(({ value, label }) => (
                    <Segment
                      key={value}
                      active={(settings.radius || 'lg') === value}
                      onClick={() => onUpdateSettings({ radius: value })}
                    >
                      {label}
                    </Segment>
                  ))}
                </div>
              </Row>

              <div className="border-t border-line" />

              <Row label="الكثافة" hint="المسافات بين العناصر في الشريط والمحادثة.">
                <div className="flex items-center gap-0.5 rounded-xl border border-line p-0.5">
                  {densityOptions.map(({ value, label }) => (
                    <Segment
                      key={value}
                      active={(settings.density || 'comfortable') === value}
                      onClick={() => onUpdateSettings({ density: value })}
                    >
                      {label}
                    </Segment>
                  ))}
                </div>
              </Row>

              <div className="border-t border-line" />

              <Row label="توهج الخلفية" hint="هالة خفيفة من اللون الأساسي ورا المحادثة.">
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.ambient !== false}
                  onClick={() => onUpdateSettings({ ambient: settings.ambient === false })}
                  className={`relative h-7 w-12 rounded-full transition-colors ${
                    settings.ambient !== false ? 'bg-brand' : 'bg-ink/15'
                  }`}
                >
                  <span
                    className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-all duration-200"
                    style={{ insetInlineStart: settings.ambient !== false ? '1.4rem' : '0.15rem' }}
                  />
                </button>
              </Row>

              <div className="border-t border-line py-3">
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ ...DEFAULT_APPEARANCE, theme: settings.theme })}
                  className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-ink/[0.05]"
                >
                  <ResetIcon className="h-3.5 w-3.5" />
                  إعادة ضبط المظهر
                </button>
              </div>
            </section>
          )}

          {tab === 'ui' && (
            <section>
              <Row label="اللغة" hint="بتغيّر اتجاه الواجهة كمان.">
                <select
                  value={settings.language}
                  onChange={(e) => onUpdateSettings({ language: e.target.value as 'en' | 'ar' })}
                  className="rounded-lg border border-line bg-elevated px-2.5 py-1.5 text-sm text-ink focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/15"
                >
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                </select>
              </Row>

              <div className="border-t border-line" />

              <Row label="حجم الخط" hint="ينطبق على المحادثة وكل الواجهة.">
                <div className="flex items-center gap-0.5 rounded-xl border border-line p-0.5">
                  {(['sm', 'base', 'lg'] as const).map((size) => (
                    <Segment
                      key={size}
                      active={settings.fontSize === size}
                      onClick={() => onUpdateSettings({ fontSize: size })}
                    >
                      {size === 'sm' ? 'صغير' : size === 'base' ? 'متوسط' : 'كبير'}
                    </Segment>
                  ))}
                </div>
              </Row>
            </section>
          )}

          {tab === 'data' && (
            <section>
              <Row label="تصدير المحادثات" hint="نسخة من كل محادثاتك على جهازك.">
                <button
                  onClick={handleExportTxt}
                  className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-ink/[0.05]"
                >
                  <DownloadIcon className="h-3.5 w-3.5" />
                  TXT
                </button>
                <button
                  onClick={handleExportPdf}
                  className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-ink/[0.05]"
                >
                  <DownloadIcon className="h-3.5 w-3.5" />
                  PDF
                </button>
              </Row>

              <div className="border-t border-line" />

              <Row label="حذف كل المحادثات" hint="الإجراء ده نهائي ومش هينفع تتراجع عنه.">
                {showClearConfirm ? (
                  <>
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-ink/[0.05]"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={handleClear}
                      className="rounded-lg bg-danger px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                    >
                      تأكيد الحذف
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="flex items-center gap-1.5 rounded-lg border border-danger/40 px-3 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger/10"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                    حذف الكل
                  </button>
                )}
              </Row>
            </section>
          )}

          <div className="h-4" />
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
