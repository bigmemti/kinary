import { Button } from '@/components/ui/button';
import { editor } from '@/routes/teacher/course';
import type { Course } from '@/types';
import { Link } from '@inertiajs/react';

export default function CoursePlanForm({ course }: { course: Course }) {
    return (
        <Button asChild>
            <Link href={editor(course)}>
                مدیریت اسپیس‌ها و پلن‌ها در ویرایشگر دوره
            </Link>
        </Button>
    );
}
