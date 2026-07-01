import { dashboard } from "@/routes";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { index } from "@/routes/teacher/course";
import { DashboardContainer } from "@/components/dashboard";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url
    },
    {
        title: 'Course',
        href: index().url
    }
];

export default function Index({  }: { }){
    return (
        <AppLayout breadcrumbs={breadcrumbs} >
            {/* <Head title="Course List"/> */}
            <DashboardContainer>
                
            </DashboardContainer>
        </AppLayout>
    );
}