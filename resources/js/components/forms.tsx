import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import user_links from "@/routes/admin/user";
import student_links from "@/routes/admin/student";
import { Student, User } from "@/types";
import { Form } from "@inertiajs/react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

export function StudentForm({ type, student, users }: { type: "create" | "edit", student?: Student, users: User[] }){
    const form = (type === 'create')? student_links.store.form(): student_links.update.form(student?? 0);

    return(
        <Form
            {...form}
            disableWhileProcessing
            className="flex flex-col mt-4"
        >
            {({ processing, errors }) => (
                <>
                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="user">User</Label>
                            <Select 
                                id="user"
                                tabIndex={1}
                                name="user_id"
                                required
                                autoFocus
                                defaultValue={student?.user_id.toString()}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a user" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {users.map(user => (
                                            <SelectItem key={user.id} value={user.id.toString()}>{user.name}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <InputError
                                message={errors.name}
                                className="mt-2"
                            />
                        </div>

                        <div className="mt-2 text-end">
                            <Button
                                type="submit"
                                tabIndex={2}
                            >
                                {processing && <Spinner />}
                                Submit
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </Form>
    );
}

export function UserForm({ type, user }: { type: "create" | "edit", user?: User }){
    const form = (type === 'create')? user_links.store.form(): user_links.update.form(user?? 0);

    return(
        <Form
            {...form}
            disableWhileProcessing
            className="flex flex-col mt-4"
        >
            {({ processing, errors }) => (
                <>
                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                type="text"
                                required
                                autoFocus
                                tabIndex={1}
                                name="name"
                                defaultValue={user?.name}
                                placeholder="Full name"
                            />
                            <InputError
                                message={errors.name}
                                className="mt-2"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                tabIndex={2}
                                name="email"
                                defaultValue={user?.email}
                                placeholder="email@example.com"
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="mt-2 text-end">
                            <Button
                                type="submit"
                                tabIndex={3}
                            >
                                {processing && <Spinner />}
                                Submit
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </Form>
    );
}