import { Storefront } from '@/components/storefront';
import { BookOpen, GraduationCap } from 'lucide-react';
import { type PropsWithChildren } from 'react';

export default function StorefrontAuth({
    title,
    description,
    children,
}: PropsWithChildren<{ title: string; description: string }>) {
    return (
        <Storefront title={title} description={description}>
            <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 md:grid-cols-2 md:py-20 lg:px-10">
                <div className="rounded-3xl border border-current/10 bg-white p-6 sm:p-9 dark:bg-white/5">
                    <p className="storefront-eyebrow">حساب کاربری آکادمی</p>
                    <h1 className="storefront-heading">{title}</h1>
                    <p className="mt-3 mb-8 text-sm leading-8 opacity-70">
                        {description}
                    </p>
                    {children}
                </div>
                <aside className="relative overflow-hidden rounded-[2rem] bg-[#244d40] p-8 text-[#f8f7f3] sm:p-12">
                    <BookOpen
                        className="mb-10 size-12 text-[#d9e3ad]"
                        strokeWidth={1.2}
                        aria-hidden="true"
                    />
                    <p className="text-3xl leading-[1.9] font-bold">
                        از فهمیدن شروع کن.
                        <br />
                        <span className="text-[#d9e3ad]">
                            با نگاه مهندسی ادامه بده.
                        </span>
                    </p>
                    <p className="mt-6 text-sm leading-8 text-white/75">
                        از مبانی دانشگاهی تا مهارت‌های بازار کار؛ مسیر آکادمی،
                        یادگیری مهندسی نرم‌افزار است.
                    </p>
                    <div className="mt-10 flex items-center gap-3 border-t border-white/20 pt-6 text-sm text-[#d9e3ad]">
                        <GraduationCap className="size-6" aria-hidden="true" />
                        دانش پایه، در کنار تجربه عملی
                    </div>
                </aside>
            </section>
        </Storefront>
    );
}
