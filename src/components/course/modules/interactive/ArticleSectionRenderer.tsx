
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertCircle } from 'lucide-react';

interface ArticleSectionProps {
  section: {
    title?: string;
    heading?: string;
    content?: string;
    content_markdown?: string;
  };
}

const ArticleSectionRenderer: React.FC<ArticleSectionProps> = ({ section }) => {
  const title = section.title || section.heading || '';
  const content = section.content_markdown || section.content || '';
  
  if (!content) {
    return (
      <Card className="bg-dark-300 border-dark-200 p-6">
        <div className="flex items-center justify-center text-center p-4">
          <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
          <span className="text-gray-400">No content available for this section</span>
        </div>
      </Card>
    );
  }
  
  return (
    <div className="article-section mb-8">
      {title && (
        <>
          <h2 className="text-2xl font-bold mb-4 text-white">{title}</h2>
          <Separator className="mb-4" />
        </>
      )}
      
      <Card className="bg-dark-300 border-dark-200 p-6">
        <div className="prose prose-invert prose-lg max-w-none">
          <ReactMarkdown 
            components={{
              pre: ({ node, ...props }) => (
                <div className="bg-dark-500 p-4 rounded-md my-4 overflow-auto">
                  <pre {...props} />
                </div>
              ),
              code: ({ node, className, children, ...props }) => {
                // Check if this is an inline code block by seeing if it's directly within a paragraph
                const isInlineCode = !className;
                
                if (isInlineCode) {
                  return (
                    <code className="bg-dark-500 px-1.5 py-0.5 rounded text-sm text-kibi-300" {...props}>
                      {children}
                    </code>
                  );
                }
                return (
                  <code className={`${className} block`} {...props}>
                    {children}
                  </code>
                );
              },
              h1: ({ node, children, ...props }) => (
                <h1 className="text-3xl font-bold mt-8 mb-4 text-white/90" {...props}>
                  {children}
                </h1>
              ),
              h2: ({ node, children, ...props }) => (
                <h2 className="text-2xl font-semibold mt-7 mb-3 text-white/90 border-b border-dark-200 pb-2" {...props}>
                  {children}
                </h2>
              ),
              h3: ({ node, children, ...props }) => (
                <h3 className="text-xl font-semibold mt-6 mb-3 text-kibi-400" {...props}>
                  {children}
                </h3>
              ),
              h4: ({ node, children, ...props }) => (
                <h4 className="text-lg font-medium mt-5 mb-2 text-kibi-300" {...props}>
                  {children}
                </h4>
              ),
              p: ({ node, children, ...props }) => (
                <p className="my-4 leading-relaxed text-gray-200" {...props}>{children}</p>
              ),
              a: ({ node, children, ...props }) => (
                <a className="text-kibi-400 hover:text-kibi-300 underline" {...props}>{children}</a>
              ),
              blockquote: ({ node, children, ...props }) => (
                <blockquote className="border-l-4 border-kibi-500 pl-4 italic my-4 text-gray-300 bg-dark-400/50 p-3 rounded-r" {...props}>
                  {children}
                </blockquote>
              ),
              ul: ({ node, children, ...props }) => (
                <ul className="list-disc pl-6 my-4 space-y-2 text-gray-200" {...props}>
                  {children}
                </ul>
              ),
              ol: ({ node, children, ...props }) => (
                <ol className="list-decimal pl-6 my-4 space-y-2 text-gray-200" {...props}>
                  {children}
                </ol>
              ),
              li: ({ node, children, ...props }) => (
                <li className="ml-2 py-1" {...props}>{children}</li>
              ),
              table: ({ node, children, ...props }) => (
                <div className="overflow-x-auto my-6 rounded-md border border-dark-200">
                  <table className="min-w-full border-collapse" {...props}>
                    {children}
                  </table>
                </div>
              ),
              thead: ({ node, children, ...props }) => (
                <thead className="bg-dark-400" {...props}>{children}</thead>
              ),
              tbody: ({ node, children, ...props }) => (
                <tbody className="divide-y divide-dark-200" {...props}>{children}</tbody>
              ),
              th: ({ node, children, ...props }) => (
                <th className="px-4 py-3 text-left font-semibold text-sm text-white/90" {...props}>
                  {children}
                </th>
              ),
              td: ({ node, children, ...props }) => (
                <td className="px-4 py-3 text-sm" {...props}>
                  {children}
                </td>
              ),
              strong: ({ node, children, ...props }) => (
                <strong className="font-semibold text-kibi-300" {...props}>{children}</strong>
              ),
              em: ({ node, children, ...props }) => (
                <em className="italic text-gray-300" {...props}>{children}</em>
              ),
              hr: ({ node, ...props }) => (
                <hr className="my-6 border-dark-200" {...props} />
              ),
              img: ({ node, ...props }) => (
                <div className="flex justify-center my-6">
                  <img className="max-w-full h-auto rounded-lg shadow-md border border-dark-200" {...props} alt={props.alt || "Article image"} />
                </div>
              )
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </Card>
    </div>
  );
};

export default ArticleSectionRenderer;
