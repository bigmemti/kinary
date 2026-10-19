import {
    FieldContainer,
    FormContainer,
    SubmitButton,
} from '@/components/forms';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import course_links from '@/routes/teacher/course';
import plan_links from '@/routes/teacher/plan';
import { Course, Plan, WithType } from '@/types';
import { Form, Link } from '@inertiajs/react';

export default function PlanForm({
    type,
    plan,
    course,
}: WithType<{ plan?: Plan; course?: Course }>) {
    if (type === 'create' && course) {
        return (
            <Button asChild>
                <Link href={course_links.editor(course)}>
                    مدیریت پلن‌ها در ویرایشگر دوره
                </Link>
            </Button>
        );
    }
    if (!plan) return null;
    const form = plan_links.update.form(plan);

    return (
        <Form
            {...form}
            disableWhileProcessing
            className="mt-4 flex flex-col gap-4"
        >
            {({ processing, errors }) => (
                <FormContainer>
                    <FieldContainer>
                        <Label htmlFor="name">Name</Label>

                        <Input
                            id="name"
                            type="text"
                            tabIndex={1}
                            autoFocus
                            name="name"
                            defaultValue={plan?.name}
                            placeholder="Name"
                        />

                        <InputError message={errors.name} />
                    </FieldContainer>

                    <FieldContainer>
                        <Label htmlFor="price">Price</Label>

                        <Input
                            id="price"
                            type="number"
                            step={1000}
                            name="price"
                            tabIndex={2}
                            defaultValue={plan?.price}
                            placeholder="Price"
                        />

                        <InputError message={errors.price} />
                    </FieldContainer>

                    <SubmitButton tabindex={3} processing={processing} />
                </FormContainer>
            )}
        </Form>
    );
}
