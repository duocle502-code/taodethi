import { useEffect, useRef } from 'react';

interface MathMarkdownProps {
  content: string;
  className?: string;
}

/**
 * Chuyển Markdown thành HTML cơ bản.
 * KHÔNG escape $ và \ để MathJax tự xử lý công thức toán.
 */
function markdownToHtml(md: string): string {
  if (!md) return '';
  
  let html = md;

  // Escape HTML tags (trừ các ký tự LaTeX)
  html = html.replace(/&/g, '&amp;');
  html = html.replace(/</g, '&lt;');
  html = html.replace(/>/g, '&gt;');

  // Block math: $$...$$ → wrap in div (trước khi xử lý inline $)
  html = html.replace(/\$\$([\s\S]*?)\$\$/g, '<div class="math-block my-3 text-center overflow-x-auto text-lg">$$$$1$$</div>');

  // Headers: # → h1, ## → h2, ### → h3
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-gray-800 mt-5 mb-2">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-gray-900 mt-6 mb-3 pb-2 border-b border-gray-200">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-gray-900 mt-4 mb-3">$1</h1>');

  // Bold: **text**
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
  // Italic: *text*  (nhưng không phải **)
  html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');

  // Inline code: `code` (nhưng không phải math)
  html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-red-500 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');

  // Horizontal rule: ---
  html = html.replace(/^---+$/gm, '<hr class="my-4 border-gray-200" />');

  // Unordered list items: - item hoặc * item
  html = html.replace(/^[\-\*] (.+)$/gm, '<li class="ml-4 list-disc">$1</li>');
  
  // Ordered list items: 1. item
  html = html.replace(/^\d+\.\s(.+)$/gm, '<li class="ml-4 list-decimal">$1</li>');

  // Wrap consecutive <li> in <ul> or <ol>
  html = html.replace(/((?:<li class="ml-4 list-disc">.*<\/li>\n?)+)/g, '<ul class="my-2 space-y-1">$1</ul>');
  html = html.replace(/((?:<li class="ml-4 list-decimal">.*<\/li>\n?)+)/g, '<ol class="my-2 space-y-1">$1</ol>');

  // Paragraphs: double newline → new paragraph
  // Split by double newlines, wrap non-tag lines in <p>
  const blocks = html.split(/\n{2,}/);
  html = blocks.map(block => {
    const trimmed = block.trim();
    if (!trimmed) return '';
    // Don't wrap if already an HTML block element
    if (/^<(h[1-6]|div|ul|ol|li|hr|pre|blockquote|table)/i.test(trimmed)) {
      return trimmed;
    }
    // Replace single newlines with <br> inside paragraphs
    return `<p class="my-2 leading-relaxed">${trimmed.replace(/\n/g, '<br />')}</p>`;
  }).join('\n');

  return html;
}

export const MathMarkdown: React.FC<MathMarkdownProps> = ({ content, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Gọi MathJax sau khi DOM render
  useEffect(() => {
    if (!containerRef.current || !content) return;

    let timer: ReturnType<typeof setTimeout>;
    let attempts = 0;

    const renderMath = () => {
      const mj = (window as any).MathJax;
      if (mj && typeof mj.typesetPromise === 'function' && containerRef.current) {
        try {
          mj.typesetClear([containerRef.current]);
          mj.typesetPromise([containerRef.current]).catch((err: any) => {
            console.warn('MathJax warning:', err);
          });
        } catch (e) {
          console.error('MathJax error:', e);
        }
      } else {
        attempts++;
        if (attempts < 40) {
          timer = setTimeout(renderMath, 250);
        }
      }
    };

    // Delay nhỏ để DOM render xong
    timer = setTimeout(renderMath, 100);
    return () => clearTimeout(timer);
  }, [content]);

  const htmlContent = markdownToHtml(content || '');

  return (
    <div
      ref={containerRef}
      className={className}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};
