import {
    academyName,
    CourseCard,
    EmptyState,
    Storefront,
    type PublicCourse,
} from '@/components/storefront';
import { show as categoryShow } from '@/routes/category';
import { index as coursesIndex } from '@/routes/course';
import { show as teacherShow } from '@/routes/teacher';
import { Link } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowLeft,
    BookOpen,
    ChevronDown,
    Compass,
    GraduationCap,
    Layers3,
    Lightbulb,
    Route,
} from 'lucide-react';

interface HomeProps {
    courses: PublicCourse[];
    categories: { id: number; name: string; slug: string }[];
    teachers: { id: number; name: string; description: string | null }[];
}

const questions = [
    {
        question: 'از کجا دوره مناسبم را پیدا کنم؟',
        answer: 'در صفحه «همه دوره‌ها»، عنوان یا موضوع موردنظرتان را جستجو کنید و برای آشنایی بیشتر، صفحه هر دوره را ببینید.',
    },
    {
        question: 'آموزش‌ها چه مسیری را دنبال می‌کنند؟',
        answer: 'هدف آکادمی، تربیت مهندس نرم‌افزار است. آموزش‌ها هم مبانی دانشگاهی و هم مهارت‌های موردنیاز بازار کار را در بر می‌گیرند.',
    },
    {
        question: 'آیا برای دیدن فهرست دوره‌ها باید ثبت‌نام کنم؟',
        answer: 'خیر. صفحه اصلی و فهرست دوره‌ها بدون ورود در دسترس هستند. برای دسترسی به حساب شخصی، از گزینه ورود یا ثبت‌نام استفاده کنید.',
    },
    {
        question: 'بعد از ورود، چطور به حسابم برگردم؟',
        answer: 'پس از ورود، دکمه «داشبورد» در بالای صفحه نمایش داده می‌شود. از همان‌جا می‌توانید به حساب کاربری‌تان بروید.',
    },
];

