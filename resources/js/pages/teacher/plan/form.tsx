import { Course, Plan, WithType } from "@/types";
import course_links from "@/routes/teacher/course";
import plan_links from "@/routes/teacher/plan";
import { Form } from "@inertiajs/react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import InputError from "@/components/input-error";
import { FieldContainer, FormContainer, SubmitButton } from "@/components/forms";

export default function PlanForm({ type, plan, course }: WithType<{ plan?: Plan, course?: Course }>){
    const form = (type === 'create')? course_links.plan.store.form(course!): plan_links.update.form(plan!);
    
    return(
        <Form
            {...form}
            disableWhileProcessing
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