import { dashboard as dashboard_link } from '@/routes';
import { BreadcrumbItem } from '@/types';

export function breadcrumbBuilder() {
    const items: BreadcrumbItem[] = [];

    return {
        push(title: string, href: string) {
            items.push({ title, href });
            return this;
        },
        build() {
            return items;
        },
        dashboard() {
            this.push('Dashboard', dashboard_link().url);
            return this;
        },
    };
}
