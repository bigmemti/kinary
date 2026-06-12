import { ActionButton, ActionButtonContainer, ActionsHeader, EssentialActions } from "@/components/dashboard";
import { show as student } from "@/routes/admin/student";
import { show as wallet } from "@/routes/admin/wallet";
import { show as teacher } from "@/routes/admin/teacher";
import { User } from "@/types";
import { GraduationCap, Presentation, Wallet } from "lucide-react";
import ResponsiveDataList from "@/components/responsive-data-list";
import CheckX from "@/components/check-x";
import IndexLayout from "@/layouts/crud";
import { create, destroy, edit, index, show } from "@/routes/admin/user";
import { breadcrumbBuilder } from "@/util/breadcrumb";

export default function Index({ users }: { users: User[] }){
    return (
        <IndexLayout
            title="User List"
            breadcrumbs={
                breadcrumbBuilder()
                .dashboard()
                .push('User', index().url)
                .build()
            }
            model="user"
            createLink={create().url}
        >
            <ResponsiveUserList users={users} />
        </IndexLayout>
    );
}

function ResponsiveUserList({ users }: { users: User[]}) {
    return (
        <ResponsiveDataList
            data={users}
            columns={[
                { header: "ID", cell: (user) => user.id, },
                { header: "Name", cell: (user) => user.name, },
                { header: "Email", cell: (user) => user.email, },
                { header: "Balance", cell: (user) => user.wallet?.balance, },
                { header: "Email Verified", cell: (user) => <CheckX condition={!!user.email_verified_at} /> },
                { header: "Two Factor", cell: (user) => <CheckX condition={!!user.two_factor_confirmed_at} /> },
                { header: <ActionsHeader />, cell: (user) => <UserActions user={user} /> },
            ]}
        />
    );
}

function UserActions({ user }: { user: User}) {
    return (
        <ActionButtonContainer className="xl:text-end">
            {!!user.teacher && <ActionButton icon={Presentation} link={teacher(user.teacher).url} />}
            <EssentialActions 
                isDeletable={!(user.wallet || user.student || user.teacher)} 
                deleteForm={destroy.form(user)}
                editLink={edit(user).url}
                showLink={show(user).url}
            />            
            <ActionButton icon={GraduationCap} link={student(user.student!).url} />
            <ActionButton icon={Wallet} link={wallet(user.wallet!).url} />
        </ActionButtonContainer>
    );
}