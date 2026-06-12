import { Teacher } from "@/types";
import { Book, User } from "lucide-react";
import ResponsiveDataList from "@/components/responsive-data-list";
import { index as courses } from "@/routes/admin/teacher/course";
import { show as user } from "@/routes/admin/user";
import { create, destroy, edit, index, show } from "@/routes/admin/teacher";
import { ActionButton, ActionButtonContainer, ActionsHeader, EssentialActions } from "@/components/dashboard";
import IndexLayout from "@/layouts/crud";
import { breadcrumbBuilder } from "@/util/breadcrumb";


export default function Index({ teachers }: { teachers: Teacher[] }){
    return (
        <IndexLayout 
            title="Teacher List"
            breadcrumbs={
                breadcrumbBuilder()
                .dashboard()
                .push('Teacher', index().url)
                .build()
            } 
            model="teacher"
            createLink={create().url}    
        >
                <ResponsiveTeacherList teachers={teachers} />
        </IndexLayout>
    );
}

function ResponsiveTeacherList({ teachers }: { teachers: Teacher[]}) {
    return (
        <ResponsiveDataList
            data={teachers}
            columns={[
                { header: "ID", cell: (teacher) => teacher.id, },
                { header: "User ID", cell: (teacher) => teacher.user?.id, },
                { header: "User Name", cell: (teacher) => teacher.user?.name, },
                { header: "Course Count", cell: (teacher) => teacher.courses_count, },
                { header: <ActionsHeader />, cell: (teacher) => <TeacherActions teacher={teacher} /> },
            ]}
        />
    );
}

function TeacherActions({ teacher }: { teacher: Teacher}) {
    return (
        <ActionButtonContainer className="xl:text-end">
            <EssentialActions 
                isDeletable={!teacher.courses_count} 
                deleteForm={destroy.form(teacher)}
                editLink={edit(teacher).url}
                showLink={show(teacher).url}
            />  
            <ActionButton icon={User} link={user(teacher.user!).url} />
            <ActionButton icon={Book} link={courses(teacher).url} />
        </ActionButtonContainer>
    );
}