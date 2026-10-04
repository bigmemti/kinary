import { Course } from "@/types";
import { Form, router } from "@inertiajs/react";
import course_links from '@/routes/admin/course';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function CourseSpaceForm({ course }: { course: Course }) {
    return (
        <Form
            {...course_links.space.store.form(course)}
            disableWhileProcessing
            onSuccess={() => router.visit(course_links.space.index(course).url)}
            className="mt-4 flex flex-col gap-4"
        >
            {({ processing, errors }) => (
                <>
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>

                        <Input
                            id="name"
                            type="text"
                            tabIndex={3}
                            name="name"
                            placeholder="Name"
                        />

                        <InputError message={errors.name} />
                    </div>

                    <div className="mt-2 text-end">
                        <Button type="submit" tabIndex={7}>
                            {processing && <Spinner />}
                            Submit
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}