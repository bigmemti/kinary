import {
    EmptyState,
    persianNumber,
    Storefront,
    type CartItem,
} from '@/components/storefront';
import { checkout } from '@/routes';
import { destroy } from '@/routes/cart';
import { index, show } from '@/routes/course';
import { Form, Link } from '@inertiajs/react';
import { ShoppingBag } from 'lucide-react';

export default function Cart({
    items,
    total,
    balance,
    payableAmount,
}: {
    items: CartItem[];
    total: number;
    balance: number;
    payableAmount: number;
}) {
    return (
        <Storefront
            title="سبد خرید"
            description="پلن‌های انتخاب‌شده را مرور کنید و پرداخت سفارش را انجام دهید."
        >
            <section className="mx-auto max-w-7xl px-5 py-12 lg:px-10">
                <p className="storefront-eyebrow">انتخاب‌های شما</p>
                <h1 className="storefront-heading mb-8 flex items-center gap-3">
                    <ShoppingBag aria-hidden="true" />
                    سبد خرید
                </h1>
                {items.length ? (
                    <div className="grid items-start gap-8 lg:grid-cols-[1.5fr_1fr]">
                        <ul className="grid gap-4">
                            {items.map((item) => (
                                <li
                                    key={item.id}
                                    className="rounded-3xl border border-current/15 bg-white p-6 dark:bg-white/5"
                                >
                                    {item.courseSlug ? (
                                        <Link
                                            href={show(item.courseSlug)}
                                            className="font-bold underline-offset-4 hover:underline"
                                        >
                                            {item.courseTitle}
                                        </Link>
                                    ) : (
                                        <p className="font-bold">
                                            {item.courseTitle}
                                        </p>
                                    )}
                                    <p className="mt-3 text-sm leading-8 opacity-70">
                                        {item.spaceName} · {item.name}
                                    </p>
                                    <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                                        <span className="font-bold">
                                            {persianNumber(item.price)} تومان
                                        </span>
                                        <Form
                                            action={destroy(item.id).url}
                                            method="delete"
                                            options={{ preserveScroll: true }}
                                        >
                                            {({ processing }) => (
                                                <button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="rounded-xl border border-current/20 px-4 py-2 text-sm disabled:opacity-50"
                                                    aria-label={`حذف پلن ${item.name} از سبد خرید`}
                                                >
                                                    {processing
                                                        ? 'در حال حذف…'
                                                        : 'حذف از سبد خرید'}
                                                </button>
                                            )}
                                        </Form>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <aside className="rounded-3xl border border-current/15 bg-[#e7ebdf] p-7 dark:bg-white/5">
                            <h2 className="text-xl font-bold">خلاصه سفارش</h2>
                            <p className="mt-5 text-sm leading-8">
                                {persianNumber(items.length)} پلن در سبد خرید
                            </p>
                            <div className="mt-6 flex flex-wrap justify-between gap-3 border-t border-current/15 pt-6">
                                <span>مبلغ سفارش</span>
                                <strong>{persianNumber(total)} تومان</strong>
                            </div>
                            <div className="mt-4 flex flex-wrap justify-between gap-3">
                                <span>موجودی کیف پول</span>
                                <strong>{persianNumber(balance)} تومان</strong>
                            </div>
                            <div className="my-6 flex flex-wrap justify-between gap-3">
                                <span>مبلغ قابل پرداخت در درگاه</span>
                                <strong>
                                    {persianNumber(payableAmount)} تومان
                                </strong>
                            </div>
                            <p className="mb-6 text-xs leading-7 opacity-70">
                                برای ارتقا، اختلاف قیمت پلن فعلی و پلن
                                انتخاب‌شده محاسبه شده است.
                            </p>
                            <Form action={checkout().url} method="post">
                                {({ processing }) => (
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="storefront-button w-full disabled:opacity-50"
                                    >
                                        {processing
                                            ? 'در حال پردازش…'
                                            : payableAmount === 0
                                              ? 'پرداخت از کیف پول'
                                              : 'ادامه و پرداخت'}
                                    </button>
                                )}
                            </Form>
                        </aside>
                    </div>
                ) : (
                    <EmptyState title="سبد خرید شما خالی است">
                        <p>برای شروع، دوره‌ها و پلن‌های آموزشی را ببینید.</p>
                        <Link href={index()} className="storefront-button mt-5">
                            مشاهده دوره‌ها
                        </Link>
                    </EmptyState>
                )}
            </section>
        </Storefront>
    );
}
