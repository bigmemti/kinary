import {
    ActionButtonContainer,
    ActionsHeader,
    EssentialActions,
} from '@/components/dashboard';
import InputError from '@/components/input-error';
import ResponsiveDataList from '@/components/responsive-data-list';
import IndexLayout from '@/layouts/crud';
import { create, destroy, edit, index, show } from '@/routes/admin/category';
import { breadcrumbBuilder } from '@/util/breadcrumb';
import { usePage } from '@inertiajs/react';
import type { Category } from './form';

export default function Index({ categories }: { categories: Category[] }) {
    const { errors } = usePage().props;
    return (
        <IndexLayout
            title="دسته‌بندی‌ها"
            model="دسته‌بندی"
            createLink={create().url}
            breadcrumbs={breadcrumbBuilder()
                .dashboard()
                .push('دسته‌بندی‌ها', index().url)
                .build()}
        >
            <InputError message={errors.category} />
            <ResponsiveDataList
                data={categories}
                columns={[
                    { header: 'نام', cell: (category) => category.name },
                    { header: 'شناسه متنی', cell: (category) => category.slug },
                    {
                        header: <ActionsHeader />,
                        cell: (category) => (
                            <ActionButtonContainer>
                                <EssentialActions
                                    isDeletable
                                    deleteForm={destroy.form(category.id)}
                                    editLink={edit(category.id).url}
                                    showLink={show(category.id).url}
                                />
                            </ActionButtonContainer>
                        ),
                    },
                ]}
            />
        </IndexLayout>
    );
}
