import { cn } from '@/lib/utils';
import { RouteFormDefinition } from '@/wayfinder';
import { Eye, LucideIcon, Pen, Plus, Trash } from 'lucide-react';
import { PropsWithChildren, ReactNode } from 'react';
import ButtonLink from './button-link';
import FormButton from './form-button';

export function DashboardContainer({ children }: PropsWithChildren) {
    return (
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            {children}
        </div>
    );
}

export function CreateHeaderButton({
    href,
    model,
}: {
    href: string;
    model: string;
}) {
    return (
        <ButtonLink className="self-end" href={href}>
            Create new {model} <Plus />
        </ButtonLink>
    );
}

export function DashboardHeader({
    children,
    header,
    containerClassName,
}: PropsWithChildren<{ header: string; containerClassName?: string }>) {
    return (
        <div
            className={cn(
                'flex w-full items-center justify-between rounded-xl border border-accent p-3 shadow-lg shadow-accent',
                containerClassName,
            )}
        >
            <h1 className="text-2xl font-bold">{header}</h1>
            {children}
        </div>
    );
}

export function ActionButtonContainer({
    children,
    className,
}: PropsWithChildren<{ className?: string }>) {
    return <div className={cn('space-x-3', className)}>{children}</div>;
}

export function InfoBlock({
    label,
    value,
    operator = ':',
}: {
    label: string;
    value: string | number | ReactNode;
    operator?: ':' | '?';
}) {
    return (
        <div>
            {label}
            {operator} {value}
        </div>
    );
}

export function DataContainer({ children }: PropsWithChildren) {
    return <div className="space-y-4">{children}</div>;
}

export function ActionButton({
    icon: Icon,
    link,
}: {
    icon: LucideIcon;
    link: string;
}) {
    return (
        <ButtonLink href={link}>
            <Icon />
        </ButtonLink>
    );
}

export function DeleteButton({ form }: { form: RouteFormDefinition<'post'> }) {
    return (
        <FormButton
            className="inline"
            form={form}
            options={{ preserveScroll: true }}
        >
            <Trash />
        </FormButton>
    );
}

export function EssentialActions({
    isDeletable,
    deleteForm,
    editLink,
    showLink,
}: {
    isDeletable: boolean;
    deleteForm: RouteFormDefinition<'post'>;
    editLink: string;
    showLink: string;
}) {
    return (
        <>
            {isDeletable && <DeleteButton form={deleteForm} />}
            <ActionButton icon={Pen} link={editLink} />
            <ActionButton icon={Eye} link={showLink} />
        </>
    );
}

export function ActionsHeader() {
    return <div className="inline text-end xl:block">Actions</div>;
}
