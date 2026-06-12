import { Course } from "@/types";
import { Form, router } from "@inertiajs/react";
import course_links from "@/routes/teacher/course";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import InputError from "@/components/input-error";
import { FieldContainer, FormContainer, SubmitButton } from "@/components/forms";

export default function CoursePlanForm({ course }: { course: Course}){ 
    return(
        <Form
            {...course_links.plan.store.form(course)}
            disableWhileProcessing
            onSuccess={() => router.visit(course_links.plan.index(course).url) }
            className="flex flex-col mt-4 gap-4"
        >
            {({ processing, errors }) => (
                <FormContainer>
                    <FieldContainer>
                        <Label htmlFor="name">Name</Label>

                        <Input
                            id="name"
                            type="text"
                            tabIndex={1}
                            name="name"
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
                            placeholder="Price"
                        />

                        <InputError message={errors.price} />
                    </FieldContainer>
                
                    <SubmitButton tabindex={7} processing={processing} />
                </FormContainer>
            )}
        </Form>
    );
}