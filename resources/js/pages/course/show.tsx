import { DashboardContainer } from "@/components/dashboard";
import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import { index } from "@/routes/admin/course";
import { store } from "@/routes/admin/course/plan";
import { BreadcrumbItem, Course } from "@/types";
import { Form, Head } from "@inertiajs/react";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function Show({ course }: { course: Course}) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url,
        },
        {
            title: 'Course',
            href: index().url,
        },
        {
            title: course.title,
            href: index().url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={course.title} />
            <PlanCreateDialog course={course} />
            <DashboardContainer>
                <div>
                    <div>{course.id}</div>
                    <div>{course.title}</div>
                    <div>{course.slug}</div>
                    <div>{course.description}</div>
                    <div>{course.thumbnail}</div>
                    <div>{course.intro_video_url}</div>
                    <div>{course.status}</div>
                    <div>{course.created_at}</div>
                    <div>{course.updated_at}</div>
                    <div>{course.deleted_at}</div>
                </div>
                {course.plans?.map((plan) => (
                    <div key={plan.id}>
                        <div>{plan.name}</div>
                        <div>{plan.price}</div>
                    </div>
                ))}
            </DashboardContainer>
        </AppLayout>
    );
}


function PlanCreateDialog({ course }: { course: Course}){
    const [open, setOpen] = useState(false);

    return(
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className='self-end' onClick={() => setOpen(true)}>
                    Create new plan <Plus />
                </Button>
            </DialogTrigger>

            <DialogContent>
                <DialogTitle>
                    Create a new Course.
                </DialogTitle>

                <Form
                    {...store.form(course)}
                    options={{
                        preserveScroll: true,
                    }}
                    resetOnSuccess
                    onSuccess={() => setOpen(false)}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="name"
                                    className="sr-only"
                                >
                                    Name
                                </Label>

                                <Input
                                    id="name"
                                    type="text"
                                    name="name"
                                    placeholder="Name"
                                />

                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="price"
                                    className="sr-only"
                                >
                                    Price
                                </Label>

                                <Input
                                    id="price"
                                    type="number"
                                    step={1000}
                                    name="price"
                                    placeholder="Price"
                                />

                                <InputError message={errors.price} />
                            </div>

                            <DialogFooter className="gap-2">
                                <Button
                                    disabled={processing}
                                    asChild
                                >
                                    <button
                                        type="submit"
                                        data-test="submit-course-create-button"
                                    >
                                        Store
                                    </button>
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
