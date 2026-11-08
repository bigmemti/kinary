import InputError from '@/components/input-error';
import StorefrontAuth from '@/components/storefront-auth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';
import { Form, Link } from '@inertiajs/react';

export default function Register() {
    return (
        <StorefrontAuth
            title="ساخت حساب کاربری"
            description="به آکادمی خوش آمدی. اطلاعاتت را وارد کن و مسیر یادگیری‌ات را شروع کن."
        >
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                noValidate
                className="grid gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="name">نام و نام خانوادگی</Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                required
                                autoFocus
                                placeholder="نام کامل شما"
                                className="storefront-input"
                                aria-invalid={!!errors.name}
                                aria-describedby={
                                    errors.name ? 'name-error' : undefined
                                }
                            />
                            <InputError
                                id="name-error"
                                message={errors.name}
                                role="alert"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">ایمیل</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
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
                            <Label htmlFor="phone">شماره موبایل</Label>
                            <Input id="phone" name="phone" type="tel" autoComplete="tel" required dir="ltr" placeholder="09123456789 یا +989123456789" className="storefront-input" aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'phone-error' : undefined} />
                            <InputError id="phone-error" message={errors.phone} role="alert" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">رمز عبور</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                placeholder="یک رمز عبور انتخاب کنید"
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
                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">
                                تکرار رمز عبور
                            </Label>
                            <Input
                                id="password_confirmation"
                                name="password_confirmation"
                                type="password"
                                autoComplete="new-password"
                                required
                                placeholder="رمز عبور را دوباره وارد کنید"
                                className="storefront-input"
                                aria-invalid={!!errors.password_confirmation}
                                aria-describedby={
                                    errors.password_confirmation
                                        ? 'password-confirmation-error'
                                        : undefined
                                }
                            />
                            <InputError
                                id="password-confirmation-error"
                                message={errors.password_confirmation}
                                role="alert"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={processing}
                            className="storefront-button w-full gap-2 disabled:opacity-50"
                            data-test="register-user-button"
                        >
                            {processing && (
                                <Spinner aria-label="در حال ساخت حساب" />
                            )}
                            {processing ? 'در حال ساخت حساب…' : 'ساخت حساب'}
                        </button>
                        <p className="text-center text-sm leading-7 opacity-80">
                            قبلاً ثبت‌نام کرده‌ای؟{' '}
                            <Link
                                href={login()}
                                className="font-bold underline underline-offset-4"
                            >
                                وارد حسابت شو
                            </Link>
                        </p>
                    </>
                )}
            </Form>
        </StorefrontAuth>
    );
}
