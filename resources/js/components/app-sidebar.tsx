import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {  ArrowDownUp, Book,  BookOpen,  GraduationCap,  Layers,  LayoutGrid,  LinkIcon,  ReceiptText,  School,  ShoppingCart,  TableRowsSplit,  User, Wallet } from 'lucide-react';
import AppLogo from './app-logo';
import { dashboard } from '@/routes';
import { index as courses } from '@/routes/admin/course';
import { index as users} from '@/routes/admin/user';
import { index as students} from '@/routes/admin/student';
import { index as wallets} from '@/routes/admin/wallet';
import { index as teachers} from '@/routes/admin/teacher';
import { index as plans} from '@/routes/admin/plan';
import { index as sections} from '@/routes/admin/section';
import { index as lessons} from '@/routes/admin/lesson';
import { index as contents} from '@/routes/admin/content';
import { index as enrollments} from '@/routes/admin/enrollment';
import { index as orders} from '@/routes/admin/order';
import { index as transactions} from '@/routes/admin/transaction';
import { index as teaching_courses } from '@/routes/teacher/course';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Teaching Courses',
        href: teaching_courses(),
        icon: Book,
    },
];

const adminNavItems: NavItem[] = [
    {
        title: 'Users',
        href: users(),
        icon: User,
    },
    {
        title: 'Teachers',
        href: teachers(),
        icon: School,
    },
    {
        title: 'Students',
        href: students(),
        icon: GraduationCap,
    },
    {
        title: 'Wallets',
        href: wallets(),
        icon: Wallet,
    },
    {
        title: 'Courses',
        href: courses(),
        icon: Book,
    },
    {
        title: 'Plans',
        href: plans(),
        icon: Layers,
    },
    {
        title: 'Sections',
        href: sections(),
        icon: TableRowsSplit,
    },
    {
        title: 'Lessons',
        href: lessons(),
        icon: BookOpen,
    },
    {
        title: 'Contents',
        href: contents(),
        icon: ReceiptText,
    },
    {
        title: 'Enrollments',
        href: enrollments(),
        icon: LinkIcon,
    },
    {
        title: 'Orders',
        href: orders(),
        icon: ShoppingCart,
    },
    {
        title: 'Transactions',
        href: transactions(),
        icon: ArrowDownUp,
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
                <NavMain label='Admin' items={adminNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
