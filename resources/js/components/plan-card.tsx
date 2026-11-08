import { MarkdownContent } from '@/components/markdown-content';
import { persianNumber } from '@/components/storefront';
import { login } from '@/routes';
import { destroy } from '@/routes/cart';
import { buy } from '@/routes/plan';
import { Form, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, BookOpen, Layers3 } from 'lucide-react';

export interface PublicPlan {
    id: number;
    name: string;
    description: string | null;
    price: number;
    payablePrice: number;
    action:
        | 'add'
        | 'remove'
        | 'replace'
        | 'upgrade'
        | 'enroll'
        | 'enrolled'
        | 'unavailable';
    upgradeFrom: string | null;
    contentsCount: number;
    lessonsCount: number;
}

export default function PlanCard({
    plan,
    highlighted = false,
}: {
    plan: PublicPlan;
    highlighted?: boolean;
}) {
    const { auth } = usePage<{ auth: { user: { id: number } | null } }>().props;
    const disabled =
        plan.action === 'enrolled' || plan.action === 'unavailable';
    const labels = {
        add: 'افزودن به سبد خرید',
        remove: 'حذف از سبد خرید',
        replace: 'تعویض پلن',
        upgrade: 'ارتقا',
        enroll: 'شرکت در دوره',
        enrolled: 'شرکت کرده‌اید',
        unavailable: 'امکان تنزیل وجود ندارد',
    };
    const label = labels[plan.action];
    return (
        <article
            className={`flex h-full flex-col rounded-3xl border bg-white p-6 sm:p-8 dark:bg-white/5 ${highlighted ? 'border-[#687943] ring-2 ring-[#8b9b5a]/40' : 'border-current/15'}`}
        >
            {highlighted && (
                <p className="mb-3 rounded-xl bg-[#e7ebdf] p-3 text-sm font-bold dark:bg-white/10">
                    شامل محتوای این یادآوری
                </p>
            )}
            <p className="storefront-eyebrow">پلن آموزشی</p>
            <h3 className="text-xl leading-8 font-bold">{plan.name}</h3>
            <p className="my-7 flex flex-wrap items-baseline gap-2">
                <span className="text-3xl font-bold">
                    {plan.price === 0 ? 'رایگان' : persianNumber(plan.price)}
                </span>
                {plan.price > 0 && (
                    <span className="text-sm opacity-65">تومان</span>
                )}
            </p>
            {plan.description && (
                <MarkdownContent className="mb-6 text-sm leading-8 opacity-80">
                    {plan.description}
                </MarkdownContent>
            )}
            {plan.upgradeFrom && !disabled && (
                <p className="mb-6 text-sm leading-8">
                    ارتقا از {plan.upgradeFrom}؛ مبلغ قابل پرداخت:{' '}
                    {persianNumber(plan.payablePrice)} تومان
                </p>
            )}
            <ul className="mb-8 grid gap-4 border-t border-current/10 pt-6 text-sm">
                <li className="flex items-center gap-3">
                    <Layers3
                        className="size-5 shrink-0 opacity-60"
                        aria-hidden="true"
                    />
                    دسترسی به {persianNumber(plan.contentsCount)} محتوا
                </li>
                <li className="flex items-center gap-3">
                    <BookOpen
                        className="size-5 shrink-0 opacity-60"
                        aria-hidden="true"
                    />
                    در {persianNumber(plan.lessonsCount)} درس
                </li>
            </ul>
            {auth.user && disabled ? (
                <button
                    type="button"
                    disabled
                    className="storefront-button mt-auto w-full opacity-50"
                >
                    {label}
                </button>
            ) : auth.user ? (
                <Form
                    action={
                        plan.action === 'remove'
                            ? destroy(plan.id).url
                            : buy(plan.id).url
                    }
                    method={plan.action === 'remove' ? 'delete' : 'post'}
                    className="mt-auto"
                    options={{ preserveScroll: true }}
                >
                    {({ processing }) => (
                        <button
                            type="submit"
                            disabled={processing}
                            className="storefront-button w-full gap-3 disabled:opacity-50"
                            aria-label={`${label}: ${plan.name}`}
                        >
                            {processing ? 'در حال انجام…' : label}
                            <ArrowLeft className="size-4" aria-hidden="true" />
                        </button>
                    )}
                </Form>
            ) : (
                <Link
                    href={login()}
                    className="storefront-button mt-auto w-full gap-3"
                >
                    {plan.price === 0
                        ? 'ورود برای شرکت در دوره'
                        : 'ورود برای انتخاب پلن'}
                    <ArrowLeft className="size-4" aria-hidden="true" />
                </Link>
            )}
        </article>
    );
}
