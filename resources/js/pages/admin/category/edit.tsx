import EditLayout from '@/layouts/crud/edit';
import { edit, index, show } from '@/routes/admin/category';
import { breadcrumbBuilder } from '@/util/breadcrumb';
import CategoryForm, { type Category } from './form';

export default function Edit({ category }: { category: Category }) {
    return (
        <EditLayout
            title="ویرایش دسته‌بندی"
            header={`ویرایش ${category.name}`}
            breadcrumbs={breadcrumbBuilder()
                .dashboard()
                .push('دسته‌بندی‌ها', index().url)
                .push(category.name, show(category.id).url)
                .push('ویرایش', edit(category.id).url)
                .build()}
        >
            <CategoryForm category={category} />
        </EditLayout>
    );
}
