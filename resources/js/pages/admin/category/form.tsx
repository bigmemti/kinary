import {
    FieldContainer,
    FormContainer,
    SubmitButton,
} from '@/components/forms';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import categoryRoutes from '@/routes/admin/category';
import { Form } from '@inertiajs/react';

export type Category = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
};

export default function CategoryForm({ category }: { category?: Category }) {
    const form = category
        ? categoryRoutes.update.form(category.id)
        : categoryRoutes.store.form();
    return (
        <Form {...form} disableWhileProcessing className="mt-4">
            {({ errors, processing }) => (
                <FormContainer>
                    <FieldContainer>
                        <Label htmlFor="name">نام دسته‌بندی</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={category?.name}
                            required
                        />
                        <InputError message={errors.name} />
                    </FieldContainer>
                    <FieldContainer>
                        <Label htmlFor="slug">شناسه متنی</Label>
                        <Input
                            id="slug"
                            name="slug"
                            defaultValue={category?.slug}
                            placeholder="در صورت خالی بودن از نام ساخته می‌شود"
                        />
                        <InputError message={errors.slug} />
                    </FieldContainer>
                    <FieldContainer>
                        <Label htmlFor="description">توضیحات</Label>
                        <Textarea
                            id="description"
                            name="description"
                            defaultValue={category?.description ?? ''}
                        />
                        <InputError message={errors.description} />
                    </FieldContainer>
                    <SubmitButton tabindex={4} processing={processing} />
                </FormContainer>
            )}
        </Form>
    );
}
