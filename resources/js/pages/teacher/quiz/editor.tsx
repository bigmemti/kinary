import { RichTextEditor } from '@/components/rich-text-editor';
import AppLayout from '@/layouts/app-layout';
import { editor } from '@/routes/teacher/course';
import { save } from '@/routes/teacher/quiz';
import { Head, Link, useForm } from '@inertiajs/react';

type Plan = {
    id: number;
    name: string;
    enabled: boolean;
    limit: number | null;
};
type Quiz = {
    title: string;
    description: string | null;
    duration_seconds: number;
    correct_score: string;
    wrong_penalty: string;
    passing_score: string | null;
    guest_attempt_limit: number;
    questionIds: number[];
    attempted: boolean;
};
type NewQuestion = { body: string; choices: string[]; correct: number };

export default function QuizEditor({
    space,
    lessonId,
    contentId,
    contentDescription,
    quiz,
    bank,
    plans,
}: {
    space: { id: number; name: string; course_id: number };
    lessonId: number | null;
    contentId: number | null;
    contentDescription: string | null;
    quiz: Quiz | null;
    bank: { id: number; body: string }[];
    plans: Plan[];
}) {
    const form = useForm({
        lesson_id: lessonId,
        content_id: contentId,
        title: quiz?.title ?? '',
        description: quiz?.description ?? contentDescription ?? '',
        duration_seconds: quiz?.duration_seconds ?? 600,
        correct_score: '1',
        wrong_penalty: quiz?.wrong_penalty ?? '0',
        passing_score: quiz?.passing_score ?? '',
        guest_attempt_limit: quiz?.guest_attempt_limit ?? 3,
        question_ids: quiz?.questionIds ?? [],
        new_questions: [] as NewQuestion[],
        plans,
    });
    function updateQuestion(index: number, change: Partial<NewQuestion>) {
        form.setData(
            'new_questions',
            form.data.new_questions.map((q, i) =>
                i === index ? { ...q, ...change } : q,
            ),
        );
    }
    return (
        <AppLayout>
            <Head title="ویرایش آزمون" />
            <main lang="fa" dir="rtl" className="space-y-5 p-5 text-right">
                <h1 className="text-xl font-bold">
                    ویرایش آزمون · {space.name}
                </h1>
                {quiz?.attempted && (
                    <p>
                        تا پایان تلاش‌های فعال، امکان ویرایش این آزمون وجود
                        ندارد.
                    </p>
                )}
                <form
                    className="space-y-5"
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.post(save.url(space.id));
                    }}
                >
                    <fieldset
                        disabled={form.processing || quiz?.attempted}
                        className="space-y-4"
                    >
                        <label className="block">
                            عنوان آزمون{' '}
                            <input
                                className="block w-full rounded border p-2"
                                value={form.data.title}
                                onChange={(e) =>
                                    form.setData('title', e.target.value)
                                }
                                required
                            />
                        </label>
                        <div className="block">
                            <label htmlFor="quiz-description">توضیحات</label>
                            <RichTextEditor
                                id="quiz-description"
                                className="block w-full rounded border p-2"
                                value={form.data.description}
                                disabled={form.processing || quiz?.attempted}
                                onChange={(e) =>
                                    form.setData('description', e.target.value)
                                }
                            />
                        </div>
                        <label className="block">
                            زمان آزمون (ثانیه){' '}
                            <input
                                type="number"
                                min="1"
                                max="86399"
                                className="block rounded border p-2"
                                value={form.data.duration_seconds}
                                onChange={(e) =>
                                    form.setData(
                                        'duration_seconds',
                                        Number(e.target.value),
                                    )
                                }
                            />
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={Number(form.data.wrong_penalty) > 0}
                                onChange={(e) =>
                                    form.setData(
                                        'wrong_penalty',
                                        e.target.checked ? '0.33' : '0',
                                    )
                                }
                            />
                            نمرهٔ منفی: هر سه پاسخ غلط یک پاسخ درست را خنثی
                            می‌کند.
                        </label>
                        {!lessonId && (
                            <>
                                <label className="block">
                                    حد قبولی (درصد){' '}
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        required
                                        className="block rounded border p-2"
                                        value={form.data.passing_score}
                                        onChange={(e) =>
                                            form.setData(
                                                'passing_score',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </label>
                                <label className="block">
                                    تعداد دفعات بدون پلن{' '}
                                    <input
                                        type="number"
                                        min="0"
                                        className="block rounded border p-2"
                                        value={form.data.guest_attempt_limit}
                                        onChange={(e) =>
                                            form.setData(
                                                'guest_attempt_limit',
                                                Number(e.target.value),
                                            )
                                        }
                                    />
                                </label>
                            </>
                        )}
                        <section className="space-y-2">
                            <h2>بانک سؤال این فضا</h2>
                            {bank.map((q) => (
                                <label className="block" key={q.id}>
                                    <input
                                        type="checkbox"
                                        checked={form.data.question_ids.includes(
                                            q.id,
                                        )}
                                        onChange={(e) =>
                                            form.setData(
                                                'question_ids',
                                                e.target.checked
                                                    ? [
                                                          ...form.data
                                                              .question_ids,
                                                          q.id,
                                                      ]
                                                    : form.data.question_ids.filter(
                                                          (id) => id !== q.id,
                                                      ),
                                            )
                                        }
                                    />{' '}
                                    {q.body}
                                </label>
                            ))}
                        </section>
                        {form.data.new_questions.map((q, i) => (
                            <fieldset
                                key={i}
                                className="space-y-2 rounded border p-4"
                            >
                                <legend>سؤال جدید {i + 1}</legend>
                                <input
                                    aria-label="متن سؤال"
                                    placeholder="متن سؤال"
                                    className="block w-full rounded border p-2"
                                    value={q.body}
                                    onChange={(e) =>
                                        updateQuestion(i, {
                                            body: e.target.value,
                                        })
                                    }
                                    required
                                />
                                {q.choices.map((choice, j) => (
                                    <label key={j} className="flex gap-2">
                                        <input
                                            type="radio"
                                            name={`correct-${i}`}
                                            checked={q.correct === j}
                                            onChange={() =>
                                                updateQuestion(i, {
                                                    correct: j,
                                                })
                                            }
                                        />
                                        <input
                                            aria-label={`گزینه ${j + 1}`}
                                            className="w-full rounded border p-2"
                                            value={choice}
                                            onChange={(e) =>
                                                updateQuestion(i, {
                                                    choices: q.choices.map(
                                                        (value, k) =>
                                                            k === j
                                                                ? e.target.value
                                                                : value,
                                                    ),
                                                })
                                            }
                                            required
                                        />
                                    </label>
                                ))}
                                <button
                                    type="button"
                                    onClick={() =>
                                        form.setData(
                                            'new_questions',
                                            form.data.new_questions.filter(
                                                (_, j) => i !== j,
                                            ),
                                        )
                                    }
                                >
                                    حذف سؤال
                                </button>
                            </fieldset>
                        ))}
                        <button
                            type="button"
                            className="rounded border p-2"
                            onClick={() =>
                                form.setData('new_questions', [
                                    ...form.data.new_questions,
                                    {
                                        body: '',
                                        choices: ['', '', '', ''],
                                        correct: 0,
                                    },
                                ])
                            }
                        >
                            افزودن سؤال چهارگزینه‌ای
                        </button>
                        <section className="space-y-3">
                            <h2>سهمیه پلن‌ها</h2>
                            {form.data.plans.map((plan, i) => (
                                <div
                                    className="rounded border p-3"
                                    key={plan.id}
                                >
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={plan.enabled}
                                            onChange={(e) =>
                                                form.setData(
                                                    'plans',
                                                    form.data.plans.map(
                                                        (p, j) =>
                                                            i === j
                                                                ? {
                                                                      ...p,
                                                                      enabled:
                                                                          e
                                                                              .target
                                                                              .checked,
                                                                  }
                                                                : p,
                                                    ),
                                                )
                                            }
                                        />{' '}
                                        {plan.name}
                                    </label>
                                    {plan.enabled && (
                                        <label className="block">
                                            تعداد دفعات (خالی: نامحدود)
                                            <input
                                                type="number"
                                                min="0"
                                                className="block rounded border p-2"
                                                value={plan.limit ?? ''}
                                                onChange={(e) =>
                                                    form.setData(
                                                        'plans',
                                                        form.data.plans.map(
                                                            (p, j) =>
                                                                i === j
                                                                    ? {
                                                                          ...p,
                                                                          limit:
                                                                              e
                                                                                  .target
                                                                                  .value ===
                                                                              ''
                                                                                  ? null
                                                                                  : Number(
                                                                                        e
                                                                                            .target
                                                                                            .value,
                                                                                    ),
                                                                      }
                                                                    : p,
                                                        ),
                                                    )
                                                }
                                            />
                                        </label>
                                    )}
                                </div>
                            ))}
                        </section>
                        {Object.values(form.errors).map((error, i) => (
                            <p role="alert" key={i}>
                                {error}
                            </p>
                        ))}
                        <button
                            className="rounded bg-primary px-4 py-2 text-primary-foreground"
                            type="submit"
                        >
                            تأیید آزمون
                        </button>
                    </fieldset>
                    <Link
                        className="inline-block underline"
                        href={editor(space.course_id)}
                    >
                        بازگشت به ویرایشگر دوره
                    </Link>
                </form>
            </main>
        </AppLayout>
    );
}