export default function Home({ courses, categories, teachers }: HomeProps) {
    return (
        <Storefront
            title="یادگیری مهندسی نرم‌افزار"
            description={`${academyName}؛ آموزش مبانی دانشگاهی و مهارت‌های بازار کار با هدف تربیت مهندس نرم‌افزار. دوره‌ها و مدرسین را بشناسید و مسیر یادگیری خود را پیدا کنید.`}
        >
            <section className="relative overflow-hidden border-b border-current/10">
                <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 md:grid-cols-[1.15fr_1fr] md:py-24 lg:px-10">
                    <div className="relative z-10">
                        <p className="mb-6 flex items-center gap-2 text-sm font-medium">
                            <span className="size-2 rounded-full bg-[#738745]" />
                            از مبانی دانشگاه تا دنیای کار
                        </p>
                        <h1 className="max-w-2xl text-4xl leading-[1.65] font-black sm:text-5xl lg:text-6xl">
                            مسیرت را به سوی
                            <br />
                            <span className="text-[#6a7d3c] dark:text-[#d9e3ad]">
                                مهندسی نرم‌افزار
                            </span>
                            <br />
                            بساز.
                        </h1>
                        <p className="mt-6 max-w-lg text-base leading-9 opacity-75">
                            کدنویسی، بخشی از مسیر است. در {academyName}، دانش
                            پایه و مهارت عملی را کنار هم می‌گذاریم تا با نگاه یک
                            مهندس، نرم‌افزار بسازی.
                        </p>
                        <div className="mt-8 flex flex-wrap items-center gap-5">
                            <Link
                                href={coursesIndex()}
                                className="storefront-button gap-4 px-6 py-4"
                            >
                                کشف دوره‌ها
                                <ArrowLeft className="size-4" />
                            </Link>
                            <a
                                href="#approach"
                                className="flex items-center gap-2 text-sm border border-[#6a7d3c]/40 px-4 py-3 rounded-2xl"
                            >
                                آشنایی با مسیر ما
                                <ArrowDown className="size-4" />
                            </a>
                        </div>
                    </div>
                    <div
                        aria-hidden="true"
                        className="relative mx-auto flex aspect-square w-full max-w-md items-center justify-center"
                    >
                        <div className="absolute inset-3 rounded-full border border-[#819264]/30" />
                        <div className="absolute inset-12 rounded-full border border-dashed border-[#819264]/30" />
                        <div className="relative w-4/5 rotate-[-5deg] rounded-[2rem] bg-[#244d40] p-8 text-[#f6f5ea] shadow-2xl shadow-[#244d40]/15">
                            <div className="flex items-center justify-between border-b border-white/20 pb-5">
                                <BookOpen
                                    className="size-8"
                                    strokeWidth={1.3}
                                />
                                <span className="text-sm text-[#d9e3ad]">
                                    نگاه مهندسی
                                </span>
                            </div>
                            <div className="py-9 text-3xl leading-[1.8] font-bold">
                                بفهم.
                                <br />
                                تجربه کن.
                                <br />
                                <span className="text-[#d9e3ad]">بساز.</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs opacity-70">
                                <span className="h-px flex-1 bg-white/30" />
                                یک مسیر پیوسته برای یادگیری
                            </div>
                        </div>
                        <div className="absolute top-7 right-0 flex rotate-6 items-center gap-3 rounded-2xl border border-[#244d40]/10 bg-[#e5eacb] p-4 text-sm text-[#244d40] shadow-lg">
                            <GraduationCap className="size-6" />
                            دانش عمیق
                        </div>
                        <div className="absolute bottom-9 left-0 flex -rotate-3 items-center gap-3 rounded-2xl border border-[#244d40]/10 bg-[#f2e5ca] p-4 text-sm text-[#244d40] shadow-lg">
                            <Lightbulb className="size-6" />
                            مهارت کاربردی
                        </div>
                    </div>
                </div>
            </section>
            <section
                id="approach"
                aria-labelledby="approach-title"
                className="mx-auto max-w-7xl px-5 py-14 lg:px-10"
            >
                <h2 id="approach-title" className="mb-8 text-xl font-bold">
                    یادگیری با یک نگاه کامل‌تر
                </h2>
                <div className="grid gap-8 md:grid-cols-3">
                    {[
                        {
                            icon: GraduationCap,
                            title: 'پیوند دانشگاه و بازار کار',
                            text: 'مبانی نظری و مهارت‌های عملی، هر دو در مسیر مهندسی نرم‌افزار جای دارند.',
                        },
                        {
                            icon: Compass,
                            title: 'شفافیت در انتخاب',
                            text: 'رویکرد ما، روشن‌تر کردن انتخاب دوره و پلن آموزشی متناسب با نیاز شماست.',
                        },
                        {
                            icon: Layers3,
                            title: 'فراتر از تماشای آموزش',
                            text: 'چندپلنه بودن دوره‌ها و تنوع امکانات آموزشی، بخشی از رویکرد آکادمی است.',
                        },
                    ].map(({ icon: Icon, title, text }) => (
                        <div key={title} className="flex gap-4">
                            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#e7ebdf] text-[#38573d] dark:bg-white/10 dark:text-[#d9e3ad]">
                                <Icon className="size-6" strokeWidth={1.5} />
                            </span>
                            <div>
                                <h3 className="font-bold">{title}</h3>
                                <p className="mt-2 text-sm leading-7 opacity-65">
                                    {text}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
            <section
                id="categories"
                aria-labelledby="categories-title"
                className="mx-auto max-w-7xl px-5 py-12 lg:px-10"
            >
                <p className="storefront-eyebrow">
                    موضوع موردعلاقه‌ات را پیدا کن
                </p>
                <h2 id="categories-title" className="storefront-heading">
                    دسته‌بندی آموزش‌ها
                </h2>
                {categories.length ? (
                    <ul className="mt-8 flex flex-wrap gap-3">
                        {categories.map((category) => (
                            <li key={category.id}>
                                <Link
                                    href={categoryShow(category.slug)}
                                    className="flex items-center gap-3 rounded-2xl border border-current/15 bg-white/50 px-6 py-5 transition hover:bg-[#e7ebdf] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8b9b5a] dark:bg-white/5 dark:hover:bg-white/10"
                                >
                                    <BookOpen
                                        className="size-5 opacity-60"
                                        aria-hidden="true"
                                    />
                                    {category.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="mt-8">
                        <EmptyState title="دسته‌بندی‌ها در حال آماده‌سازی هستند">
                            پس از تکمیل دسته‌بندی‌ها، موضوعات آموزشی را در این
                            بخش خواهید دید.
                        </EmptyState>
                    </div>
                )}
            </section>
            <section
                id="courses"
                aria-labelledby="courses-title"
                className="mx-auto max-w-7xl px-5 py-12 lg:px-10"
            >
                <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
                    <div>
                        <p className="storefront-eyebrow">
                            یک قدم تازه در مسیر تو
                        </p>
                        <h2 id="courses-title" className="storefront-heading">
                            تازه‌ترین دوره‌ها
                        </h2>
                    </div>
                    <Link
                        href={coursesIndex()}
                        className="flex items-center gap-3 rounded-xl border border-current/20 px-5 py-3 text-sm"
                    >
                        مشاهده همه دوره‌ها
                        <ArrowLeft className="size-4" />
                    </Link>
                </div>
                {courses.length ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {courses.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                ) : (
                    <EmptyState title="هنوز دوره‌ای منتشر نشده است">
                        با انتشار نخستین دوره، معرفی و جزئیات آن در این بخش قرار
                        می‌گیرد.
                    </EmptyState>
                )}
            </section>
            <section
                id="teachers"
                aria-labelledby="teachers-title"
                className="mx-auto max-w-7xl px-5 py-12 lg:px-10"
            >
                <p className="storefront-eyebrow">آشنایی با همراهان مسیر</p>
                <h2 id="teachers-title" className="storefront-heading">
                    مدرسین آکادمی
                </h2>
                <div className="mt-8">
                    {teachers.length ? (
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {teachers.map((teacher) => (
                                <article
                                    key={teacher.id}
                                    className="rounded-3xl border border-current/10 bg-white/50 p-7 dark:bg-white/5"
                                >
                                    <span className="mb-5 flex size-16 items-center justify-center rounded-full bg-[#e7ebdf] text-xl text-[#38573d]">
                                        {teacher.name.trim().slice(0, 1)}
                                    </span>
                                    <h3 className="font-bold">
                                        {teacher.name}
                                    </h3>
                                    {teacher.description && (
                                        <p className="mt-2 line-clamp-3 text-sm leading-7 opacity-70">
                                            {teacher.description}
                                        </p>
                                    )}
                                    <Link
                                        href={teacherShow(teacher.id)}
                                        className="mt-4 inline-block text-sm font-bold underline underline-offset-4"
                                    >
                                        مشاهده مدرس و دوره‌ها
                                    </Link>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <EmptyState title="معرفی مدرسین با انتشار دوره‌ها">
                            مدرسین دوره‌های منتشرشده در این بخش معرفی می‌شوند.
                        </EmptyState>
                    )}
                </div>
            </section>
            <section
                id="faq"
                aria-labelledby="faq-title"
                className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-[1fr_1.6fr] lg:px-10"
            >
                <div>
                    <p className="storefront-eyebrow">پیش از شروع</p>
                    <h2 id="faq-title" className="storefront-heading">
                        شاید سؤال تو هم باشد
                    </h2>
                    <p className="mt-4 text-sm leading-8 opacity-65">
                        چند پاسخ کوتاه برای آشنایی با آکادمی و پیدا کردن مسیر
                        یادگیری.
                    </p>
                    <Route
                        className="mt-8 size-20 opacity-20"
                        strokeWidth={1}
                        aria-hidden="true"
                    />
                </div>
                <div className="divide-y divide-current/15 border-y border-current/15">
                    {questions.map(({ question, answer }) => (
                        <details key={question} className="group py-5">
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold [&::-webkit-details-marker]:hidden">
                                {question}
                                <ChevronDown className="size-4 shrink-0 transition group-open:rotate-180" />
                            </summary>
                            <p className="pt-4 text-sm leading-8 opacity-70">
                                {answer}
                            </p>
                        </details>
                    ))}
                </div>
            </section>
        </Storefront>
    );
}
