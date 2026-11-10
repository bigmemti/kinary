import AppLogoIcon from '@/components/app-logo-icon';
import ReactMarkdown from 'react-markdown';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { dashboard, home, login, logout, register } from '@/routes';
import { index as cartIndex, destroy } from '@/routes/cart';
import { show as courseShow, index as coursesIndex } from '@/routes/course';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, BookOpen, ShoppingBag } from 'lucide-react';
import { type PropsWithChildren, useState } from 'react';

export const academyName = import.meta.env.VITE_APP_NAME ||'آکادمی';
export const persianNumber = (value: number) =>
    new Intl.NumberFormat('fa-IR').format(value);

export interface PublicCourse {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    thumbnail: string | null;
    teacher?: { user?: { name: string } } | null;
}

export interface CartItem {
    id: number;
    spaceId: number;
    name: string;
    courseTitle: string;
    courseSlug: string | null;
    spaceName: string;
    price: number;
}

interface StorefrontProps {
    cartNotice?: string | null;
    canonicalUrl: string;
    auth: { user: { name: string } | null };
    storefrontCart: CartItem[];
    errors: { cart?: string };
    [key: string]: unknown;
}

export function Storefront({
    children,
    title,
    description,
}: PropsWithChildren<{ title: string; description: string }>) {
    const {
        auth,
        canonicalUrl,
        storefrontCart = [],
        cartNotice,
        errors,
    } = usePage<StorefrontProps>().props;

    return (
        <div
            dir="rtl"
            lang="fa"
            className="storefront min-h-screen bg-[#f8f7f3] text-[#243b37] dark:bg-[#142823] dark:text-[#f8f7f3]"
        >
            <Head title={`${title} | ${academyName}`}>
                <meta
                    head-key="description"
                    name="description"
                    content={description}
                />
                <link
                    head-key="canonical"
                    rel="canonical"
                    href={canonicalUrl}
                />
                <meta
                    property="og:title"
                    content={`${title} | ${academyName}`}
                />
                <meta property="og:description" content={description} />
                <meta property="og:locale" content="fa_IR" />
            </Head>
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:block focus:p-4"
            >
                رفتن به محتوای اصلی
            </a>
            <header className="border-b border-current/10 bg-white/70 dark:bg-white/5">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5 lg:px-10">
                    <Link
                        href={home()}
                        className="flex items-center gap-3 font-bold"
                    >
                        <span className="flex size-11 items-center justify-center rounded-2xl bg-[#244d40] text-[#e2ecb5]">
                            <AppLogoIcon className="size-6" />
                        </span>
                        <span>
                            {academyName}
                            <span className="mt-1 block text-xs font-normal opacity-65">
                                از یادگیری تا مهندسی نرم‌افزار
                            </span>
                        </span>
                    </Link>
                    <nav
                        aria-label="ناوبری اصلی"
                        className="order-3 flex w-full justify-center gap-6 border-t border-current/10 pt-4 text-sm md:order-0 md:w-auto md:border-0 md:pt-0"
                    >
                        <Link href={coursesIndex()}>همه دوره‌ها</Link>
                        <Link href={home().url + '#teachers'}>مدرسین</Link>
                        <Link href={home().url + '#faq'}>پرسش‌های متداول</Link>
                    </nav>
                    <div className="flex items-center gap-3 text-sm">
                        <Dialog>
                            <DialogTrigger asChild>
                                <button
                                    type="button"
                                    className="relative rounded-xl border border-current/15 p-3 transition hover:bg-black/5 dark:hover:bg-white/10"
                                    aria-label={`سبد خرید، ${persianNumber(storefrontCart.length)} مورد`}
                                >
                                    <ShoppingBag
                                        className="size-5"
                                        aria-hidden="true"
                                    />
                                    {storefrontCart.length > 0 && (
                                        <span className="absolute -top-2 -right-2 rounded-full bg-[#244d40] px-1.5 text-xs text-white">
                                            {persianNumber(
                                                storefrontCart.length,
                                            )}
                                        </span>
                                    )}
                                </button>
                            </DialogTrigger>
                            <DialogContent
                                dir="rtl"
                                lang="fa"
                                className="storefront text-right"
                            >
                                <DialogTitle className="px-5">
                                    سبد خرید
                                </DialogTitle>
                                <DialogDescription>
                                    {auth.user
                                        ? 'انتخاب‌های شما برای ادامه یادگیری'
                                        : 'برای مشاهده سبد خرید، وارد حساب خود شوید.'}
                                </DialogDescription>
                                {auth.user ? (
                                    storefrontCart.length > 0 ? (
                                        <ul className="grid max-h-80 gap-3 overflow-auto">
                                            {storefrontCart.map((item) => (
                                                <li
                                                    key={item.id}
                                                    className="rounded-xl border p-4"
                                                >
                                                    <p className="font-semibold">
                                                        {item.courseTitle}
                                                    </p>
                                                    <p className="mt-1 text-sm opacity-70">
                                                        {item.spaceName} ·{' '}
                                                        {item.name}
                                                    </p>
                                                    <div className="mt-3 flex items-center justify-between gap-4 text-sm">
                                                        <span>
                                                            {persianNumber(
                                                                item.price,
                                                            )}{' '}
                                                            تومان
                                                        </span>
                                                        <Form
                                                            action={
                                                                destroy(item.id)
                                                                    .url
                                                            }
                                                            method="delete"
                                                            options={{
                                                                preserveScroll: true,
                                                            }}
                                                        >
                                                            {({
                                                                processing,
                                                            }) => (
                                                                <button
                                                                    type="submit"
                                                                    disabled={
                                                                        processing
                                                                    }
                                                                    className="rounded-lg px-3 py-2 underline underline-offset-4 disabled:opacity-50"
                                                                    aria-label={`حذف پلن ${item.name} از سبد خرید`}
                                                                >
                                                                    {processing
                                                                        ? 'در حال حذف…'
                                                                        : 'حذف'}
                                                                </button>
                                                            )}
                                                        </Form>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="rounded-xl border border-dashed p-8 text-center">
                                            هنوز دوره‌ای به سبد خرید اضافه
                                            نکرده‌اید.
                                        </p>
                                    )
                                ) : (
                                    <Link
                                        className="storefront-button"
                                        href={login()}
                                    >
                                        ورود به حساب
                                    </Link>
                                )}
                                {auth.user && (
                                    <Link
                                        href={cartIndex()}
                                        className="storefront-button"
                                    >
                                        مشاهده سبد خرید و پرداخت
                                    </Link>
                                )}
                                {errors?.cart && (
                                    <p
                                        role="alert"
                                        className="text-sm leading-7"
                                    >
                                        {errors.cart}
                                    </p>
                                )}
                            </DialogContent>
                        </Dialog>
                        {auth.user ? (
                            <>
                                <Link
                                    href={dashboard()}
                                    className="storefront-button"
                                >
                                    داشبورد
                                </Link>
                                <Link
                                    href={logout()}
                                    as="button"
                                    className="px-1 py-2"
                                >
                                    خروج
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href={login()} className="px-1 py-2">
                                    ورود
                                </Link>
                                <Link
                                    href={register()}
                                    className="storefront-button"
                                >
                                    ثبت‌نام
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>
            <main id="main-content">
                {errors?.cart && (
                    <p
                        role="alert"
                        className="mx-auto max-w-7xl px-5 pt-6 text-sm leading-7 lg:px-10"
                    >
                        {errors.cart}
                    </p>
                )}
                {cartNotice && (
                    <p
                        role="status"
                        className="mx-auto max-w-7xl px-5 pt-6 text-sm leading-7 lg:px-10"
                    >
                        {cartNotice}
                    </p>
                )}
                {children}
            </main>
            <footer className="border-t border-current/10 bg-[#eaece3] dark:bg-black/10">
                <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-[2fr_1fr_1fr] lg:px-10">
                    <div>
                        <p className="text-xl font-bold">{academyName}</p>
                        <p className="mt-4 max-w-md text-sm leading-8 opacity-75">
                            یادگیری نرم‌افزار، از مبانی دانشگاهی تا مهارت‌های
                            بازار کار. جایی برای ساختن دانش و نگاه مهندسی.
                        </p>
                    </div>
                    <nav
                        aria-label="دسترسی سریع"
                        className="grid content-start gap-4 text-sm"
                    >
                        <p className="font-bold">مسیر یادگیری</p>
                        <Link href={coursesIndex()}>همه دوره‌ها</Link>
                        <Link href={home().url + '#categories'}>
                            دسته‌بندی‌ها
                        </Link>
                        <Link href={home().url + '#teachers'}>مدرسین</Link>
                    </nav>
                    <nav
                        aria-label="حساب کاربری"
                        className="grid content-start gap-4 text-sm"
                    >
                        <p className="font-bold">همراه شما</p>
                        <Link href={home().url + '#faq'}>پرسش‌های متداول</Link>
                        {auth.user ? (
                            <Link href={dashboard()}>داشبورد</Link>
                        ) : (
                            <>
                                <Link href={login()}>ورود به حساب</Link>
                                <Link href={register()}>ساخت حساب کاربری</Link>
                            </>
                        )}
                    </nav>
                </div>
                <p className="border-t border-current/10 px-5 py-5 text-center text-xs opacity-65">
                    حقوق محتوای این وب‌سایت متعلق به {academyName} است.
                </p>
            </footer>
        </div>
    );
}

export function CourseCard({ course }: { course: PublicCourse }) {
    const [failedThumbnail, setFailedThumbnail] = useState(false);

    return (
        <article className="group overflow-hidden rounded-3xl border border-current/10 bg-white dark:bg-white/5">
            <Link
                href={courseShow(course.slug)}
                className="block"
                aria-label={`مشاهده دوره ${course.title}`}
            >
                {course.thumbnail && !failedThumbnail ? (
                    <img
                        src={course.thumbnail}
                        alt=""
                        loading="lazy"
                        onError={() => setFailedThumbnail(true)}
                        className="aspect-video w-full object-cover"
                    />
                ) : (
                    <div className="flex aspect-video items-center justify-center bg-[#e7ebdf] text-[#477059] dark:bg-white/10 dark:text-[#d9e3bd]">
                        <BookOpen
                            className="size-14"
                            strokeWidth={1}
                            aria-hidden="true"
                        />
                    </div>
                )}
                <div className="p-6">
                    <p className="text-xs opacity-65">
                        {course.teacher?.user?.name ?? 'دوره آموزشی'}
                    </p>
                    <h3 className="mt-3 text-lg leading-8 font-bold">
                        {course.title}
                    </h3>
                    {course.description && (
                        <div className="mt-2 line-clamp-2 text-sm leading-7 opacity-70 whitespace-pre-wrap">
                            <ReactMarkdown allowedElements={[]} unwrapDisallowed>{course.description}</ReactMarkdown>
                        </div>
                    )}
                    <span className="mt-6 flex items-center justify-between border-t border-current/10 pt-4 text-sm font-semibold">
                        مشاهده دوره
                        <ArrowLeft
                            className="size-4 transition group-hover:-translate-x-1"
                            aria-hidden="true"
                        />
                    </span>
                </div>
            </Link>
        </article>
    );
}

export function EmptyState({
    title,
    children,
}: PropsWithChildren<{ title: string }>) {
    return (
        <div className="rounded-3xl border border-dashed border-current/20 bg-white/40 px-6 py-12 text-center dark:bg-white/5">
            <BookOpen
                className="mx-auto mb-4 size-8 opacity-45"
                strokeWidth={1.3}
                aria-hidden="true"
            />
            <h3 className="font-bold">{title}</h3>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 opacity-65">
                {children}
            </p>
        </div>
    );
}
