import CreateLayout from '@/layouts/crud/create';
import { create, index } from '@/routes/admin/category';
import { breadcrumbBuilder } from '@/util/breadcrumb';
import CategoryForm from './form';

export default function Create() {
    return (
        <CreateLayout
            title="ساخت دسته‌بندی"
            breadcrumbs={breadcrumbBuilder()
                .dashboard()
                .push('دسته‌بندی‌ها', index().url)
                .push('ساخت', create().url)
                .build()}
        >
            <CategoryForm />
        </CreateLayout>
    );
}
