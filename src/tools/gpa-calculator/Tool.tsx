import { useEffect, useMemo, useState } from 'preact/hooks';
import { Button, CopyButton, Notice, NumberInput, Panel, Select, Stat, TextInput } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { calculateGpa, GRADES, type Grade } from './logic';

const STORAGE_KEY = 'tools:gpa-calculator:state';
const MAX_ROWS = 100;

interface CourseRow {
  id: number;
  name: string;
  credits: number | '';
  grade: Grade;
}

interface State {
  courses: CourseRow[];
  nextId: number;
}

function defaultState(): State {
  return {
    courses: [
      { id: 1, name: '', credits: 3, grade: 'A+' },
      { id: 2, name: '', credits: 3, grade: 'B+' },
      { id: 3, name: '', credits: 2, grade: 'A0' },
    ],
    nextId: 4,
  };
}

function isGrade(value: unknown): value is Grade {
  return typeof value === 'string' && (GRADES as readonly string[]).includes(value);
}

function restoreState(): State {
  const fallback = defaultState();
  try {
    const saved: unknown = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null');
    if (!saved || typeof saved !== 'object' || !('courses' in saved) || !Array.isArray(saved.courses)) return fallback;
    const courses = (saved.courses as unknown[])
      .filter((course): course is Record<string, unknown> => !!course && typeof course === 'object')
      .slice(0, MAX_ROWS)
      .map((course, index) => ({
        id: typeof course.id === 'number' && Number.isInteger(course.id) ? course.id : index + 1,
        name: typeof course.name === 'string' ? course.name.slice(0, 120) : '',
        credits: typeof course.credits === 'number' && Number.isFinite(course.credits) ? course.credits : ('' as const),
        grade: isGrade(course.grade) ? course.grade : 'A0',
      }));
    if (!courses.length) return fallback;
    const highestId = Math.max(...courses.map((course) => course.id));
    return { courses, nextId: highestId + 1 };
  } catch {
    return fallback;
  }
}

export default function GpaCalculator({ locale, ui }: ToolProps<UI>) {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<State>(defaultState);

  useEffect(() => {
    setState(restoreState());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) safeStorage.set(STORAGE_KEY, JSON.stringify(state));
  }, [ready, state]);

  const result = useMemo(
    () =>
      state.courses.every((course) => course.credits !== '')
        ? calculateGpa(state.courses.map(({ credits, grade }) => ({ credits: Number(credits), grade })))
        : null,
    [state.courses],
  );
  const updateCourse = (id: number, patch: Partial<Omit<CourseRow, 'id'>>) => {
    setState((current) => ({
      ...current,
      courses: current.courses.map((course) => (course.id === id ? { ...course, ...patch } : course)),
    }));
  };
  const addCourse = () => {
    setState((current) => {
      if (current.courses.length >= MAX_ROWS) return current;
      return {
        nextId: current.nextId + 1,
        courses: [...current.courses, { id: current.nextId, name: '', credits: 3, grade: 'A0' }],
      };
    });
  };
  const removeCourse = (id: number) => {
    setState((current) => {
      if (current.courses.length === 1) return current;
      return { ...current, courses: current.courses.filter((course) => course.id !== id) };
    });
  };
  const reset = () => setState(defaultState());
  const gpa = (scale: '4.5' | '4.3' | '4.0') =>
    result?.gpas[scale] === null || result?.gpas[scale] === undefined
      ? '—'
      : formatNumber(result.gpas[scale], locale, 2);
  const copyText = result?.gpaCredits
    ? ui.copySummary
        .replaceAll('{gpa45}', gpa('4.5'))
        .replaceAll('{gpa43}', gpa('4.3'))
        .replaceAll('{gpa40}', gpa('4.0'))
        .replaceAll('{credits}', formatNumber(result.gpaCredits, locale, 2))
    : '';

  return (
    <Panel>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="text-sm text-muted">{ui.intro}</p>
        <span class="shrink-0 text-xs text-subtle">{ui.autosaved}</span>
      </div>

      <div class="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
        <div>
          <div class="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-fg">{ui.coursesHeading}</p>
              <p class="mt-1 text-xs text-subtle">{ui.coursesHint}</p>
            </div>
            <div class="flex gap-2">
              <Button size="sm" onClick={addCourse} disabled={state.courses.length >= MAX_ROWS}>
                {ui.addCourse}
              </Button>
              <Button size="sm" variant="ghost" onClick={reset}>
                {ui.reset}
              </Button>
            </div>
          </div>

          <div class="mt-3 overflow-x-auto rounded-md border border-line">
            <table class="w-full min-w-[32rem] border-collapse text-left text-sm">
              <thead class="bg-surface-2 text-xs text-muted">
                <tr>
                  <th class="px-3 py-2 font-medium">{ui.courseName}</th>
                  <th class="w-28 px-3 py-2 font-medium">{ui.credits}</th>
                  <th class="w-28 px-3 py-2 font-medium">{ui.grade}</th>
                  <th class="w-12 px-3 py-2">
                    <span class="sr-only">{ui.removeCourse}</span>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-line">
                {state.courses.map((course) => (
                  <tr>
                    <td class="px-2 py-2">
                      <TextInput
                        value={course.name}
                        aria-label={ui.courseNameAria}
                        placeholder={ui.courseNamePlaceholder}
                        maxLength={120}
                        onInput={(event) => updateCourse(course.id, { name: event.currentTarget.value })}
                      />
                    </td>
                    <td class="px-2 py-2">
                      <NumberInput
                        value={course.credits}
                        aria-label={ui.creditsAria}
                        min="0.5"
                        max="100"
                        step="0.5"
                        onValue={(credits) => updateCourse(course.id, { credits })}
                      />
                    </td>
                    <td class="px-2 py-2">
                      <Select<Grade>
                        value={course.grade}
                        ariaLabel={ui.gradeAria}
                        onValue={(grade) => updateCourse(course.id, { grade })}
                        options={GRADES.map((grade) => ({ value: grade, label: grade }))}
                      />
                    </td>
                    <td class="px-2 py-2 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label={ui.removeCourse}
                        disabled={state.courses.length === 1}
                        onClick={() => removeCourse(course.id)}
                      >
                        ×
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <div class="flex items-center justify-between gap-3">
            <p class="text-sm font-medium text-fg">{ui.resultHeading}</p>
            <CopyButton text={copyText} label={ui.copy} copiedLabel={ui.copied} />
          </div>
          {!result ? (
            <Notice tone="danger">{ui.invalidInput}</Notice>
          ) : result.gpaCredits === 0 ? (
            <Notice tone="info">{ui.noGpa}</Notice>
          ) : (
            <div aria-live="polite" class="grid grid-cols-2 gap-2">
              <Stat label={ui.gpa45} value={gpa('4.5')} emphasis />
              <Stat label={ui.gpa43} value={gpa('4.3')} emphasis />
              <Stat label={ui.gpa40} value={gpa('4.0')} emphasis />
              <Stat label={ui.gpaCredits} value={formatNumber(result.gpaCredits, locale, 2)} />
              {result.passCredits > 0 && (
                <Stat label={ui.passCredits} value={formatNumber(result.passCredits, locale, 2)} />
              )}
              <Stat label={ui.qualityPoints} value={formatNumber(result.qualityPoints['4.5'], locale, 2)} />
            </div>
          )}
          <p class="font-mono text-xs text-subtle">{ui.formula}</p>
          <Notice>{ui.scaleNotice}</Notice>
        </div>
      </div>

      <div class="mt-5">
        <Notice>{ui.privacyNotice}</Notice>
      </div>
    </Panel>
  );
}
