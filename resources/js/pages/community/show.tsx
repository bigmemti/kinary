import CommunityComments, {
    type CommunityComment,
} from '@/components/community-comments';
import { Storefront } from '@/components/storefront';
import { index } from '@/routes/community';
import { Head, Link } from '@inertiajs/react';

export default function DiscussionShow({
    discussion,
    comments,
    description,
}: {
    discussion: {
        id: number;
        name: string;
        body: string | null;
        author: string;
        isPublic: boolean;
        course: string | null;
    };
    comments: CommunityComment[];
    description: string;
}) {
    return (
        <Storefront title={discussion.name} description={description}>
            {!discussion.isPublic && (
                <Head>
                    <meta
                        head-key="robots"
                        name="robots"
                        content="noindex, nofollow"
                    />
                </Head>
            )}
            <div className="mx-auto max-w-7xl space-y-6 px-5 py-12 lg:px-10">
                <Link href={index()} className="underline">
                    بازگشت به بحث‌ها
                </Link>
                <h1 className="storefront-heading">{discussion.name}</h1>
                <p className="text-sm opacity-70">
                    {discussion.author} ·{' '}
                    {discussion.isPublic ? 'عمومی' : 'خصوصی'}
                    {discussion.course ? ` · ${discussion.course}` : ''}
                </p>
                <p className="leading-8 whitespace-pre-wrap">
                    {discussion.body}
                </p>
                <CommunityComments
                    comments={comments}
                    context={{ type: 'discussion', targetId: discussion.id }}
                    title="پاسخ‌ها"
                />
            </div>
        </Storefront>
    );
}
