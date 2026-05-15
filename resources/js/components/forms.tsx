import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { store, update } from "@/routes/admin/user";
import { User } from "@/types";
import { Form } from "@inertiajs/react";

export function UserForm({ type, user }: { type: "create" | "edit", user?: User }){
    const form = (type === 'create')? store.form(): update.form(user?? 0);

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
                                Create account
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </Form>
    );
}