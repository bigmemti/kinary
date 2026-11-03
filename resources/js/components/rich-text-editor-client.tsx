import {
    BlockTypeSelect,
    BoldItalicUnderlineToggles,
    CodeToggle,
    CreateLink,
    DiffSourceToggleWrapper,
    InsertCodeBlock,
    InsertTable,
    InsertThematicBreak,
    ListsToggle,
    MDXEditor,
    Separator,
    StrikeThroughSupSubToggles,
    UndoRedo,
    codeBlockPlugin,
    codeMirrorPlugin,
    diffSourcePlugin,
    headingsPlugin,
    linkDialogPlugin,
    linkPlugin,
    listsPlugin,
    markdownShortcutPlugin,
    quotePlugin,
    tablePlugin,
    thematicBreakPlugin,
    toolbarPlugin,
    type MDXEditorMethods,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import type { ComponentProps } from 'react';
import { useEffect, useRef, useState } from 'react';

type Props = Omit<ComponentProps<'textarea'>, 'onChange'> & {
    markdown: string;
    onMarkdownChange: (value: string) => void;
};

const translations: Record<string, string> = {
    'toolbar.undo': 'واگرد',
    'toolbar.redo': 'بازگردانی',
    'toolbar.blockTypes.heading': 'عنوان {{level}}',
    'toolbar.blockTypes.paragraph': 'پاراگراف',
    'toolbar.blockTypes.quote': 'نقل‌قول',
    'toolbar.blockTypeSelect.placeholder': 'نوع متن',
    'toolbar.blockTypeSelect.selectBlockTypeTooltip': 'انتخاب نوع متن',
    'toolbar.bold': 'درشت',
    'toolbar.removeBold': 'حذف متن درشت',
    'toolbar.italic': 'کج',
    'toolbar.removeItalic': 'حذف متن کج',
    'toolbar.underline': 'زیرخط',
    'toolbar.removeUnderline': 'حذف زیرخط',
    'toolbar.inlineCode': 'کد درون متن',
    'toolbar.strikethrough': 'خط‌خورده',
    'toolbar.removeStrikethrough': 'حذف خط‌خوردگی',
    'toolbar.subscript': 'زیرنویس',
    'toolbar.removeSubscript': 'حذف زیرنویس',
    'toolbar.superscript': 'بالانویس',
    'toolbar.removeSuperscript': 'حذف بالانویس',
    'toolbar.removeInlineCode': 'حذف قالب کد',
    'toolbar.bulletedList': 'فهرست نشانه‌دار',
    'toolbar.numberedList': 'فهرست شماره‌دار',
    'toolbar.checkList': 'فهرست وظایف',
    'toolbar.link': 'افزودن پیوند',
    'toolbar.table': 'افزودن جدول',
    'toolbar.codeBlock': 'افزودن قطعه کد',
    'toolbar.thematicBreak': 'افزودن خط جداکننده',
    'toolbar.richText': 'ویرایش بصری',
    'toolbar.source': 'متن مارک‌داون',
    'toolbar.toggleGroup': 'ابزار ویرایش',
    'dialog.close': 'بستن',
    'dialogControls.cancel': 'انصراف',
    'dialogControls.save': 'ذخیره',
    'createLink.url': 'نشانی',
    'createLink.urlPlaceholder': 'نشانی پیوند را وارد کنید',
    'createLink.text': 'متن پیوند',
    'createLink.textTooltip': 'متن نمایشی پیوند',
    'createLink.title': 'عنوان پیوند',
    'createLink.titleTooltip': 'عنوان پیوند',
    'createLink.saveTooltip': 'ثبت نشانی',
    'createLink.cancelTooltip': 'انصراف',
    'linkPreview.copied': 'کپی شد',
    'linkPreview.copyToClipboard': 'کپی نشانی',
    'linkPreview.edit': 'ویرایش پیوند',
    'linkPreview.remove': 'حذف پیوند',
    'codeblock.delete': 'حذف قطعه کد',
    'codeBlock.inlineLanguage': 'زبان',
    'codeBlock.language': 'زبان کد',
    'codeBlock.selectLanguage': 'انتخاب زبان کد',
    'table.alignCenter': 'وسط‌چین',
    'table.alignLeft': 'چپ‌چین',
    'table.alignRight': 'راست‌چین',
    'table.columnMenu': 'گزینه‌های ستون',
    'table.rowMenu': 'گزینه‌های ردیف',
    'table.deleteColumn': 'حذف ستون',
    'table.deleteRow': 'حذف ردیف',
    'table.deleteTable': 'حذف جدول',
    'table.insertColumnLeft': 'درج ستون در چپ',
    'table.insertColumnRight': 'درج ستون در راست',
    'table.insertRowAbove': 'درج ردیف بالا',
    'table.insertRowBelow': 'درج ردیف پایین',
    'table.textAlignment': 'تراز متن',
};

export default function RichTextEditorClient({
    markdown,
    onMarkdownChange,
    id,
    placeholder,
    disabled,
    maxLength,
    ...props
}: Props) {
    const editor = useRef<MDXEditorMethods>(null);
    const lastEmitted = useRef(markdown);
    const container = useRef<HTMLDivElement>(null);
    const [parseError, setParseError] = useState(false);

    useEffect(() => {
        if (markdown !== lastEmitted.current) {
            editor.current?.setMarkdown(markdown);
            lastEmitted.current = markdown;
        }
    }, [markdown]);

    useEffect(() => {
        const editable =
            container.current?.querySelector<HTMLElement>('[contenteditable]');
        if (!editable) return;
        if (id) editable.id = id;
        editable.setAttribute('dir', 'auto');
        const label = id
            ? document.querySelector<HTMLLabelElement>(
                  `label[for="${CSS.escape(id)}"]`,
              )
            : null;
        if (label?.textContent)
            editable.setAttribute('aria-label', label.textContent.trim());
        if (props['aria-describedby'])
            editable.setAttribute(
                'aria-describedby',
                props['aria-describedby'],
            );
        if (props['aria-invalid'])
            editable.setAttribute(
                'aria-invalid',
                String(props['aria-invalid']),
            );
    }, [id, props]);

    return (
        <div ref={container} className="rich-text-editor" dir="rtl" lang="fa">
            {parseError ? (
                <div className="p-3">
                    <p role="alert">
                        این متن در ویرایش بصری قابل نمایش نیست؛ می‌توانید متن
                        اصلی را ویرایش کنید.
                    </p>
                    <textarea
                        id={id}
                        dir="auto"
                        className="min-h-40 w-full p-3"
                        value={markdown}
                        disabled={disabled}
                        onChange={(event) =>
                            onMarkdownChange(event.target.value)
                        }
                    />
                    <button type="button" onClick={() => setParseError(false)}>
                        تلاش دوباره برای ویرایش بصری
                    </button>
                </div>
            ) : (
                <MDXEditor
                    ref={editor}
                    markdown={markdown}
                    trim={false}
                    readOnly={disabled}
                    translation={(key, fallback, values) =>
                        (translations[key] ?? fallback).replace(
                            /\{\{(\w+)\}\}/g,
                            (_, name: string) => String(values?.[name] ?? ''),
                        )
                    }
                    onError={() => setParseError(true)}
                    placeholder={placeholder}
                    contentEditableClassName="rich-text-content"
                    className="rich-text-root"
                    onChange={(next, initialNormalize) => {
                        if (initialNormalize) return;
                        lastEmitted.current = next;
                        onMarkdownChange(next);
                    }}
                    plugins={[
                        headingsPlugin(),
                        listsPlugin(),
                        quotePlugin(),
                        thematicBreakPlugin(),
                        linkPlugin(),
                        linkDialogPlugin(),
                        tablePlugin(),
                        codeBlockPlugin(),
                        codeMirrorPlugin({
                            codeBlockLanguages: {
                                '': 'متن ساده',
                                javascript: 'JavaScript',
                                typescript: 'TypeScript',
                                php: 'PHP',
                                html: 'HTML',
                                css: 'CSS',
                                bash: 'Shell',
                                sql: 'SQL',
                                json: 'JSON',
                            },
                        }),
                        markdownShortcutPlugin(),
                        diffSourcePlugin(),
                        toolbarPlugin({
                            toolbarContents: () => (
                                <DiffSourceToggleWrapper
                                    options={['rich-text', 'source']}
                                >
                                    <UndoRedo />
                                    <Separator />
                                    <BlockTypeSelect />
                                    <BoldItalicUnderlineToggles />
                                    <StrikeThroughSupSubToggles />
                                    <CodeToggle />
                                    <Separator />
                                    <ListsToggle />
                                    <CreateLink />
                                    <InsertTable />
                                    <InsertCodeBlock />
                                    <InsertThematicBreak />
                                </DiffSourceToggleWrapper>
                            ),
                        }),
                    ]}
                />
            )}
            {maxLength !== undefined && markdown.length > maxLength && (
                <p role="alert" className="text-sm text-destructive">
                    متن از محدودیت {maxLength} نویسه بیشتر است.
                </p>
            )}
        </div>
    );
}
