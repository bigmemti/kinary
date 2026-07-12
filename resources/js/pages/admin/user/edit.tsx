import EditLayout from '@/layouts/crud/edit';
import { edit, index, show } from '@/routes/admin/user';
import { User } from '@/types';
import { breadcrumbBuilder } from '@/util/breadcrumb';
import UserForm from './form';

export default function Edit({ user }: { user: User }) {
    return (
        <EditLayout
            title="Edit User"
            header={`Edit ${user.name} info`}
            breadcrumbs={breadcrumbBuilder()
                .dashboard()
                .push('User', index.url())
                .push(user.name, show.url(user))
                .push('Edit', edit.url(user))
                .build()}
        >
            <UserForm type="edit" user={user} />
        </EditLayout>
    );
}
