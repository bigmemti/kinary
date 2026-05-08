import { Link } from "@inertiajs/react";
import { Button } from "./ui/button";
import { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

export default function ButtonLink({ children, href, className }: PropsWithChildren<{ href: string, className?: string }>){
    return (
        <Button asChild className={cn('', className)}>
            <Link href={href}>
                {children}
            </Link>
        </Button>
    );
}