import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import { Button } from './ui/button';

export default function ButtonLink({
    children,
    href,
    className,
}: PropsWithChildren<{ href: string; className?: string }>) {
    return (
        <Button asChild className={cn('', className)}>
            <Link href={href}>{children}</Link>
        </Button>
    );
}
