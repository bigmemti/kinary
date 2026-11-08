import { MarkdownContent } from '@/components/markdown-content';
import AppLayout from '@/layouts/app-layout';
import { today } from '@/routes/student/flashcards';
import { store as storeDeck, destroy as destroyDeck } from '@/routes/student/flashcards/decks';
import { store as storeCard, destroy as destroyCard } from '@/routes/student/flashcards/cards';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

type Card = { id: number; question: string; answer: string; box: number; due_at: string };
type Deck = { id: number; name: string; cards: Card[] };

function CardForm({ deckId }: { deckId: number }) {
    const form = useForm({ question: '', answer: '' });
    return <form className="space-y-2" onSubmit={(event) => {
        event.preventDefault();
        form.post(storeCard.url(deckId), { preserveScroll: true, onSuccess: () => form.reset() });
    }}>
        <label className="block">پرسش<input className="block w-full rounded-xl border bg-background p-2" value={form.data.question} onChange={(event) => form.setData('question', event.target.value)} required /></label>
        <label className="block">پاسخ<textarea className="block w-full rounded-xl border bg-background p-2" value={form.data.answer} onChange={(event) => form.setData('answer', event.target.value)} required /></label>
        <button disabled={form.processing} className="storefront-button">افزودن کارت</button>
        {Object.values(form.errors).map((error, i) => <p key={i} className="text-red-600">{error}</p>)}
    </form>;
}

function CardItem({ card }: { card: Card }) {
    const [revealed, setRevealed] = useState(false);
    return <li className="space-y-3 rounded-xl border border-current/15 p-4">
        <MarkdownContent>{card.question}</MarkdownContent>
        <button type="button" className="underline" onClick={() => setRevealed(!revealed)}>{revealed ? 'پنهان کردن پاسخ' : 'نمایش پاسخ'}</button>
        {revealed && <MarkdownContent>{card.answer}</MarkdownContent>}
        <p className="text-sm opacity-70">جعبه {card.box} · مرور بعدی: {new Date(card.due_at).toLocaleString('fa-IR')}</p>
        <button type="button" className="text-sm underline" onClick={() => { if (window.confirm('این کارت حذف شود؟')) router.delete(destroyCard.url(card.id), { preserveScroll: true }); }}>حذف کارت</button>
    </li>;
}

export default function FlashcardsIndex({ decks }: { decks: Deck[] }) {
    const form = useForm({ name: '' });
    return <AppLayout><Head title="فلش‌کارت‌های من" /><main lang="fa" dir="rtl" className="storefront min-w-0 flex-1 space-y-6 bg-[#f8f7f3] p-5 text-right text-[#243b37] lg:p-10 dark:bg-[#142823] dark:text-[#f8f7f3]">
        <h1 className="storefront-heading text-2xl font-bold">فلش‌کارت‌های من</h1>
        <Link className="underline" href={today()}>مرور امروز</Link>
        <form className="flex flex-wrap gap-3" onSubmit={(event) => { event.preventDefault(); form.post(storeDeck.url(), { preserveScroll: true, onSuccess: () => form.reset() }); }}>
            <label>نام دسته جدید<input className="ms-2 rounded-xl border bg-background p-2" value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} required /></label>
            <button className="storefront-button" disabled={form.processing}>ساخت دسته</button>
        </form>
        {decks.length === 0 && <p>هنوز دسته‌ای نساخته‌اید.</p>}
        {decks.map((deck) => <section key={deck.id} className="space-y-4 rounded-3xl border border-current/10 p-5">
            <h2 className="text-xl font-bold">{deck.name}</h2>
            <p>{deck.cards.length} کارت</p>
            <ul className="space-y-3">{deck.cards.map((card) => <CardItem key={card.id} card={card} />)}</ul>
            <details><summary className="cursor-pointer">افزودن کارت به این دسته</summary><CardForm deckId={deck.id} /></details>
            <button className="text-sm underline" onClick={() => { if (window.confirm('دسته و کارت‌های آن حذف شوند؟')) router.delete(destroyDeck.url(deck.id), { preserveScroll: true }); }}>حذف دسته</button>
        </section>)}
    </main></AppLayout>;
}
