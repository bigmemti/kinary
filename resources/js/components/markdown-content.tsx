import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

const textSchema = {
    ...defaultSchema,
    tagNames: [...(defaultSchema.tagNames ?? []), 'u'],
};

export function MarkdownContent({
    children,
    className = '',
    links = true,
}: {
    children: string;
    className?: string;
    links?: boolean;
}) {
    return (
        <div dir="auto" className={`markdown-content ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, [rehypeSanitize, textSchema]]}
                disallowedElements={['img']}
                components={
                    links
                        ? undefined
                        : { a: ({ children: text }) => <span>{text}</span> }
                }
            >
                {children}
            </ReactMarkdown>
        </div>
    );
}
