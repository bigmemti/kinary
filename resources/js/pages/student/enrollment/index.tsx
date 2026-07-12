import { DashboardContainer } from '@/components/dashboard';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { index } from '@/routes/teacher/course';
import { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Course',
        href: index().url,
    },
];

export default function Index({}: {}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {/* <Head title="Course List"/> */}
            <DashboardContainer></DashboardContainer>
        </AppLayout>
    );
}
