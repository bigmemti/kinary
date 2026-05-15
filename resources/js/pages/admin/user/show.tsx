import ButtonLink from "@/components/button-link";
import CheckX from "@/components/check-x";
import { DashboardContainer, DashboardHeader } from "@/components/dashboard";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import { index, show } from "@/routes/admin/user";
import { index as orders } from "@/routes/admin/wallet/order";
import { index as enrollments } from "@/routes/admin/student/enrollment";
import { index as courses } from "@/routes/admin/teacher/course";
import { show as student } from "@/routes/admin/student";
import { show as wallet } from "@/routes/admin/wallet";
import { show as teacher } from "@/routes/admin/teacher";
import { BreadcrumbItem, User } from "@/types";
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
                <div className="space-y-4">
                    <div>ID: {user.id}</div>
                    <div>Name: {user.name}</div>
                    <div>Email: {user.email}</div>
                    <div>Email Verified? <CheckX condition={!!user.email_verified_at} /></div>
                    <div>Tow Factor? <CheckX condition={!!user.two_factor_confirmed_at} /></div>
                    <div>Created At: {user.created_at}</div>
                    <div>Updated At: {user.updated_at}</div>
                    {!!user.wallet &&(
                        <>
                            <DashboardHeader header={`Wallet info`} containerClassName="my-4">
                                <div className="space-x-3">
                                    <ButtonLink href={wallet(user).url}>
                                        Wallet
                                    </ButtonLink>
                                    <ButtonLink href={orders(user).url}>
                                        Orders
                                    </ButtonLink>
                                </div>
                            </DashboardHeader>
                            <div>Wallet ID: {user.wallet.id}</div>
                            <div>Wallet Balance: {user.wallet.balance}</div>
                            <div>Wallet Created At: {user.wallet.created_at}</div>
                            <div>Wallet Updated At: {user.wallet.updated_at}</div>
                            <div>Wallet Orders Count: {user.wallet.orders_count}</div>
                            {(!!user.wallet.orders && user.wallet.orders?.length > 0) && 
                                <ResponsiveDataList
                                    data={user.wallet.orders}
                                    columns={[
                                        { header: "ID", cell: (order) => order.id, },
                                        { header: "Status", cell: (order) => order.status, },
                                        { header: "Amount", cell: (order) => order.amount, },
                                        { header: "Created At", cell: (order) => order.created_at, },
                                        { header: "Updated At", cell: (order) => order.updated_at, },
                                    ]}
                                />
                            }
                        </>
                    )}
                    {!!user.student &&(
                        <>
                            <DashboardHeader header={`Student info`} containerClassName="my-4">
                                <div className="space-x-3">
                                    <ButtonLink href={student(user).url}>
                                        Student
                                    </ButtonLink>
                                    <ButtonLink href={enrollments(user).url}>
                                        Enrollments
                                    </ButtonLink>
                                </div>
                            </DashboardHeader>
                            <div>Student ID: {user.student.id}</div>
                            <div>Student Created At: {user.student.created_at}</div>
                            <div>Student Updated At: {user.student.updated_at}</div>
                            <div>Student Enrollments Count: {user.student.enrollments_count}</div>
                            {(!!user.student.enrollments && user.student.enrollments?.length > 0) && 
                                <ResponsiveDataList
                                    data={user.student.enrollments}
                                    columns={[
                                        { header: "ID", cell: (enrollment) => enrollment.id, },
                                        { header: "Course", cell: (enrollment) => enrollment.plan?.course?.title, },
                                        { header: "Plan", cell: (enrollment) => enrollment.plan?.name, },
                                        { header: "Created At", cell: (enrollment) => enrollment.created_at, },
                                        { header: "Updated At", cell: (enrollment) => enrollment.updated_at, },
                                    ]}
                                />
                            }
                        </>
                    )}
                    {!!user.teacher &&(
                        <>
                            <DashboardHeader header={`Teacher info`} containerClassName="my-4">
                                <div className="space-x-3">
                                    <ButtonLink href={teacher(user).url}>
                                        Teacher
                                    </ButtonLink>
                                    <ButtonLink href={courses(user).url}>
                                        Courses
                                    </ButtonLink>
                                </div>
                            </DashboardHeader>
                            <div>Teacher ID: {user.teacher.id}</div>
                            <div>Teacher Created At: {user.teacher.created_at}</div>
                            <div>Teacher Updated At: {user.teacher.updated_at}</div>
                            <div>Teacher Courses Count: {user.teacher.courses_count}</div>
                            {(!!user.teacher.courses && user.teacher.courses?.length > 0) && 
                                <ResponsiveDataList
                                    data={user.teacher.courses}
                                    columns={[
                                        { header: "ID", cell: (course) => course.id, },
                                        { header: "Course", cell: (course) => course.title, },
                                        { header: "Created At", cell: (course) => course.created_at, },
                                        { header: "Updated At", cell: (course) => course.updated_at, },
                                    ]}
                                />
                            }
                        </>
                    )}
                </div>
            </DashboardContainer>
        </AppLayout>
    );
}