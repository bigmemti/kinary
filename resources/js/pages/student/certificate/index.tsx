import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';

export default function Certificates({ certificates }: { certificates: { space: string; course: string; score: string; url: string }[] }) {
    return <AppLayout><Head title="گواهی‌های من" /><main lang="fa" dir="rtl" className="storefront min-h-screen space-y-6 bg-[#f8f7f3] p-5 text-[#243b37] dark:bg-[#142823] dark:text-[#f8f7f3]"><h1 className="storefront-heading">گواهی‌های من</h1>{certificates.length === 0 ? <p>هنوز گواهی قبولی ندارید.</p> : certificates.map((certificate) => <article key={certificate.url} className="space-y-3 rounded-3xl border border-current/10 p-5"><h2 className="font-bold">{certificate.course} · {certificate.space}</h2><p>نمره: {Number(certificate.score).toLocaleString('fa-IR')}</p><Link className="storefront-button" href={certificate.url}>مشاهده و اشتراک‌گذاری گواهی</Link></article>)}</main></AppLayout>;
}
