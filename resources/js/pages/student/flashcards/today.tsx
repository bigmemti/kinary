import { MarkdownContent } from '@/components/markdown-content';
import AppLayout from '@/layouts/app-layout';
import { index, review } from '@/routes/student/flashcards';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

type Card = { id: number; question: string; answer: string; deck_name: string };
function ReviewCard({ card }: { card: Card }) {
    const [revealed, setRevealed] = useState(false);
    const [processing, setProcessing] = useState(false);
    function answer(correct: boolean) {
        setProcessing(true);
        router.post(review.url(card.id), { correct }, { preserveScroll: true, onFinish: () => setProcessing(false) });
    }
    return <article className="space-y-4 rounded-3xl border border-current/10 p-5">
        <p className="text-sm opacity-70">{card.deck_name}</p>
        <MarkdownContent>{card.question}</MarkdownContent>
        {!revealed ? <button className="storefront-button" onClick={() => setRevealed(true)}>نمایش پاسخ</button> : <>
            <MarkdownContent>{card.answer}</MarkdownContent>
            <div className="flex flex-wrap gap-3"><button className="storefront-button" disabled={processing} onClick={() => answer(true)}>درست پاسخ دادم</button><button className="rounded-xl border px-4 py-2" disabled={processing} onClick={() => answer(false)}>اشتباه پاسخ دادم</button></div>
        </>}
    </article>;
}
export default function FlashcardsToday({ cards }: { cards: Card[] }) {
    return <AppLayout><Head title="مرور امروز" /><main lang="fa" dir="rtl" className="storefront min-w-0 flex-1 space-y-6 bg-[#f8f7f3] p-5 text-right text-[#243b37] lg:p-10 dark:bg-[#142823] dark:text-[#f8f7f3]">
        <h1 className="storefront-heading text-2xl font-bold">مرور امروز</h1>
        <Link className="underline" href={index()}>دسته‌های من</Link>
        {cards.length === 0 && <p>در حال حاضر کارتی برای مرور ندارید.</p>}
        {cards.map((card) => <ReviewCard key={card.id} card={card} />)}
    </main></AppLayout>;
}
