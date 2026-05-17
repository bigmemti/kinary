import ButtonLink from "@/components/button-link";
import CheckX from "@/components/check-x";
import { ActionButtonContainer, DashboardContainer, DashboardHeader, DataContainer, InfoBlock } from "@/components/dashboard";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import { index, show } from "@/routes/admin/user";
import { index as orders } from "@/routes/admin/wallet/order";
import { index as enrollments } from "@/routes/admin/student/enrollment";
import { index as courses } from "@/routes/admin/teacher/course";
import { show as student } from "@/routes/admin/student";
import { show as wallet } from "@/routes/admin/wallet";
import { show as teacher } from "@/routes/admin/teacher";
import { BreadcrumbItem, Course, Enrollment, Order, Student, Teacher, User, Wallet } from "@/types";
import { Head } from "@inertiajs/react";
import ResponsiveDataList from "@/components/responsive-data-list";

export default function Show({ user }: { user: User}) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url
        },
        {
            title: 'User',
            href: index().url
        },
        {
            title: user.name,
            href: show(user).url
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Show User" />
            <DashboardContainer>
                <DashboardHeader header={`Show ${user.name} info`} />
                <DataContainer>
                    <UserMeta user={user} />
                    {!!user.wallet && <WalletInfo user={user} wallet={user.wallet} />}
                    {!!user.student && <StudentInfo user={user} student={user.student} />}
                    {!!user.teacher && <TeacherInfo user={user} teacher={user.teacher} />}
                </DataContainer>
            </DashboardContainer>
        </AppLayout>
    );
}

function TeacherInfo({ user, teacher }: { user: User, teacher: Teacher }) {
    return (
        <>
            <DashboardHeader header={`Teacher info`} containerClassName="my-4">
                <TeacherActions user={user} />
            </DashboardHeader>
            <TeacherMeta teacher={teacher} />
            {(!!teacher.courses && teacher.courses?.length > 0) && <ResponsiveCourseList courses={teacher.courses} />}
        </>
    );
}

function ResponsiveCourseList({ courses }: { courses: Course[]}) {
    return (
        <ResponsiveDataList
            data={courses}
            columns={[
                { header: "ID", cell: (course) => course.id, },
                { header: "Course", cell: (course) => course.title, },
                { header: "Created At", cell: (course) => course.created_at, },
                { header: "Updated At", cell: (course) => course.updated_at, },
            ]}
        />
    );
}

function TeacherMeta({ teacher }: { teacher: Teacher }) {
    return(
        <>
            <InfoBlock label="Teacher ID" value={teacher.id} />
            <InfoBlock label="Teacher Created At" value={teacher.created_at} />
            <InfoBlock label="Teacher Updated At" value={teacher.updated_at} />
            <InfoBlock label="Teacher Courses Count" value={teacher.courses_count} />
        </>
    );
}

function TeacherActions({ user }: { user: User }) {
    return (
        <ActionButtonContainer>
            <ButtonLink href={teacher(user).url}>
                Teacher
            </ButtonLink>
            <ButtonLink href={courses(user.teacher?? 0).url}>
                Courses
            </ButtonLink>
        </ActionButtonContainer>
    );
}

function StudentInfo({ user, student }: { user: User, student: Student }) {
    return (
        <>
            <DashboardHeader header={`Student info`} containerClassName="my-4">
                <StudentActions user={user} />
            </DashboardHeader>
            <StudentMeta student={student} />
            {(!!student.enrollments && student.enrollments?.length > 0) && <ResponsiveEnrollmentList enrollments={student.enrollments} />}
        </>
    );
}

function ResponsiveEnrollmentList({ enrollments }: { enrollments: Enrollment[]}) {
    return (
        <ResponsiveDataList
            data={enrollments}
            columns={[
                { header: "ID", cell: (enrollment) => enrollment.id, },
                { header: "Course", cell: (enrollment) => enrollment.plan?.course?.title, },
                { header: "Teacher", cell: (enrollment) => enrollment.plan?.course?.teacher?.user?.name, },
                { header: "Plan", cell: (enrollment) => enrollment.plan?.name, },
                { header: "Created At", cell: (enrollment) => enrollment.created_at, },
                { header: "Updated At", cell: (enrollment) => enrollment.updated_at, },
            ]}
        />
    );
}

function StudentMeta({ student }: { student: Student }) {
    return(
        <>
            <InfoBlock label="Student ID" value={student.id} />
            <InfoBlock label="Student Created At" value={student.created_at} />
            <InfoBlock label="Student Updated At" value={student.updated_at} />
            <InfoBlock label="Student Enrollments Count" value={student.enrollments_count} />
        </>
    );
}

function StudentActions({ user }: { user: User }) {
    return (
        <ActionButtonContainer>
            <ButtonLink href={student(user).url}>
                Student
            </ButtonLink>
            <ButtonLink href={enrollments(user.student?? 0).url}>
                Enrollments
            </ButtonLink>
        </ActionButtonContainer>
    );
}

function WalletInfo({ user, wallet }: { user: User, wallet: Wallet }) {
    return (
        <>
            <DashboardHeader header={`Wallet info`} containerClassName="my-4">
                <WalletActions user={user} />
            </DashboardHeader>
            <WalletMeta wallet={wallet} />
            {(!!wallet.orders && wallet.orders?.length > 0) && <ResponsiveOrderList orders={wallet.orders} />}
        </>
    );
}

function ResponsiveOrderList({ orders }: { orders: Order[]}) {
    return (
        <ResponsiveDataList
            data={orders}
            columns={[
                { header: "ID", cell: (order) => order.id, },
                { header: "Status", cell: (order) => order.status, },
                { header: "Amount", cell: (order) => order.amount, },
                { header: "Created At", cell: (order) => order.created_at, },
                { header: "Updated At", cell: (order) => order.updated_at, },
            ]}
        />
    );
}

function WalletMeta({ wallet }: { wallet: Wallet }) {
    return(
        <>
            <InfoBlock label="Wallet ID" value={wallet.id} />
            <InfoBlock label="Wallet Balance" value={wallet.balance} />
            <InfoBlock label="Wallet Created At" value={wallet.created_at} />
            <InfoBlock label="Wallet Updated At" value={wallet.updated_at} />
            <InfoBlock label="Wallet Order Count" value={wallet.orders_count} />
        </>
    );
}

function WalletActions({ user }: { user: User }) {
    return (
        <ActionButtonContainer>
            <ButtonLink href={wallet(user).url}>
                Wallet
            </ButtonLink>
            <ButtonLink href={orders(user.wallet?? 0).url}>
                Orders
            </ButtonLink>
        </ActionButtonContainer>
    );
}

function UserMeta({ user }: { user: User }) {
    return(
        <>
            <InfoBlock label="ID" value={user.id} />
            <InfoBlock label="Name" value={user.name} />
            <InfoBlock label="Email" value={user.email} />
            <InfoBlock label="Email Verified" operator="?" value={<CheckX condition={!!user.email_verified_at} />} />
            <InfoBlock label="Tow Factor" operator="?" value={<CheckX condition={!!user.two_factor_confirmed_at} />} />
            <InfoBlock label="Created At" value={user.created_at} />
            <InfoBlock label="Updated At" value={user.updated_at} />
        </>
    );
}
