import { Storefront } from '@/components/storefront';
import { index } from '@/routes/community';
import { moderate } from '@/routes/community/comments';
import { Link, router } from '@inertiajs/react';

export default function Moderation({
    comments,
}: {
    comments: {
        id: number;
        body: string;
        status: string;
        author: string;
        context: string;
    }[];
}) {
    return (
        <Storefront title="مدیریت دیدگاه‌ها" description="بررسی دیدگاه‌ها">
            <div className="mx-auto max-w-7xl space-y-6 px-5 py-12 lg:px-10">
                <Link href={index()} className="underline">
                    بازگشت به بحث‌ها
                </Link>
                <h1 className="storefront-heading">مدیریت دیدگاه‌ها</h1>
                {comments.length ? (
                    <ul className="space-y-4">
                        {comments.map((comment) => (
                            <li
                                key={comment.id}
                                className="space-y-3 rounded-3xl border border-current/15 p-5"
                            >
                                <p className="font-bold">
                                    {comment.author} · {comment.context}
                                </p>
                                <p className="text-sm">
                                    {comment.status === 'pending'
                                        ? 'در انتظار تأیید'
                                        : comment.status === 'visible'
                                          ? 'نمایش داده می‌شود'
                                          : 'مخفی'}
                                </p>
                                <p className="leading-8 whitespace-pre-wrap">
                                    {comment.body}
                                </p>
                                <button
                                    className="storefront-button px-4 py-2"
                                    onClick={() =>
                                        router.patch(
                                            moderate.url(comment.id),
                                            {
                                                status:
                                                    comment.status === 'visible'
                                                        ? 'hidden'
                                                        : 'visible',
                                            },
                                            { preserveScroll: true },
                                        )
                                    }
                                >
                                    {comment.status === 'visible'
                                        ? 'مخفی کردن'
                                        : 'تأیید و نمایش'}
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>دیدگاهی برای بررسی وجود ندارد.</p>
                )}
            </div>
        </Storefront>
    );
}
