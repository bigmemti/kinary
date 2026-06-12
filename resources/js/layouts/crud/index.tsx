import { CreateHeaderButton, DashboardContainer, DashboardHeader } from "@/components/dashboard";
import { BreadcrumbItem } from "@/types";
import { Head } from "@inertiajs/react";
import { PropsWithChildren } from "react";
import AppLayout from "../app-layout";

export default function IndexLayout({ children, breadcrumbs, createLink, model, title }: PropsWithChildren<{ breadcrumbs: BreadcrumbItem[], createLink?: string, model: string, title: string }>){
    return (
        <AppLayout breadcrumbs={breadcrumbs} >
            <Head title={title}/>
            <DashboardContainer>
                <DashboardHeader header={title}>
                    {!!createLink && <CreateHeaderButton href={createLink} model={model} />}
                </DashboardHeader>
                {children}
            </DashboardContainer>
        </AppLayout>
    );
}
