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
    wallet?: Wallet;
    student?: Student;
    teacher?: Teacher;
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
    orders?: Order[];
    orders_count?: number;
    balance: number;
    created_at: DateTime;
    updated_at: DateTime;
}

export interface Order{
    id: number;
    wallet_id: number;
    wallet?: Wallet;
    plans?: Plan[];
    plans_count?: number;
    transactions?: Transaction[];
    transactions_count?: number;
    status: string;
    amount?: number;
    created_at: DateTime;
    updated_at: DateTime;
}

export interface Student{
    id: number;
    user_id: number;
    user?: User;
    enrollments_count?: number;
    enrollments?: Enrollment[];
    pivot?: any;  
    created_at: DateTime;
    updated_at: DateTime;
}

export interface Enrollment{
    id: number;
    student_id: number;
    student?: Student;
    plan_id: number;
    plan?: Plan;
    created_at: DateTime;
    updated_at: DateTime;
}

export interface Teacher{
    id: number;
    user_id: number;
    user?: User;
    courses?: Course[];
    courses_count?: number;
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
    plans?: Plan[];
    plans_count?: number;
    sections?: Section[];
    sections_count?: number;
    created_at: DateTime;
    updated_at: DateTime;
    deleted_at: DateTime;
}

export interface Plan{
    id: number;
    course_id: number;
    course?: Course;
    name: string;
    price: number;
    orders?: Order[];
    orders_count?: number;
    students?: Student[];
    students_count?: number;
    created_at: DateTime;
    updated_at: DateTime;
}

export interface Section{
    id: number;
    course_id: number;
    course?: Course;
    name: string;
    lessons?: Lesson[];
    lessons_count?: number;
    created_at: DateTime;
    updated_at: DateTime;
}

export interface Lesson{
    id: number;
    course_id: number;
    section?: Section;
    name: string;
    contents?: Content[];
    contents_count?: number;
    created_at: DateTime;
    updated_at: DateTime;
}