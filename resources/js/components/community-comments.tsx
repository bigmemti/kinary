import { login } from '@/routes';
import {
    index as discussionIndex,
    store as discussionStore,
} from '@/routes/community';
import { moderate, store } from '@/routes/community/comments';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';

export interface CommunityComment {
    id: number;
    body: string;
    author: string;
    canModerate: boolean;
    canConvert: boolean;
    discussionId: number | null;
    discussionUrl: string | null;
    replies: CommunityComment[];
}

type Context = {
    type: 'site' | 'course' | 'lesson' | 'discussion';
    targetId?: number;
    spaceId?: number;
};

function CommentForm({
    context,
    parentId,
    onDone,
}: {
    context: Context;
    parentId?: number;
    onDone?: () => void;
}) {
    const form = useForm({
        type: context.type,
        target_id: context.targetId ?? null,
        space_id: context.spaceId ?? null,
        parent_id: parentId ?? null,
        body: '',
    });
    const [sent, setSent] = useState(false);
    function submit(event: FormEvent) {
        event.preventDefault();
        form.post(store.url(), {
            preserveScroll: true,
            onSuccess: () => {
                form.reset('body');
                setSent(true);
                onDone?.();
            },
        });
    }
    return (
        <form onSubmit={submit} className="space-y-3">
            <label
                className="block text-sm font-bold"
                htmlFor={`comment-${parentId ?? 'new'}`}
            >
                {parentId ? 'پاسخ شما' : 'نظر شما'}
            </label>
            <textarea
                id={`comment-${parentId ?? 'new'}`}
                value={form.data.body}
                onChange={(event) => form.setData('body', event.target.value)}
                required
                maxLength={5000}
                rows={3}
                className="w-full rounded-xl border border-current/20 bg-transparent p-3"
            />
            {form.errors.body && <p role="alert">{form.errors.body}</p>}
            {sent && (
                <p role="status">
                    {context.type === 'site'
                        ? 'نظر شما برای بررسی ثبت شد.'
                        : 'نظر شما ثبت شد.'}
                </p>
            )}
            <button
                className="storefront-button px-4 py-2"
                disabled={form.processing}
            >
                ثبت {parentId ? 'پاسخ' : 'نظر'}
            </button>
        </form>
    );
}

function CommentItem({
    comment,
    context,
    signedIn,
}: {
    comment: CommunityComment;
    context: Context;
    signedIn: boolean;
}) {
    const [replying, setReplying] = useState(false);
    const [converting, setConverting] = useState(false);
    const form = useForm({
        source_comment_id: comment.id,
        is_public: context.type !== 'lesson',
    });
    return (
        <li className="space-y-3 rounded-2xl border border-current/15 p-4">
            <p className="font-bold">{comment.author}</p>
            <p className="text-sm leading-8 whitespace-pre-wrap">
                {comment.body}
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
                {signedIn && (
                    <button
                        type="button"
                        onClick={() => setReplying(!replying)}
                    >
                        پاسخ
                    </button>
                )}
                {comment.canModerate && (
                    <button
                        type="button"
                        onClick={() =>
                            router.patch(
                                moderate.url(comment.id),
                                { status: 'hidden' },
                                { preserveScroll: true },
                            )
                        }
                    >
                        مخفی کردن
                    </button>
                )}
                {comment.discussionUrl ? (
                    <Link href={comment.discussionUrl}>مشاهده بحث</Link>
                ) : (
                    comment.canConvert &&
                    context.type !== 'discussion' && (
                        <button
                            type="button"
                            onClick={() => setConverting(!converting)}
                        >
                            تبدیل به بحث
                        </button>
                    )
                )}
            </div>
            {replying && (
                <CommentForm
                    context={context}
                    parentId={comment.id}
                    onDone={() => setReplying(false)}
                />
            )}
            {converting && (
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.post(discussionStore.url());
                    }}
                    className="space-y-3"
                >
                    <p className="text-sm">
                        عنوان بحث از متن دیدگاه ساخته می‌شود.
                    </p>
                    <p className="text-sm">
                        {context.type === 'lesson'
                            ? 'این بحث برای دانشجویان دارای دسترسی به درس است.'
                            : 'این بحث عمومی خواهد بود.'}
                    </p>
                    {Object.values(form.errors).map((error) => (
                        <p role="alert" key={error}>
                            {error}
                        </p>
                    ))}
                    <button
                        className="storefront-button px-4 py-2"
                        disabled={form.processing}
                    >
                        ایجاد بحث
                    </button>
                </form>
            )}
            {comment.replies.length > 0 && (
                <ul className="space-y-3 border-r border-current/15 pr-3">
                    {comment.replies.map((reply) => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            context={context}
                            signedIn={signedIn}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
}

export default function CommunityComments({
    comments,
    context,
    title = 'دیدگاه‌ها',
}: {
    comments: CommunityComment[];
    context: Context;
    title?: string;
}) {
    const { auth } = usePage<{ auth: { user: { id: number } | null } }>().props;
    return (
        <section dir="rtl" className="space-y-6 py-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="storefront-heading">{title}</h2>
                <Link href={discussionIndex()} className="text-sm underline">
                    همه بحث‌ها
                </Link>
            </div>
            {comments.length ? (
                <ul className="space-y-4">
                    {comments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            context={context}
                            signedIn={!!auth.user}
                        />
                    ))}
                </ul>
            ) : (
                <p className="text-sm opacity-70">هنوز دیدگاهی ثبت نشده است.</p>
            )}
            {auth.user ? (
                <CommentForm context={context} />
            ) : (
                <p className="text-sm">
                    برای ثبت دیدگاه{' '}
                    <Link href={login()} className="underline">
                        وارد حساب خود شوید
                    </Link>
                    .
                </p>
            )}
        </section>
    );
}
