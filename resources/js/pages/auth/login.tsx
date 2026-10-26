import InputError from '@/components/input-error';
import StorefrontAuth from '@/components/storefront-auth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Form, Link } from '@inertiajs/react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: LoginProps) {
    return (
        <StorefrontAuth
            title="ورود به حساب"
            description="خوش برگشتی. برای ادامه مسیر یادگیری وارد حساب خودت شو."
        >
            {status && (
                <p
                    role="status"
                    className="mb-6 rounded-xl bg-[#e7ebdf] p-4 text-sm leading-7 text-[#244d40]"
                >
                    {status}
                </p>
            )}
            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                noValidate
                className="grid gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="email">ایمیل</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                autoFocus
                                dir="ltr"
                                placeholder="نشانی ایمیل شما"
                                className="storefront-input placeholder:text-right"
                                aria-invalid={!!errors.email}
                                aria-describedby={
                                    errors.email ? 'email-error' : undefined
                                }
                            />
                            <InputError
                                id="email-error"
                                message={errors.email}
                                role="alert"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">رمز عبور</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                placeholder="رمز عبور شما"
                                className="storefront-input"
                                aria-invalid={!!errors.password}
                                aria-describedby={
                                    errors.password
                                        ? 'password-error'
                                        : undefined
                                }
                            />
                            <InputError
                                id="password-error"
                                message={errors.password}
                                role="alert"
                            />
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
                            <label className="flex cursor-pointer items-center gap-2">
                                <input
                                    name="remember"
                                    type="checkbox"
                                    value="1"
                                    className="size-4 accent-[#244d40]"
                                />
                                مرا به خاطر بسپار
                            </label>
                            {canResetPassword && (
                                <Link
                                    href={request()}
                                    className="underline underline-offset-4"
                                >
                                    رمز عبورت را فراموش کردی؟
                                </Link>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={processing}
                            className="storefront-button w-full gap-2 disabled:opacity-50"
                            data-test="login-button"
                        >
                            {processing && <Spinner aria-label="در حال ورود" />}
                            {processing ? 'در حال ورود…' : 'ورود به حساب'}
                        </button>
                        {canRegister && (
                            <p className="text-center text-sm leading-7 opacity-80">
                                هنوز حساب نداری؟{' '}
                                <Link
                                    href={register()}
                                    className="font-bold underline underline-offset-4"
                                >
                                    ثبت‌نام کن
                                </Link>
                            </p>
                        )}
                    </>
                )}
            </Form>
        </StorefrontAuth>
    );
}
