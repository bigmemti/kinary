import { PropsWithChildren, ReactNode } from "react";
import ButtonLink from "./button-link";
import { Eye, LucideIcon, Pen, Plus, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import FormButton from "./form-button";
import { RouteFormDefinition } from "@/wayfinder";

export function DashboardContainer({ children }: PropsWithChildren){
    return(
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            {children}
        </div>
    );
}

export function CreateHeaderButton({ href, model }: { href: string, model: string }) {
    return (
        <ButtonLink className='self-end' href={href}>
            Create new {model} <Plus />
        </ButtonLink>
    );
}

export function DashboardHeader({ children, header, containerClassName }: PropsWithChildren<{ header: string, containerClassName?: string }>){
    return(
        <div className={cn("w-full flex justify-between items-center shadow-lg shadow-accent p-3 border border-accent rounded-xl", containerClassName)}>
            <h1 className="font-bold text-2xl"> 
                {header}
            </h1>
            {children}
        </div>
    );
}

export function ActionButtonContainer({ children, className }: PropsWithChildren<{ className?: string }>) {
    return(
        <div className={cn("space-x-3", className)}>
            {children}
        </div>
    );
}


export function InfoBlock({ label, value, operator = ':' }: { label: string, value: string | number | ReactNode, operator?: ':' | '?' }) {
    return (
        <div>
            {label}{operator} {value}
        </div>
    );
}

export function DataContainer({ children }: PropsWithChildren) {
    return (
        <div className="space-y-4">
            {children}
        </div>
    )
}

export function ActionButton({ icon: Icon, link }: { icon: LucideIcon, link: string }){
    return (
        <ButtonLink href={link}>
            <Icon />
        </ButtonLink>
    );
}

export function DeleteButton({ form }: { form: RouteFormDefinition<'post'> }){
    return (
        <FormButton className="inline" form={form} options={{ preserveScroll: true }}>
            <Trash />
        </FormButton>
    );
}

export function EssentialActions({ isDeletable, deleteForm, editLink, showLink }: { isDeletable: boolean, deleteForm: RouteFormDefinition<'post'>, editLink: string, showLink: string }){
    return(
        <>
            {isDeletable && <DeleteButton form={deleteForm} />}
            <ActionButton icon={Pen} link={editLink} />
            <ActionButton icon={Eye} link={showLink} />
        </>
    );
}

export function ActionsHeader() {
    return (<div className="text-end inline xl:block">Actions</div>);
}