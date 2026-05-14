import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    wallet?: Wallet
    student?: Student
    teacher?: Teacher
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Wallet{
    id: number;
    user_id: number;
    user?: User;
    balance: number;
    created_at: DateTime;
    updated_at: DateTime;
}
export interface Student{
    id: number;
    user_id: number;
    user?: User;
    created_at: DateTime;
    updated_at: DateTime;
}
export interface Teacher{
    id: number;
    user_id: number;
    user?: User;
    created_at: DateTime;
    updated_at: DateTime;
}

export interface Course{
    id: number;
    teacher_id: number;
    teacher?: Teacher
    title: string;
    slug: string;
    description: string;
    thumbnail: string;
    intro_video_url: string;
    status: 'published' | 'draft';
    created_at: DateTime;
    updated_at: DateTime;
    deleted_at: DateTime;
    plans?: Plan[];
}

export interface Plan{
    id: number;
    course_id: number;
    course?: Course;
    name: string;
    price: number;
    created_at: DateTime;
    updated_at: DateTime;
}