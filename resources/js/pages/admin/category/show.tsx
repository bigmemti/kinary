import { DashboardContainer, DashboardHeader } from '@/components/dashboard';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { edit, index, show } from '@/routes/admin/category';
import { breadcrumbBuilder } from '@/util/breadcrumb';
import { Head, Link } from '@inertiajs/react';
import type { Category } from './form';

export default function Show({ category }: { category: Category }) {
    return (
        <AppLayout
            breadcrumbs={breadcrumbBuilder()
                .dashboard()
                .push('دسته‌بندی‌ها', index().url)
                .push(category.name, show(category.id).url)
                .build()}
        >
            <Head title={category.name} />
            <DashboardContainer>
                <DashboardHeader header={category.name}>
                    <Button asChild>
                        <Link href={edit(category.id)}>ویرایش</Link>
                    </Button>
                </DashboardHeader>
                <p>{category.slug}</p>
                <p className="leading-8 whitespace-pre-line">
                    {category.description || 'توضیحی ثبت نشده است.'}
                </p>
            </DashboardContainer>
        </AppLayout>
    );
}
