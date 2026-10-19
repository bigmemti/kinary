import { build } from 'esbuild';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

async function component(name) {
    const compiled = await build({
        entryPoints: [
            fileURLToPath(
                new URL(
                    `../../resources/js/components/${name}.tsx`,
                    import.meta.url,
                ),
            ),
        ],
        bundle: true,
        platform: 'node',
        format: 'cjs',
        external: ['react', 'react/*', 'react-dom', 'react-dom/*'],
        mainFields: ['module', 'main'],
        write: false,
    });
    const module = { exports: {} };
    runInNewContext(compiled.outputFiles[0].text, {
        module,
        exports: module.exports,
        require: createRequire(import.meta.url),
        setTimeout,
        clearTimeout,
        URLSearchParams,
        FormData,
        AbortController,
    });
    return module.exports.default;
}

const Spaces = await component('course-editor-spaces');
const ItemForm = await component('course-editor-item-form');
const Structure = await component('course-editor-structure');
const ContentForm = await component('course-editor-content-form');

function overview(
    permissions = {
        manage_commerce: true,
        update_structure: true,
        delete_structure: true,
    },
) {
    return {
        permissions,
        available_quizzes: [],
        spaces: [
            {
                id: 1,
                name: '<script>Space</script>',
                quiz_id: null,
                delete_block_reason: 'ابتدا پلن‌ها را حذف کنید.',
                plans: [
                    {
                        id: 1,
                        name: 'Plan one',
                        price: 0,
                        order: 3,
                        delete_block_reason: 'دارای سابقه سفارش',
                        enrollments_count: 1,
                        orders_count: 1,
                    },
                ],
            },
        ],
        sections: [
            {
                id: 1,
                name: 'Section',
                order: 1,
                lessons: [
                    {
                        id: 1,
                        name: 'Lesson',
                        order: 2,
                        contents: [],
                        thumbnail: 'cover.png',
                        thumbnail_url: '/storage/cover.png',
                        images: [
                            {
                                path: 'gallery.png',
                                url: '/storage/gallery.png',
                            },
                        ],
                        pricings: [{ plan_id: 1, price: 0 }],
                    },
                ],
            },
        ],
    };
}

test('owner sees space and plan actions with explicit dependency reasons and escaped names', () => {
    const html = renderToStaticMarkup(
        createElement(Spaces, {
            courseId: 1,
            overview: overview(),
            onStatus() {},
        }),
    );
    assert.match(html, /ایجاد اسپیس جدید|افزودن پلن/);
    assert.match(html, /ویرایش پلن Plan one/);
    assert.match(html, /دارای سابقه سفارش/);
    assert.match(html, /رایگان/);
    assert.match(html, /&lt;script&gt;Space&lt;\/script&gt;/);
    assert.doesNotMatch(html, /<script>/);
    assert.match(
        html.match(/<button[^>]*aria-label="حذف پلن Plan one"[^>]*>/)?.[0] ??
            '',
        /disabled/,
    );
});

