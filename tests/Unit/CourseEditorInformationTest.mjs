import { build } from 'esbuild';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const compiled = await build({
    entryPoints: [
        fileURLToPath(
            new URL(
                '../../resources/js/components/course-editor-information.tsx',
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
const componentModule = { exports: {} };
runInNewContext(compiled.outputFiles[0].text, {
    module: componentModule,
    exports: componentModule.exports,
    require: createRequire(import.meta.url),
    setTimeout,
    clearTimeout,
    URLSearchParams,
    FormData,
    AbortController,
});
const Information = componentModule.exports.default;

function render(permissions, hasOwner = true) {
    return renderToStaticMarkup(
        createElement(Information, {
            course: { id: 1, title: 'Saved title', is_published: false },
            overview: {
                slug: 'saved-slug',
                description: 'Saved description',
                thumbnail: 'https://example.com/image.jpg',
                intro_video_url: 'https://example.com/video.mp4',
                sections_count: 0,
                spaces_count: 0,
                sections: [],
                permissions,
                has_owner: hasOwner,
                teachers: [
                    {
                        id: 1,
                        name: 'Course Owner',
                        role: hasOwner ? 'owner' : 'instructor',
                        created_at: null,
                        updated_at: null,
                    },
                ],
                available_teachers: permissions.manage_teachers
                    ? [{ id: 2, name: 'New Teacher' }]
                    : [],
            },
            onStatus: () => {},
        }),
    );
}

test('owners see saved information and controls for both course data and teachers', () => {
    const html = render({
        update_information: true,
        publish: true,
        manage_teachers: true,
    });
    assert.match(html, /value="Saved title"/);
    assert.match(html, /value="saved-slug"/);
    assert.match(html, /Saved description/);
    assert.match(html, /https:\/\/example.com\/image.jpg/);
    assert.match(html, /https:\/\/example.com\/video.mp4/);
    assert.match(html, /ذخیره اطلاعات دوره/);
    assert.match(html, /ذخیره مدرس‌ها/);
    assert.match(html, /افزودن به فهرست/);
    assert.match(html, /برای حذف یا تغییر سمت این مالک/);
});

test('editors can edit course data but cannot manage teachers or publication', () => {
    const html = render({
        update_information: true,
        publish: false,
        manage_teachers: false,
    });
    assert.match(html, /ذخیره اطلاعات دوره/);
    assert.match(html, /Course Owner/);
    assert.match(html, /تغییر وضعیت انتشار فقط در اختیار مالک/);
    assert.doesNotMatch(html, /ذخیره مدرس‌ها|افزودن به فهرست|حذف Course Owner/);
    const publicationTrigger = html.match(
        /<button\b[^>]*id="editor-publication"[^>]*>/,
    )?.[0];
    assert.ok(publicationTrigger);
    assert.match(publicationTrigger, /\bdisabled=""/);
});

test('a viewer sees disabled fields and a clear warning when the course has no owner', () => {
    const html = render(
        { update_information: false, publish: false, manage_teachers: false },
        false,
    );
    assert.match(html, /<fieldset disabled=""/);
    assert.match(html, /این دوره مالک ندارد/);
    assert.match(html, /Saved title/);
    assert.doesNotMatch(
        html,
        /ذخیره اطلاعات دوره|ذخیره مدرس‌ها|افزودن به فهرست/,
    );
});
