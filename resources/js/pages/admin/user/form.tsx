import {
    FieldContainer,
    FormContainer,
    SubmitButton,
} from '@/components/forms';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import user_links from '@/routes/admin/user';
import { User, WithType } from '@/types';
import { Form, router } from '@inertiajs/react';

export default function UserForm({
    type,
    user,
    visitOnSuccess = user_links.index().url,
}: WithType<{ user?: User; visitOnSuccess?: string }>) {
    const form =
        type === 'create'
            ? user_links.store.form()
            : user_links.update.form(user ?? 0);

    return (
        <Form
            {...form}
            disableWhileProcessing
            onSuccess={() => router.visit(visitOnSuccess)}
            className="mt-4 flex flex-col"
        >
            {({ processing, errors }) => (
                <FormContainer>
                    <NameField
                        required
                        autoFocus
                        tabIndex={1}
                        defaultValue={user?.name}
                        message={errors.name}
                    />
                    <EmailField
                        required
                        tabIndex={2}
                        defaultValue={user?.email}
                        message={errors.email}
                    />
                    <SubmitButton tabindex={3} processing={processing} />
                </FormContainer>
            )}
        </Form>
    );
}

type FieldProps<P = unknown> = P & {
    required?: boolean;
    id?: string;
    placeholder?: string;
    autoFocus?: boolean;
    tabIndex?: number;
    defaultValue?: string | number | readonly string[] | undefined;
    message: string | undefined;
};

function NameField({
    required,
    autoFocus,
    tabIndex,
    defaultValue,
    message,
}: FieldProps) {
    return (
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
            <InputError message={message} className="mt-2" />
        </FieldContainer>
    );
}

function EmailField({ required, tabIndex, defaultValue, message }: FieldProps) {
    return (
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
