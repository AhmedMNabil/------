export const AR_NUM = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

export const toArabicDigits = (n: number | string) =>
  String(n).replace(/\d/g, (d) => AR_NUM[Number(d)]);

export interface Lesson {
  id: string;
  title: string;
  path: string;
  index: number;
}

export interface CourseSection {
  id: string;
  title: string;
  hint: string;
  lessons: Lesson[];
}

const SECTION_META: { id: string; title: string; hint: string; count: number }[] = [
  { id: 'foundation', title: 'الأساس', hint: 'الفكرة، الشراكة، والبداية الصحيحة', count: 7 },
  { id: 'build', title: 'البناء والتمويل', hint: 'الموارد، المال، والتنفيذ', count: 7 },
  { id: 'growth', title: 'التسويق والنمو', hint: 'الوصول للعملاء والتوسع', count: 6 },
];

let lessonCounter = 0;

export const courseSections: CourseSection[] = SECTION_META.map((meta, sectionIdx) => ({
  id: meta.id,
  title: meta.title,
  hint: meta.hint,
  lessons: Array.from({ length: meta.count }, (_, i) => {
    lessonCounter += 1;
    return {
      id: `${meta.id}-${i + 1}`,
      title: `الدرس ${toArabicDigits(i + 1)}`,
      path: `videos/section${sectionIdx + 1}/${i + 1}.mp4`,
      index: lessonCounter,
    };
  }),
}));

export const allLessons: Lesson[] = courseSections.flatMap((s) => s.lessons);

export const totalLessons = allLessons.length;

export function findSectionFor(path: string): CourseSection | undefined {
  return courseSections.find((s) => s.lessons.some((l) => l.path === path));
}

export function lessonByPath(path: string): Lesson | undefined {
  return allLessons.find((l) => l.path === path);
}

export function adjacentLessons(path: string): { prev: Lesson | null; next: Lesson | null } {
  const i = allLessons.findIndex((l) => l.path === path);
  if (i < 0) return { prev: null, next: null };
  return {
    prev: allLessons[i - 1] ?? null,
    next: allLessons[i + 1] ?? null,
  };
}

export function formatClock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${toArabicDigits(m)}:${toArabicDigits(String(s).padStart(2, '0'))}`;
}

export type CourseProgress = {
  watched: string[];
  lastPath: string;
  lastTime: number;
  autoplay: boolean;
  durations: Record<string, number>;
};

export const DEFAULT_COURSE_PROGRESS: CourseProgress = {
  watched: [],
  lastPath: allLessons[0]?.path ?? '',
  lastTime: 0,
  autoplay: false,
  durations: {},
};

export const COURSE_PROGRESS_KEY = 'courseProgress';
