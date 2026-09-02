import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CloseIcon,
  ListIcon,
  MaximizeIcon,
  PlayCircleIcon,
  SearchIcon,
  SkipNextIcon,
  SkipPrevIcon,
  SparkleIcon,
} from './icons';
import { LogoMark } from './Logo';
import { useLocalStorage } from '../utils';
import {
  adjacentLessons,
  allLessons,
  courseSections,
  COURSE_PROGRESS_KEY,
  DEFAULT_COURSE_PROGRESS,
  findSectionFor,
  formatClock,
  lessonByPath,
  Lesson,
  toArabicDigits,
  totalLessons,
  type CourseProgress,
} from '../course';

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAskAboutLesson?: (prompt: string) => void;
}

const CourseModal: React.FC<CourseModalProps> = ({ isOpen, onClose, onAskAboutLesson }) => {
  const [progress, setProgress] = useLocalStorage<CourseProgress>(
    COURSE_PROGRESS_KEY,
    DEFAULT_COURSE_PROGRESS,
  );
  const [selectedPath, setSelectedPath] = useState(
    () => progress.lastPath || allLessons[0]?.path || '',
  );
  const [openSectionId, setOpenSectionId] = useState(
    () => findSectionFor(progress.lastPath || allLessons[0]?.path || '')?.id ?? courseSections[0]?.id,
  );
  const [videoError, setVideoError] = useState(false);
  const [started, setStarted] = useState(false);
  const [query, setQuery] = useState('');
  const [resumeHint, setResumeHint] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const playlistRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const shouldAutoPlay = useRef(false);
  const lastSaveAt = useRef(0);

  const selected = lessonByPath(selectedPath) ?? allLessons[0];
  const section = findSectionFor(selected.path);
  const { prev, next } = adjacentLessons(selected.path);
  const watchedSet = useMemo(() => new Set(progress.watched), [progress.watched]);
  const watchedCount = progress.watched.length;
  const percent = totalLessons === 0 ? 0 : Math.round((watchedCount / totalLessons) * 100);

  const filteredSections = useMemo(() => {
    const term = query.trim();
    if (!term) return courseSections;
    return courseSections
      .map((s) => ({
        ...s,
        lessons: s.lessons.filter(
          (l) =>
            l.title.includes(term) ||
            s.title.includes(term) ||
            toArabicDigits(l.index).includes(term) ||
            String(l.index).includes(term),
        ),
      }))
      .filter((s) => s.lessons.length > 0);
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;
    const resume = progress.lastPath && lessonByPath(progress.lastPath);
    if (resume) {
      setSelectedPath(resume.path);
      setOpenSectionId(findSectionFor(resume.path)?.id ?? openSectionId);
      setResumeHint((progress.lastTime || 0) > 8);
    }
    setStarted(false);
    setVideoError(false);
    setQuery('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      videoRef.current?.pause();
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      const typing =
        e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      if (e.key === 'Escape') {
        e.preventDefault();
        videoRef.current?.pause();
        onClose();
        return;
      }
      if (typing) return;
      if (e.key === 'n' || e.key === 'N' || e.key === 'ArrowDown') {
        if (next) {
          e.preventDefault();
          selectLesson(next, true);
        }
      } else if (e.key === 'p' || e.key === 'P' || e.key === 'ArrowUp') {
        if (prev) {
          e.preventDefault();
          selectLesson(prev, true);
        }
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === '/') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, next?.path, prev?.path, onClose]);

  const persist = useCallback(
    (patch: Partial<CourseProgress>) => {
      setProgress((prevState) => ({ ...prevState, ...patch }));
    },
    [setProgress],
  );

  const markWatched = useCallback(
    (path: string) => {
      setProgress((prevState) =>
        prevState.watched.includes(path)
          ? prevState
          : { ...prevState, watched: [...prevState.watched, path] },
      );
    },
    [setProgress],
  );

  const toggleWatched = (path: string) => {
    setProgress((prevState) => ({
      ...prevState,
      watched: prevState.watched.includes(path)
        ? prevState.watched.filter((p) => p !== path)
        : [...prevState.watched, path],
    }));
  };

  const selectLesson = (lesson: Lesson, play = false) => {
    setSelectedPath(lesson.path);
    setOpenSectionId(findSectionFor(lesson.path)?.id ?? openSectionId);
    setVideoError(false);
    setStarted(play);
    setResumeHint(false);
    shouldAutoPlay.current = play;
    persist({ lastPath: lesson.path, lastTime: 0 });
  };

  const handleLoadedMetadata = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.duration && Number.isFinite(el.duration)) {
      setProgress((prevState) => ({
        ...prevState,
        durations: { ...prevState.durations, [selected.path]: el.duration },
      }));
    }
    const shouldResume =
      progress.lastPath === selected.path && progress.lastTime > 8 && progress.lastTime < el.duration - 4;
    if (shouldResume && !shouldAutoPlay.current) {
      el.currentTime = progress.lastTime;
    }
    if (shouldAutoPlay.current || started) {
      el.play().catch(() => {});
      setStarted(true);
      shouldAutoPlay.current = false;
    }
  };

  const handleTimeUpdate = () => {
    const el = videoRef.current;
    if (!el) return;
    const now = Date.now();
    if (now - lastSaveAt.current < 1500) return;
    lastSaveAt.current = now;
    persist({ lastPath: selected.path, lastTime: el.currentTime });
    if (el.duration && el.currentTime / el.duration >= 0.9) {
      markWatched(selected.path);
    }
  };

  const handleEnded = () => {
    markWatched(selected.path);
    persist({ lastTime: 0 });
    if (progress.autoplay && next) {
      selectLesson(next, true);
    }
  };

  const startPlayback = () => {
    const el = videoRef.current;
    setStarted(true);
    setResumeHint(false);
    el?.play().catch(() => {});
  };

  const toggleFullscreen = () => {
    const node = playerRef.current;
    if (!node) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      node.requestFullscreen().catch(() => {});
    }
  };

  const scrollToPlaylist = () => {
    playlistRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const askAboutLesson = () => {
    const prompt = `اشرح لي أهم أفكار «${selected.title}» من قسم «${section?.title ?? ''}» في كورس التعليم هو الحل، وقولي التطبيق العملي اللي أقدر أعمله بعد الدرس.`;
    onAskAboutLesson?.(prompt);
  };

  if (!isOpen || !selected) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-canvas animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="مشاهدة الكورس"
    >
      <header className="glass-header flex h-14 shrink-0 items-center gap-2 border-b border-line/70 px-3 sm:px-4">
        <LogoMark size={28} className="hidden shrink-0 ring-1 ring-line/70 sm:block" alt="" />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-bold text-ink">كورس «التعليم هو الحل»</h2>
          <p className="hidden text-[11px] text-faint sm:block">
            {toArabicDigits(watchedCount)} من {toArabicDigits(totalLessons)} درس · {toArabicDigits(percent)}٪ مكتمل
          </p>
        </div>

        <div className="mx-2 hidden h-1.5 w-28 overflow-hidden rounded-full bg-ink/10 sm:block lg:w-40">
          <div className="h-full rounded-full bg-brand transition-[width] duration-500" style={{ width: `${percent}%` }} />
        </div>

        <button
          type="button"
          onClick={scrollToPlaylist}
          className="flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-xs font-medium text-muted transition-colors hover:bg-ink/[0.06] hover:text-ink lg:hidden"
        >
          <ListIcon className="h-4 w-4" />
          المنهج
        </button>
        <button
          onClick={() => {
            videoRef.current?.pause();
            onClose();
          }}
          aria-label="إغلاق"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-muted transition-colors hover:bg-ink/[0.06] hover:text-ink"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
        <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto p-3 sm:p-5">
          <div
            ref={playerRef}
            className="relative overflow-hidden rounded-2xl bg-black shadow-pop ring-1 ring-ink/10"
          >
            <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
              <video
                ref={videoRef}
                key={selected.path}
                controls={started}
                playsInline
                preload="metadata"
                src={`/${selected.path}`}
                className="absolute inset-0 h-full w-full"
                onError={() => setVideoError(true)}
                onLoadedData={() => setVideoError(false)}
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setStarted(true)}
                onEnded={handleEnded}
              />

              {!started && !videoError && (
                <button
                  type="button"
                  onClick={startPlayback}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-t from-black/70 via-black/25 to-black/30"
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand text-brand-ink shadow-brand transition-transform hover:scale-105">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 ltr:translate-x-0.5">
                      <path d="M8 5.2v13.6L19.5 12 8 5.2z" />
                    </svg>
                  </span>
                  <span className="px-4 text-center">
                    <span className="block text-xs font-medium text-white/60">
                      القسم · {section?.title} · الدرس {toArabicDigits(selected.index)}
                    </span>
                    <span className="mt-1 block text-base font-bold text-white">{selected.title}</span>
                    {resumeHint && (
                      <span className="mt-2 inline-block rounded-full bg-white/15 px-3 py-1 text-[11px] text-white/90">
                        كمّل من {formatClock(progress.lastTime)}
                      </span>
                    )}
                  </span>
                </button>
              )}

              {videoError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black px-6 text-center">
                  <PlayCircleIcon className="h-10 w-10 text-white/35" />
                  <p className="text-sm font-medium text-white">تعذّر تشغيل المقطع</p>
                  <p className="max-w-sm text-xs leading-5 text-white/55">
                    الملف لسه مش موجود محليًا. حط الفيديو في
                    <br />
                    <code className="font-latin text-white/70">{selected.path}</code>
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-brand">
                {section?.title} · {toArabicDigits(selected.index)} / {toArabicDigits(totalLessons)}
              </p>
              <h3 className="mt-0.5 text-lg font-extrabold tracking-tight text-ink">{selected.title}</h3>
              <p className="mt-1 text-sm text-muted">{section?.hint}</p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-1.5">
              <button
                type="button"
                disabled={!prev}
                onClick={() => prev && selectLesson(prev, true)}
                className="flex h-9 items-center gap-1 rounded-xl border border-line px-2.5 text-xs font-medium text-ink transition-colors hover:bg-ink/[0.05] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <SkipPrevIcon className="h-4 w-4" />
                السابق
              </button>
              <button
                type="button"
                disabled={!next}
                onClick={() => next && selectLesson(next, true)}
                className="flex h-9 items-center gap-1 rounded-xl bg-brand px-2.5 text-xs font-bold text-brand-ink shadow-brand transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-35"
              >
                التالي
                <SkipNextIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label="ملء الشاشة"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-line text-muted transition-colors hover:bg-ink/[0.05] hover:text-ink"
              >
                <MaximizeIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => toggleWatched(selected.path)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                watchedSet.has(selected.path)
                  ? 'border-brand/30 bg-brand/10 text-brand'
                  : 'border-line text-muted hover:text-ink'
              }`}
            >
              <CheckIcon className="h-3.5 w-3.5" />
              {watchedSet.has(selected.path) ? 'تم المشاهدة' : 'تعليم كمكتمل'}
            </button>

            <button
              type="button"
              role="switch"
              aria-checked={progress.autoplay}
              onClick={() => persist({ autoplay: !progress.autoplay })}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                progress.autoplay ? 'border-brand/30 bg-brand/10 text-brand' : 'border-line text-muted hover:text-ink'
              }`}
            >
              تشغيل تلقائي
            </button>

            {onAskAboutLesson && (
              <button
                type="button"
                onClick={askAboutLesson}
                className="flex items-center gap-1.5 rounded-full border border-brand/25 bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand transition-colors hover:bg-brand hover:text-brand-ink"
              >
                <SparkleIcon className="h-3.5 w-3.5" />
                اسأل عن الدرس
              </button>
            )}
          </div>

          <p className="mt-4 hidden text-[11px] text-faint sm:block">
            اختصارات: N التالي · P السابق · F ملء الشاشة · / بحث · Esc إغلاق
          </p>
        </section>

        <aside
          ref={playlistRef}
          className="flex min-h-0 w-full shrink-0 flex-col border-line bg-elevated/60 lg:w-[340px] lg:border-s"
        >
          <div className="shrink-0 border-b border-line px-3 py-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-bold text-ink">المنهج</p>
              <p className="text-[11px] text-faint">
                {toArabicDigits(watchedCount)}/{toArabicDigits(totalLessons)}
              </p>
            </div>
            <div className="mb-3 h-1 overflow-hidden rounded-full bg-ink/10">
              <div className="h-full rounded-full bg-brand transition-[width] duration-500" style={{ width: `${percent}%` }} />
            </div>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-faint ltr:left-2.5 rtl:right-2.5" />
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="بحث في الدروس"
                className="w-full rounded-xl border border-line bg-canvas py-2 text-[13px] text-ink placeholder:text-faint focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/20 ltr:pl-8 ltr:pr-2 rtl:pl-2 rtl:pr-8"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
            {filteredSections.length === 0 ? (
              <p className="px-2 py-8 text-center text-xs text-faint">مفيش دروس مطابقة.</p>
            ) : (
              filteredSections.map((s) => {
                const isOpenSection = openSectionId === s.id || !!query;
                const done = s.lessons.filter((l) => watchedSet.has(l.path)).length;
                return (
                  <div key={s.id} className="mb-1">
                    <button
                      type="button"
                      onClick={() => setOpenSectionId(isOpenSection && !query ? '' : s.id)}
                      className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2.5 text-start transition-colors hover:bg-ink/[0.05]"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ink">{s.title}</span>
                        <span className="block text-[11px] text-faint">
                          {s.hint} · {toArabicDigits(done)}/{toArabicDigits(s.lessons.length)}
                        </span>
                      </span>
                      {isOpenSection ? (
                        <ChevronUpIcon className="h-4 w-4 shrink-0 text-muted" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4 shrink-0 text-muted" />
                      )}
                    </button>

                    {isOpenSection && (
                      <ul className="mb-1 space-y-0.5">
                        {s.lessons.map((lesson) => {
                          const active = lesson.path === selected.path;
                          const doneLesson = watchedSet.has(lesson.path);
                          const duration = progress.durations?.[lesson.path];
                          return (
                            <li key={lesson.path}>
                              <button
                                type="button"
                                onClick={() => selectLesson(lesson, true)}
                                className={`group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-start transition-colors ${
                                  active
                                    ? 'bg-brand/12 text-ink ring-1 ring-brand/25'
                                    : 'text-muted hover:bg-ink/[0.04] hover:text-ink'
                                }`}
                              >
                                <span
                                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                                    doneLesson
                                      ? 'bg-brand text-brand-ink'
                                      : active
                                        ? 'bg-brand/20 text-brand'
                                        : 'bg-ink/[0.06] text-faint'
                                  }`}
                                >
                                  {doneLesson ? (
                                    <CheckIcon className="h-3.5 w-3.5" />
                                  ) : (
                                    toArabicDigits(lesson.index)
                                  )}
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate text-[13px] font-medium">{lesson.title}</span>
                                  {active && (
                                    <span className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold text-brand">
                                      <span className="h-1.5 w-1.5 animate-breathe rounded-full bg-brand" />
                                      قيد التشغيل
                                    </span>
                                  )}
                                </span>
                                {duration ? (
                                  <span className="shrink-0 font-latin text-[10px] text-faint">
                                    {formatClock(duration)}
                                  </span>
                                ) : null}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CourseModal;
