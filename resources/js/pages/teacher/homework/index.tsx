import { MarkdownContent } from '@/components/markdown-content';
import AppLayout from '@/layouts/app-layout';
import { approve, download } from '@/routes/teacher/homework';
import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

type Submission = { id: number; name: string; score: number | null; note: string | null; approved_at: string | null; files: { id: number; name: string }[] };

export default function HomeworkIndex({ contentId, question, submissions }: { contentId: number; question: string; submissions: Submission[] }) {
    return <AppLayout breadcrumbs={[]}><Head title="ارسال‌های تکلیف" /><main lang="fa" dir="rtl" className="space-y-6 p-6 text-right">
        <h1 className="text-xl font-bold">ارسال‌های تکلیف</h1><MarkdownContent>{question}</MarkdownContent>
        {submissions.length === 0 && <p>هنوز ارسالی ثبت نشده است.</p>}
        {submissions.map((submission) => <Review key={submission.id} contentId={contentId} submission={submission} />)}
    </main></AppLayout>;
}

function Review({ contentId, submission }: { contentId: number; submission: Submission }) {
    const form = useForm({ score: submission.score === null ? '' : String(submission.score), note: submission.note ?? '' });
    function submit(event: FormEvent) { event.preventDefault(); form.post(approve.url({ content: contentId, submission: submission.id }), { preserveScroll: true }); }
    return <section className="space-y-3 rounded-xl border p-4"><h2 className="font-bold">{submission.name}</h2>
        <p>{submission.approved_at ? 'تأیید شده' : 'در انتظار بررسی'}</p>
        <ul>{submission.files.map((file) => <li key={file.id}><a className="underline" href={download.url({ content: contentId, file: file.id })}>{file.name}</a></li>)}</ul>
        <form onSubmit={submit} className="space-y-3"><label className="block">نمره از ۱۰۰ (اختیاری)<input className="block rounded border p-2" type="number" min="0" max="100" value={form.data.score} onChange={(event) => form.setData('score', event.target.value)} /></label>
            <label className="block">یادداشت (اختیاری)<textarea className="block w-full rounded border p-2" value={form.data.note} onChange={(event) => form.setData('note', event.target.value)} /></label>
            {Object.values(form.errors).map((error, index) => <p role="alert" key={index}>{error}</p>)}
            <button className="rounded bg-primary px-4 py-2 text-primary-foreground" disabled={form.processing}>{submission.approved_at ? 'ذخیره تغییرات' : 'تأیید ارسال'}</button>
        </form>
    </section>;
}
