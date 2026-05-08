import { DashboardContainer } from '@/components/dashboard';
import { Card } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard, studying } from '@/routes';
import { Course, type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Study',
        href: studying().url,
    },
];

export default function Study({ courses }: { courses: Course[]}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Course List" />
            <DashboardContainer>
                <CourseCardsContainer courses={courses} />
            </DashboardContainer>
        </AppLayout>
    );
}

function CourseCardsContainer({ courses }: { courses: Course[]}){
    return(
        <CardContainer> 
            <HeaderCard>
                <div className='flex-1 flex gap-4'>
                    <span className='flex-1'>Course</span>
                </div>
            </HeaderCard>
            {courses.map(course => ( 
                <CourseCard key={course.id}> 
                    <div className='flex-1 flex gap-4'>
                        <span className='flex-1'>{course.title}</span>
                    </div>
                </CourseCard> 
            ))}
        </CardContainer>
    );
}


function CourseCard({ children }: PropsWithChildren){
    return(
        <Card className='px-4 flex-row'>
            {children}
        </Card>
    );
}

function HeaderCard({ children }: PropsWithChildren) {
    return(
        <Card className='hidden lg:flex px-4 flex-row'>
            {children}
        </Card>
    );
}

function CardContainer({ children }: PropsWithChildren){
    return(
        <div className='grid md:grid-cols-2 lg:grid-cols-1 gap-4'>
            {children}
        </div>
    );
}
