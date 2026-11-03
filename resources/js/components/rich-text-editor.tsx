import { Textarea } from '@/components/ui/textarea';
import type { ChangeEvent, ComponentProps } from 'react';
import { lazy, Suspense, useEffect, useRef, useState, useSyncExternalStore } from 'react';

const Editor = lazy(() => import('./rich-text-editor-client'));
const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

type Props = ComponentProps<'textarea'>;

/** A textarea-compatible Markdown editor for both Inertia forms and native forms. */
export function RichTextEditor({
    value,
    defaultValue,
    onChange,
    name,
    required,
    maxLength,
    disabled,
    ...props
}: Props) {
    const initialValue = String(value ?? defaultValue ?? '');
    const [markdown, setMarkdown] = useState(initialValue);
    const ready = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
    const [invalid, setInvalid] = useState(false);
    const [fieldsetDisabled, setFieldsetDisabled] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const initialRef = useRef(initialValue);
    const currentValue = value === undefined ? markdown : String(value ?? '');

    useEffect(() => {
        const form = textareaRef.current?.form;
        const reset = () => setMarkdown(initialRef.current);
        form?.addEventListener('reset', reset);
        return () => form?.removeEventListener('reset', reset);
    }, []);
    useEffect(() => {
        const fieldset = textareaRef.current?.closest('fieldset');
        if (!fieldset) return;
        const update = () => setFieldsetDisabled(fieldset.disabled);
        update();
        const observer = new MutationObserver(update);
        observer.observe(fieldset, {
            attributes: true,
            attributeFilter: ['disabled'],
        });
        return () => observer.disconnect();
    }, []);

    function change(next: string) {
        setInvalid(false);
        setMarkdown(next);
        const target = textareaRef.current;
        if (target) {
            target.value = next;
            target.setCustomValidity(
                maxLength !== undefined && next.length > maxLength
                    ? `حداکثر ${maxLength} نویسه مجاز است.`
                    : '',
            );
            onChange?.({
                target,
                currentTarget: target,
            } as ChangeEvent<HTMLTextAreaElement>);
        }
    }

    useEffect(() => {
        textareaRef.current?.setCustomValidity(
            maxLength !== undefined && currentValue.length > maxLength
                ? `حداکثر ${maxLength} نویسه مجاز است.`
                : '',
        );
    }, [currentValue, maxLength]);

    const fallback = (
        <Textarea
            ref={textareaRef}
            {...props}
            name={name}
            value={currentValue}
            required={required}
            maxLength={maxLength}
            disabled={disabled || fieldsetDisabled}
            onChange={(event) => {
                setMarkdown(event.target.value);
                onChange?.(event);
            }}
        />
    );
    if (!ready) return fallback;

    return (
        <Suspense fallback={fallback}>
            <textarea
                ref={textareaRef}
                name={name}
                value={currentValue}
                onChange={() => {}}
                required={required}
                maxLength={maxLength}
                disabled={disabled || fieldsetDisabled}
                tabIndex={-1}
                aria-hidden="true"
                className="absolute h-px w-px opacity-0"
                onInvalid={(event) => {
                    event.preventDefault();
                    setInvalid(true);
                    document.getElementById(props.id ?? '')?.focus();
                }}
            />
            <Editor
                {...props}
                markdown={currentValue}
                onMarkdownChange={change}
                disabled={disabled || fieldsetDisabled}
                maxLength={maxLength}
            />
            {invalid && (
                <p role="alert" className="text-sm text-destructive">
                    {currentValue
                        ? 'متن واردشده از محدودیت مجاز بیشتر است.'
                        : 'وارد کردن متن الزامی است.'}
                </p>
            )}
        </Suspense>
    );
}