test('viewer sees spaces and plans without mutation controls', () => {
    const html = renderToStaticMarkup(
        createElement(Spaces, {
            courseId: 1,
            overview: overview({ manage_commerce: false }),
            onStatus() {},
        }),
    );
    assert.match(html, /Plan one/);
    assert.match(html, /فقط برای مالک دوره/);
    assert.doesNotMatch(html, /aria-label="ویرایش|ایجاد اسپیس جدید|افزودن پلن/);
});

test('owner lesson panel shows saved media and zero price with labeled upload fields', () => {
    const html = renderToStaticMarkup(
        createElement(ItemForm, {
            overview: overview(),
            selection: { kind: 'lesson', sectionId: 1, lessonId: 1 },
            onStatus() {},
            onDirty() {},
            onDeleted() {},
        }),
    );
    assert.match(html, /id="structure-name"[^>]*value="Lesson"/);
    assert.match(html, /id="lesson-thumbnail"/);
    assert.match(html, /id="lesson-images"/);
    assert.match(html, /src="\/storage\/cover.png"/);
    assert.match(html, /src="\/storage\/gallery.png"/);
    assert.match(html, /id="lesson-price-1"[^>]*value="0"/);
    assert.match(html, /حذف لسن|ذخیره تغییرات/);
});

test('instructor lesson panel hides pricing and deletion controls', () => {
    const html = renderToStaticMarkup(
        createElement(ItemForm, {
            overview: overview({
                manage_commerce: false,
                update_structure: true,
                delete_structure: false,
            }),
            selection: { kind: 'lesson', sectionId: 1, lessonId: 1 },
            onStatus() {},
            onDirty() {},
            onDeleted() {},
        }),
    );
    assert.match(html, /ذخیره تغییرات/);
    assert.match(html, /تنظیم قیمت لسن فقط برای مالک/);
    assert.doesNotMatch(html, /id="lesson-price-1"|حذف لسن/);
});

test('lesson creation control is rendered inside each section including empty sections', () => {
    const data = [
        ...overview().sections,
        { id: 2, name: 'Empty section', order: 2, lessons: [] },
    ];
    const editable = renderToStaticMarkup(
        createElement(Structure, {
            sections: data,
            selection: null,
            onSelect() {},
            onCreateLesson() {},
        }),
    );
    const viewer = renderToStaticMarkup(
        createElement(Structure, {
            sections: data,
            selection: null,
            onSelect() {},
        }),
    );
    assert.equal((editable.match(/افزودن لسن به این سکشن/g) ?? []).length, 2);
    assert.doesNotMatch(viewer, /افزودن لسن به این سکشن/);
});

function contentValues(type = 'text') {
    return {
        id: 5,
        type,
        order: 1,
        description: '<script>Unsafe</script>',
        body: 'Saved body',
        name: 'guide.pdf',
        url: '/teacher/content/5/editor/download',
        table: [['A', 'B']],
        remind_content_id: 6,
        accesses: [{ plan_id: 1, requirements: [{ space_id: 1, score: 10 }] }],
        delete_block_reason: null,
    };
}

for (const [type, expected] of Object.entries({
    text: 'content-body',
    image: 'content-upload',
    video: 'content-url',
    file: 'دریافت فایل فعلی',
    table: 'ردیف 1 ستون 1',
    remind: 'content-target',
})) {
    test(`${type} content renders its saved values and editing controls`, () => {
        const data = overview();
        data.spaces[0].quiz_id = 1;
        const html = renderToStaticMarkup(
            createElement(ContentForm, {
                content: contentValues(type),
                overview: data,
                onStatus() {},
                onDirty() {},
                onDeleted() {},
            }),
        );
        assert.ok(html.includes(expected));
        assert.match(html, /ذخیره محتوا/);
        assert.match(html, /حداقل نمره/);
        assert.match(html, /value="10"/);
        assert.match(html, /&lt;script&gt;Unsafe&lt;\/script&gt;/);
        assert.doesNotMatch(html, /<script>Unsafe/);
    });
}

test('instructor content form hides commerce and deletion but allows body editing', () => {
    const html = renderToStaticMarkup(
        createElement(ContentForm, {
            content: contentValues(),
            overview: overview({
                manage_commerce: false,
                update_structure: true,
                delete_structure: false,
            }),
            onStatus() {},
            onDirty() {},
            onDeleted() {},
        }),
    );
    assert.match(html, /Saved body/);
    assert.doesNotMatch(html, /حذف محتوا|دسترسی پلن‌ها و پیش‌نیازها/);
});

test('selected content opens the editing form in the item panel and respects deletion dependencies', () => {
    const data = overview();
    data.sections[0].lessons[0].contents = [
        {
            ...contentValues(),
            delete_block_reason: 'این محتوا پیشرفت دانشجو دارد و حذف نمی‌شود.',
        },
    ];
    const html = renderToStaticMarkup(
        createElement(ItemForm, {
            overview: data,
            selection: {
                kind: 'content',
                sectionId: 1,
                lessonId: 1,
                contentId: 5,
            },
            onStatus() {},
            onDirty() {},
            onDeleted() {},
        }),
    );
    assert.match(html, /ویرایش محتوا/);
    assert.match(html, /Saved body/);
    assert.match(html, /disabled=""[^>]*>حذف محتوا/);
    assert.match(html, /این محتوا پیشرفت دانشجو دارد/);
});
