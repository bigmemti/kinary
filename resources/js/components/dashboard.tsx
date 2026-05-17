import { PropsWithChildren, ReactNode } from "react";
import ButtonLink from "./button-link";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

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

export function ActionButtonContainer({ children }: PropsWithChildren) {
    return(
        <div className="space-x-3">
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