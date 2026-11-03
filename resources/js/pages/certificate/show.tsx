import { Storefront } from '@/components/storefront';
import { Head } from '@inertiajs/react';

export default function Certificate({
    certificate,
}: {
    certificate: {
        student: string;
        space: string;
        course: string;
        score: string;
    };
}) {
    return (
        <Storefront title="گواهی قبولی" description="گواهی قبولی آزمون پایانی">
            <Head title="گواهی قبولی" />
            <main
                lang="fa"
                dir="rtl"
                className="mx-auto max-w-3xl space-y-6 px-5 py-16 text-center"
            >
                <h1 className="storefront-heading">گواهی قبولی</h1>
                <p className="leading-9">
                    {certificate.student} در آزمون پایانی فضای آموزشی{' '}
                    {certificate.space} از دوره {certificate.course} پذیرفته شده
                    است.
                </p>
                <p>نمره: {Number(certificate.score).toLocaleString('fa-IR')}</p>
            </main>
        </Storefront>
    );
}
