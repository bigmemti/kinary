import { cn } from '@/lib/utils';
import { Method } from '@inertiajs/core';
import { Form } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import { Button } from './ui/button';

export default function FormButton({
    children,
    form,
    options,
    className,
}: PropsWithChildren<{
    form: {
        method?: Method | 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
        action?: string | import('@inertiajs/core').UrlMethodPair;
    };
    options?: import('@inertiajs/core').FormComponentOptions;
    className?: string;
}>) {
    return (
        <Form {...form} options={options} className={cn('', className)}>
            <Button variant="destructive">{children}</Button>
        </Form>
    );
}
