import { CreateHeaderButton, DashboardContainer, DashboardHeader } from "@/components/dashboard";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import { create, destroy, edit, index, show } from "@/routes/admin/user";
import { show as student } from "@/routes/admin/student";
import { show as wallet } from "@/routes/admin/wallet";
import { show as teacher } from "@/routes/admin/teacher";
import { BreadcrumbItem, User } from "@/types";
import { Head } from "@inertiajs/react";
import { Eye, GraduationCap, Pen, Presentation, Trash, Wallet } from "lucide-react";
import ButtonLink from "@/components/button-link";
import FormButton from "@/components/form-button";
import ResponsiveDataList from "@/components/responsive-data-list";
import CheckX from "@/components/check-x";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url
    },
    {
        title: 'User',
        href: index().url
    }
];

export default function Index({ users }: { users: User[] }){
    return (
        <AppLayout breadcrumbs={breadcrumbs} >
            <Head title="User List"/>
            <DashboardContainer>
                <DashboardHeader header="User List">
                    <CreateHeaderButton href={create().url} model="user" />
                </DashboardHeader>
                <ResponsiveUserList users={users} />
            </DashboardContainer>
        </AppLayout>
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
                { header: <div className="text-end inline xl:block">Actions</div>, cell: (user) => <UserActions user={user} /> },
            ]}
        />
    );
}

function UserActions({ user }: { user: User}) {
    return (
        <div className="space-x-2 text-center xl:text-end mt-2 xl:mt-1">
            { !!user.teacher && 
                <ButtonLink href={teacher(user.teacher).url}>
                    <Presentation />
                </ButtonLink>
            }
            { !!user.student && 
                <ButtonLink href={student(user.student).url}>
                    <GraduationCap />
                </ButtonLink>
            }
            { !!user.wallet && 
                <ButtonLink href={wallet(user.wallet).url}>
                    <Wallet />
                </ButtonLink>
            }
            {!( user.teacher || user.student || user.wallet) && <FormButton className="inline" form={destroy.form(user)} options={{ preserveScroll: true }}>
                <Trash />
            </FormButton>}
            <ButtonLink href={edit(user).url}>
                <Pen />
            </ButtonLink>
                <ButtonLink href={show(user).url}>
                    <Eye />
            </ButtonLink>
        </div>
    );
}