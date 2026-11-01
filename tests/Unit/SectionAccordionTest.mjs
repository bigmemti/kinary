import { build } from 'esbuild';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

async function loadComponent(path) {
    const compiled = await build({
        entryPoints: [fileURLToPath(new URL(path, import.meta.url))],
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
        FormData,
        URLSearchParams,
        URL,
    });
    return componentModule.exports;
}

const { StudyOutline } = await loadComponent(
    '../../resources/js/components/study-outline.tsx',
);
const { PublicSectionItem } = await loadComponent(
    '../../resources/js/pages/course/details.tsx',
);

function detailPaths(html) {
    const stack = [];
    const paths = {};
    for (const token of html.matchAll(
        /<details\b[^>]*>|<\/details>|Root|Child|Grandchild|Sibling/g,
    )) {
        if (token[0].startsWith('<details')) {
            stack.push({ open: /\bopen(?:=|\s|>)/.test(token[0]) });
        } else if (token[0] === '</details>') {
            stack.pop();
        } else {
            paths[token[0]] = stack.map((item) => item.open);
        }
    }
    return paths;
}

const sections = [
    { id: 1, name: 'Root', depth: 0, lessons: [] },
    { id: 2, name: 'Child', depth: 1, lessons: [] },
    {
        id: 3,
        name: 'Grandchild',
        depth: 2,
        lessons: [{ id: 7, name: 'Lesson', readCount: 0, totalCount: 1 }],
    },
    { id: 4, name: 'Sibling', depth: 0, lessons: [] },
];

test('study outline nests sections and opens only the current lesson path', () => {
    const closed = detailPaths(
        renderToStaticMarkup(
            createElement(StudyOutline, { spaceId: 1, sections }),
        ),
    );
    assert.deepEqual(closed.Root, [false]);
    assert.deepEqual(closed.Child, [false, false]);
    assert.deepEqual(closed.Grandchild, [false, false, false]);
    assert.deepEqual(closed.Sibling, [false]);

    const current = detailPaths(
        renderToStaticMarkup(
            createElement(StudyOutline, {
                spaceId: 1,
                sections,
                currentLessonId: 7,
            }),
        ),
    );
    assert.deepEqual(current.Grandchild, [true, true, true]);
    assert.deepEqual(current.Sibling, [false]);
});

test('course outline places descendant accordions inside their parent', () => {
    const section = {
        ...sections[0],
        children: [
            {
                ...sections[1],
                children: [{ ...sections[2], lessons: [], children: [] }],
            },
        ],
    };
    const paths = detailPaths(
        renderToStaticMarkup(createElement(PublicSectionItem, { section })),
    );
    assert.deepEqual(paths.Root, [false]);
    assert.deepEqual(paths.Child, [false, false]);
    assert.deepEqual(paths.Grandchild, [false, false, false]);
});
