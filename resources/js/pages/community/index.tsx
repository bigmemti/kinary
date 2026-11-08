import { Storefront } from '@/components/storefront';
import { login } from '@/routes';
import { moderation, store } from '@/routes/community';
import { Link, useForm, usePage } from '@inertiajs/react';
import { type FormEvent } from 'react';

type Course = {
    id: number;
    title: string;
    plans: { id: number; name: string }[];
    lessons: { id: number; name: string }[];
};
type Topic = {
    id: number;
    url: string;
    name: string;
    author: string;
    course: string | null;
    isPublic: boolean;
};

export default function Discussions({
    discussions,
    courses,
}: {
    discussions: Topic[];
    courses: Course[];
}) {
    const { auth } = usePage<{
        auth: { user: { id: number } | null; roles: string[] };
    }>().props;
    const form = useForm({
        name: '',
        body: '',
        is_public: true,
        course_id: null as number | null,
        lesson_id: null as number | null,
        plan_ids: [] as number[],
    });
    const course = courses.find((item) => item.id === form.data.course_id);
    function submit(event: FormEvent) {
        event.preventDefault();
        form.post(store.url());
    }
    return (
        <Storefront title="بحث‌ها" description="گفت‌وگوهای آکادمی">
            <div className="mx-auto max-w-7xl space-y-10 px-5 py-12 lg:px-10">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <h1 className="storefront-heading">بحث‌ها</h1>
                    {auth.user &&
                        (auth.roles.includes('admin') ||
                            auth.roles.includes('teacher')) && (
                            <Link href={moderation()} className="underline">
                                مدیریت دیدگاه‌ها
                            </Link>
                        )}
                </div>
                {discussions.length ? (
                    <ul className="space-y-3">
                        {discussions.map((topic) => (
                            <li
                                key={topic.id}
                                className="rounded-3xl border border-current/15 p-5"
                            >
                                <Link
                                    href={topic.url}
                                    className="font-bold underline"
                                >
                                    {topic.name}
                                </Link>
                                <p className="mt-2 text-sm opacity-70">
                                    {topic.author}
                                    {topic.course
                                        ? ` · ${topic.course}`
                                        : ''} ·{' '}
                                    {topic.isPublic ? 'عمومی' : 'خصوصی'}
                                </p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>هنوز بحثی وجود ندارد.</p>
                )}
                {auth.user ? (
                    <form
                        onSubmit={submit}
                        className="max-w-2xl space-y-4 rounded-3xl border border-current/15 p-5"
                    >
                        <h2 className="text-xl font-bold">شروع بحث</h2>
                        <label className="block">
                            عنوان
                            <input
                                required
                                maxLength={200}
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData('name', event.target.value)
                                }
                                className="mt-2 w-full rounded-xl border border-current/20 bg-transparent p-3"
                            />
                        </label>
                        <label className="block">
                            متن
                            <textarea
                                required
                                maxLength={10000}
                                value={form.data.body}
                                onChange={(event) =>
                                    form.setData('body', event.target.value)
                                }
                                className="mt-2 w-full rounded-xl border border-current/20 bg-transparent p-3"
                                rows={5}
                            />
                        </label>
                        {courses.length > 0 && (
                            <>
                                <label className="block">
                                    مخاطبان
                                    <select
                                        value={
                                            form.data.is_public
                                                ? 'public'
                                                : 'private'
                                        }
                                        onChange={(event) =>
                                            form.setData({
                                                ...form.data,
                                                is_public:
                                                    event.target.value ===
                                                    'public',
                                                course_id: null,
                                                lesson_id: null,
                                                plan_ids: [],
                                            })
                                        }
                                        className="mt-2 w-full rounded-xl border border-current/20 bg-transparent p-3"
                                    >
                                        <option value="public">همه</option>
                                        <option value="private">
                                            دانشجویان دوره
                                        </option>
                                    </select>
                                </label>
                                {!form.data.is_public && (
                                    <>
                                        <label className="block">
                                            دوره
                                            <select
                                                required
                                                value={
                                                    form.data.course_id ?? ''
                                                }
                                                onChange={(event) =>
                                                    form.setData({
                                                        ...form.data,
                                                        course_id:
                                                            Number(
                                                                event.target
                                                                    .value,
                                                            ) || null,
                                                        lesson_id: null,
                                                        plan_ids: [],
                                                    })
                                                }
                                                className="mt-2 w-full rounded-xl border border-current/20 bg-transparent p-3"
                                            >
                                                <option value="">
                                                    انتخاب دوره
                                                </option>
                                                {courses.map((item) => (
                                                    <option
                                                        key={item.id}
                                                        value={item.id}
                                                    >
                                                        {item.title}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                        {course && (
                                            <>
                                                <label className="block">
                                                    درس (اختیاری)
                                                    <select
                                                        value={
                                                            form.data
                                                                .lesson_id ?? ''
                                                        }
                                                        onChange={(event) =>
                                                            form.setData(
                                                                'lesson_id',
                                                                Number(
                                                                    event.target
                                                                        .value,
                                                                ) || null,
                                                            )
                                                        }
                                                        className="mt-2 w-full rounded-xl border border-current/20 bg-transparent p-3"
                                                    >
                                                        <option value="">
                                                            تمام دوره
                                                        </option>
                                                        {course.lessons.map(
                                                            (lesson) => (
                                                                <option
                                                                    key={
                                                                        lesson.id
                                                                    }
                                                                    value={
                                                                        lesson.id
                                                                    }
                                                                >
                                                                    {
                                                                        lesson.name
                                                                    }
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                </label>
                                                <fieldset className="space-y-2">
                                                    <legend>
                                                        پلن‌ها (خالی یعنی همه
                                                        پلن‌ها)
                                                    </legend>
                                                    {course.plans.map(
                                                        (plan) => (
                                                            <label
                                                                key={plan.id}
                                                                className="flex gap-2"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={form.data.plan_ids.includes(
                                                                        plan.id,
                                                                    )}
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        form.setData(
                                                                            'plan_ids',
                                                                            event
                                                                                .target
                                                                                .checked
                                                                                ? [
                                                                                      ...form
                                                                                          .data
                                                                                          .plan_ids,
                                                                                      plan.id,
                                                                                  ]
                                                                                : form.data.plan_ids.filter(
                                                                                      (
                                                                                          id,
                                                                                      ) =>
                                                                                          id !==
                                                                                          plan.id,
                                                                                  ),
                                                                        )
                                                                    }
                                                                />
                                                                {plan.name}
                                                            </label>
                                                        ),
                                                    )}
                                                </fieldset>
                                            </>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                        {Object.values(form.errors).map((error) => (
                            <p role="alert" key={error}>
                                {error}
                            </p>
                        ))}
                        <button
                            className="storefront-button px-5 py-3"
                            disabled={form.processing}
                        >
                            ایجاد بحث
                        </button>
                    </form>
                ) : (
                    <p>
                        برای شروع بحث{' '}
                        <Link href={login()} className="underline">
                            وارد شوید
                        </Link>
                        .
                    </p>
                )}
            </div>
        </Storefront>
    );
}
