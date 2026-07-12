import CreateLayout from '@/layouts/crud/create';
import { create, index } from '@/routes/admin/user';
import { breadcrumbBuilder } from '@/util/breadcrumb';
import UserForm from './form';

export default function Create() {
    return (
        <CreateLayout
            title="Create User"
            breadcrumbs={breadcrumbBuilder()
                .dashboard()
                .push('User', index().url)
                .push('Create', create().url)
                .build()}
        >
            <UserForm type="create" />
        </CreateLayout>
    );
}
