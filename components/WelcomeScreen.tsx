import React from 'react';
import { LogoMark } from './Logo';
import { MegaphoneIcon, RocketIcon, UsersIcon, WalletIcon, SparkleIcon } from './icons';

interface WelcomeScreenProps {
  userName?: string;
  onSelectPrompt: (prompt: string) => void;
}

const SUGGESTIONS: {
  label: string;
  prompt: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
}[] = [
  {
    label: 'اختيار الشريك المناسب',
    prompt: 'ازاي اختار الشريك المناسب لمشروعي وايه أهم حاجة لازم أشوفها فيه؟',
    Icon: UsersIcon,
  },
  {
    label: 'أنواع التمويل',
    prompt: 'ايه أنواع التمويل المتاحة للمشاريع الصغيرة وامتى أستخدم كل نوع؟',
    Icon: WalletIcon,
  },
  {
    label: 'أول خطوة في المشروع',
    prompt: 'أنا عندي فكرة مشروع، ايه أول خطوة عملية المفروض أعملها؟',
    Icon: RocketIcon,
  },
  {
    label: 'تسويق بميزانية صغيرة',
    prompt: 'ازاي أسوّق لمشروعي وأنا ميزانيتي محدودة جدًا؟',
    Icon: MegaphoneIcon,
  },
];

const greeting = (name?: string) => {
  const hour = new Date().getHours();
  const time = hour < 12 ? 'صباح الخير' : 'مساء الخير';
  const first = name?.trim().split(/\s+/)[0];
  return first ? `${time}، ${first}` : time;
};

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ userName, onSelectPrompt }) => {
  return (
    <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-4 text-center">
      <div className="animate-scale-in">
        <div className="relative mx-auto w-fit">
          <div
            aria-hidden
            className="absolute -inset-6 rounded-full bg-brand/20 blur-2xl"
          />
          <LogoMark size={76} className="relative ring-1 ring-line/60 drop-shadow-xl" />
        </div>

        <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          {greeting(userName)}
        </h1>
        <p className="mx-auto mt-2.5 max-w-md text-sm leading-7 text-muted sm:text-base">
          اسألني أي حاجة عن كورس «التعليم هو الحل» — هجاوبك من المحتوى نفسه وأرجعك للمقطع وقت الحاجة.
        </p>
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/10 px-3 py-1 text-[11px] font-medium text-brand">
          <SparkleIcon className="h-3 w-3" />
          مبني على محتوى الكورس
        </p>
      </div>

      <div className="mt-8 grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2">
        {SUGGESTIONS.map((s, i) => (
          <button
            key={s.label}
            onClick={() => onSelectPrompt(s.prompt)}
            style={{ animationDelay: `${120 + i * 70}ms` }}
            className="group animate-fade-up rounded-2xl border border-line bg-elevated/80 p-3.5 text-start shadow-lift backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/45 hover:shadow-composer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <span className="flex items-start gap-3">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-brand-ink">
                <s.Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold text-ink">{s.label}</span>
                <span className="mt-1 block text-xs leading-5 text-muted line-clamp-2">{s.prompt}</span>
              </span>
            </span>
          </button>
        ))}
      </div>

      <p className="mt-8 text-[11px] text-faint">إجابات بالعربية · فيديوهات مرفقة · محفوظة على حسابك</p>
    </div>
  );
};

export default WelcomeScreen;
