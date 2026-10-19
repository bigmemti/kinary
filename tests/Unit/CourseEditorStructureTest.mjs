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
                '../../resources/js/components/course-editor-structure.tsx',
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
});
const { default: Structure, CourseEditorItemPanel: Panel } =
    componentModule.exports;

function sections() {
    return [
        {
            id: 1,
            name: 'Section One',
            order: 1,
            lessons: [
                {
                    id: 1,
                    name: 'Lesson One',
                    order: 2,
                    contents: [
                        {
                            id: 1,
                            description: 'First description',
                            order: 3,
                            type: 'text',
                        },
                    ],
                },
                {
                    id: 2,
                    name: 'Lesson Two',
                    order: 3,
                    contents: [
                        {
                            id: 2,
                            description: 'Second description',
                            order: 4,
                            type: 'video',
                        },
                    ],
                },
            ],
        },
        { id: 2, name: 'Section Two', order: 2, lessons: [] },
    ];
}

function renderPanel(selection, data = sections()) {
    return renderToStaticMarkup(
        createElement(Panel, { sections: data, selection }),
    );
}

test('each item kind displays its own settings even when identifiers overlap', () => {
    const section = renderPanel({ kind: 'section', sectionId: 1 });
    assert.match(section, /تنظیمات سکشن/);
    assert.doesNotMatch(section, /Lesson One|First description/);

    const lesson = renderPanel({ kind: 'lesson', sectionId: 1, lessonId: 1 });
    assert.match(lesson, /تنظیمات لسن/);
    assert.match(lesson, /Lesson One/);
    assert.doesNotMatch(lesson, /First description|Second description/);

    const first = renderPanel({
        kind: 'content',
        sectionId: 1,
        lessonId: 1,
        contentId: 1,
    });
    assert.match(first, /First description/);
    assert.doesNotMatch(first, /Second description|Lesson Two/);

    const second = renderPanel({
        kind: 'content',
        sectionId: 1,
        lessonId: 2,
        contentId: 2,
    });
    assert.match(second, /Second description/);
    assert.match(second, /Lesson Two/);
    assert.doesNotMatch(second, /First description|Lesson One/);
});

test('missing items and mismatched parents show the selection prompt', () => {
    for (const selection of [
        null,
        { kind: 'section', sectionId: 99 },
        { kind: 'lesson', sectionId: 2, lessonId: 1 },
        { kind: 'content', sectionId: 1, lessonId: 2, contentId: 1 },
    ]) {
        const html = renderPanel(selection);
        assert.match(html, /برای نمایش مشخصات/);
        assert.doesNotMatch(
            html,
            /First description|Second description|Section One/,
        );
    }
    assert.match(
        renderPanel({ kind: 'section', sectionId: 1 }, []),
        /برای نمایش مشخصات/,
    );
});

test('the hierarchy highlights only the selected item and renders empty branches', () => {
    const data = sections();
    data[0].lessons.push({
        id: 3,
        name: 'Empty Lesson',
        order: 4,
        contents: [],
    });
    const html = renderToStaticMarkup(
        createElement(Structure, {
            sections: data,
            selection: {
                kind: 'content',
                sectionId: 1,
                lessonId: 1,
                contentId: 1,
            },
            onSelect: () => {},
        }),
    );
    assert.equal((html.match(/aria-pressed="true"/g) || []).length, 1);
    assert.match(html, /این سکشن هنوز لسن ندارد/);
    assert.match(html, /این لسن هنوز محتوا ندارد/);
    assert.match(html, /aria-expanded="true"/);
    assert.match(html, /First description/);
    assert.match(html, /Second description/);
});

test('saved descriptions are escaped and never rendered as active markup', () => {
    const data = sections();
    data[0].lessons[0].contents[0].description =
        '<script>alert("private")</script>';
    const html = renderPanel(
        { kind: 'content', sectionId: 1, lessonId: 1, contentId: 1 },
        data,
    );
    assert.match(html, /&lt;script&gt;/);
    assert.doesNotMatch(html, /<script>/);
});
