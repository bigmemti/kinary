import { User } from "@/types";
import { PropsWithChildren } from "react";
import user_links from "@/routes/admin/user";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Form, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import InputError from "@/components/input-error";

export default function UserForm({ type, user, visitOnSuccess = user_links.index().url }: { type: "create" | "edit", user?: User, visitOnSuccess?: string }){
    const form = (type === 'create')? user_links.store.form(): user_links.update.form(user?? 0);

    return(
        <Form
            {...form}
            disableWhileProcessing
            onSuccess={() => router.visit(visitOnSuccess)}
            className="flex flex-col mt-4"
        >
            {({ processing, errors }) => (
                <FormContainer>
                    <NameField required autoFocus tabIndex={1} defaultValue={user?.name} message={errors.name} />
                    <EmailField required tabIndex={2} defaultValue={user?.email} message={errors.email} />
                    <SubmitButton tabindex={3} processing={processing} />
                </FormContainer>
            )}
        </Form>
    );
}

type FieldProps<P = unknown> = P & { required?: boolean, autoFocus?: boolean, tabIndex?: number, defaultValue?: string | number | readonly string[] | undefined, message: string | undefined };

function FormContainer({ children }: PropsWithChildren) {
    return <div className="grid gap-6">{children}</div>;
}

function FieldContainer({ children }: PropsWithChildren) {
    return <div className="grid gap-2">{children}</div> ;
}

function NameField({ required, autoFocus, tabIndex, defaultValue, message }: FieldProps){
    return(
        <FieldContainer>
            <Label htmlFor="name">Name</Label>
            <Input
                id="name"
                type="text"
                required={required}
                autoFocus={autoFocus}
                tabIndex={tabIndex}
                name="name"
                defaultValue={defaultValue}
                placeholder="Full name"
            />
            <InputError
                message={message}
                className="mt-2"
            />
        </FieldContainer>
    );
}

function EmailField({ required, tabIndex, defaultValue, message }: FieldProps){
    return(
        <FieldContainer>
            <Label htmlFor="email">Email address</Label>
            <Input
                id="email"
                type="email"
                required={required}
                tabIndex={tabIndex}
                name="email"
                defaultValue={defaultValue}
                placeholder="email@example.com"
            />
            <InputError message={message} />
        </FieldContainer>
    );
}

function SubmitButton({ tabindex, processing }: { tabindex?: number, processing: boolean }) {
    return(
        <div className="mt-2 text-end">
            <Button
                type="submit"
                tabIndex={tabindex}
            >
                {processing && <Spinner />}
                Submit
            </Button>
        </div>
    );
}
