import { MarkdownContent } from '@/components/markdown-content';
import AppLayout from '@/layouts/app-layout';
import { answer, finish } from '@/routes/student/quiz';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';

type Question = {
    id: number;
    body: string;
    selected: number | null;
    choices: { id: number; body: string }[];
};

export default function Show({
    attempt,
    quiz,
    questions,
    backUrl,
    certificateUrl,
}: {
    attempt: {
        id: number;
        expiresAt: string;
        finished: boolean;
        score: string | null;
    };
    quiz: { title: string; description: string | null };
    questions: Question[];
    backUrl: string;
    certificateUrl: string | null;
}) {
    const [remaining, setRemaining] = useState(() =>
        Math.max(
            0,
            Math.ceil((Date.parse(attempt.expiresAt) - Date.now()) / 1000),
        ),
    );
    const [selected, setSelected] = useState<Record<number, number | null>>(
        () => Object.fromEntries(questions.map((q) => [q.id, q.selected])),
    );
    const [pending, setPending] = useState(0);
    const [error, setError] = useState('');
    useEffect(() => {
        if (attempt.finished) return;
        const timer = window.setInterval(
            () =>
                setRemaining(
                    Math.max(
                        0,
                        Math.ceil(
                            (Date.parse(attempt.expiresAt) - Date.now()) / 1000,
                        ),
                    ),
                ),
            1000,
        );
        return () => window.clearInterval(timer);
    }, [attempt.expiresAt, attempt.finished]);
    useEffect(() => {
        if (!attempt.finished && remaining === 0 && pending === 0)
            router.post(finish.url(attempt.id));
    }, [remaining, pending, attempt.id, attempt.finished]);
    async function select(questionId: number, choiceId: number) {
        setPending((n) => n + 1);
        setError('');
        try {
            await axios.post(answer.url(attempt.id), {
                question_id: questionId,
                choice_id: choiceId,
            });
            setSelected((current) => ({ ...current, [questionId]: choiceId }));
        } catch {
            setError('پاسخ ذخیره نشد. اتصال خود را بررسی و دوباره تلاش کنید.');
        } finally {
            setPending((n) => n - 1);
        }
    }
    return (
        <AppLayout>
            <Head title={quiz.title} />
            <main
                lang="fa"
                dir="rtl"
                className="storefront min-h-screen space-y-6 bg-[#f8f7f3] p-5 text-[#243b37] dark:bg-[#142823] dark:text-[#f8f7f3]"
            >
                <h1 className="storefront-heading">{quiz.title}</h1>
                {quiz.description && <MarkdownContent>{quiz.description}</MarkdownContent>}
                {attempt.finished ? (
                    <section className="space-y-4">
                        <p>
                            نتیجه آزمون:{' '}
                            {Number(attempt.score).toLocaleString('fa-IR')}
                        </p>
                        {certificateUrl && (
                            <Link
                                className="storefront-button"
                                href={certificateUrl}
                            >
                                مشاهده گواهی قبولی
                            </Link>
                        )}
                        <Link className="storefront-button" href={backUrl}>
                            بازگشت
                        </Link>
                    </section>
                ) : (
                    <>
                        <p role="timer">
                            زمان باقی‌مانده:{' '}
                            {Math.floor(remaining / 60).toLocaleString('fa-IR')}
                            :{String(remaining % 60).padStart(2, '0')}
                        </p>
                        {questions.map((question, index) => (
                            <fieldset
                                key={question.id}
                                disabled={remaining === 0 || pending > 0}
                                className="space-y-3 rounded-3xl border border-current/10 p-5"
                            >
                                <legend>
                                    {(index + 1).toLocaleString('fa-IR')}.{' '}
                                    {question.body}
                                </legend>
                                {question.choices.map((choice) => (
                                    <label
                                        className="flex gap-3"
                                        key={choice.id}
                                    >
                                        <input
                                            type="radio"
                                            name={`question-${question.id}`}
                                            checked={
                                                selected[question.id] ===
                                                choice.id
                                            }
                                            onChange={() =>
                                                select(question.id, choice.id)
                                            }
                                        />
                                        {choice.body}
                                    </label>
                                ))}
                            </fieldset>
                        ))}
                        {error && <p role="alert">{error}</p>}
                        <button
                            className="storefront-button"
                            disabled={pending > 0}
                            onClick={() => router.post(finish.url(attempt.id))}
                        >
                            {pending
                                ? 'در حال ذخیره پاسخ…'
                                : 'ثبت و پایان آزمون'}
                        </button>
                    </>
                )}
            </main>
        </AppLayout>
    );
}
