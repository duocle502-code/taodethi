import { useEffect, useRef } from 'react';

interface MathMarkdownProps {
  content: string;
  className?: string;
}

// Placeholder tokens để bảo vệ công thức toán khỏi bị markdown xử lý
const MATH_BLOCK_TOKEN = '\u0000MATH_BLOCK_';
const MATH_INLINE_TOKEN = '\u0000MATH_INLINE_';

/**
 * Trích xuất & bảo vệ công thức toán trước, sau đó xử lý Markdown,
 * rồi khôi phục lại công thức toán.
 */
function markdownToHtml(md: string): string {
  if (!md) return '';

  const mathBlocks: string[] = [];
  const mathInlines: string[] = [];
  let html = md;

  // 1. Trích xuất block math $$...$$ trước
  html = html.replace(/\$\$([\s\S]*?)\$\$/g, (_, expr) => {
    const idx = mathBlocks.length;
    mathBlocks.push(expr);
    return `${MATH_BLOCK_TOKEN}${idx}\u0000`;
  });

  // 2. Trích xuất inline math $...$ (không bắt $$ đã xử lý)
  html = html.replace(/\$([^\$\n]+?)\$/g, (_, expr) => {
    const idx = mathInlines.length;
    mathInlines.push(expr);
    return `${MATH_INLINE_TOKEN}${idx}\u0000`;
  });

  // 3. Trích xuất SVG blocks ```svg ... ```
  const svgBlocks: string[] = [];
  html = html.replace(/```svg\s*\n([\s\S]*?)```/g, (_, svgContent) => {
    const idx = svgBlocks.length;
    svgBlocks.push(svgContent.trim());
    return `\u0000SVG_BLOCK_${idx}\u0000`;
  });

  // 4. Trích xuất code blocks ```...```
  const codeBlocks: string[] = [];
  html = html.replace(/```(\w*)\s*\n([\s\S]*?)```/g, (_, lang, code) => {
    const idx = codeBlocks.length;
    codeBlocks.push(`<pre class="bg-gray-900 text-gray-100 p-4 rounded-xl my-3 overflow-x-auto text-sm font-mono"><code>${escapeHtml(code.trim())}</code></pre>`);
    return `\u0000CODE_BLOCK_${idx}\u0000`;
  });

  // 5. Escape HTML (giờ an toàn vì math đã được trích xuất)
  html = escapeHtml(html);

  // 6. Headers
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-gray-800 mt-5 mb-2">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-gray-900 mt-6 mb-3 pb-2 border-b border-gray-200">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-gray-900 mt-4 mb-3">$1</h1>');

  // 7. Bold & Italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');

  // 8. Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-red-500 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');

  // 9. Horizontal rule
  html = html.replace(/^---+$/gm, '<hr class="my-4 border-gray-200" />');

  // 10. Lists
  html = html.replace(/^[\-\*] (.+)$/gm, '<li class="ml-4 list-disc">$1</li>');
  html = html.replace(/^\d+\.\s(.+)$/gm, '<li class="ml-4 list-decimal">$1</li>');
  html = html.replace(/((?:<li class="ml-4 list-disc">.*<\/li>\n?)+)/g, '<ul class="my-2 space-y-1">$1</ul>');
  html = html.replace(/((?:<li class="ml-4 list-decimal">.*<\/li>\n?)+)/g, '<ol class="my-2 space-y-1">$1</ol>');

  // 11. Paragraphs
  const blocks = html.split(/\n{2,}/);
  html = blocks.map(block => {
    const trimmed = block.trim();
    if (!trimmed) return '';
    if (/^<(h[1-6]|div|ul|ol|li|hr|pre|blockquote|table)/i.test(trimmed)) {
      return trimmed;
    }
    if (/^\u0000(SVG_BLOCK|CODE_BLOCK|MATH_BLOCK)/.test(trimmed)) {
      return trimmed;
    }
    return `<p class="my-2 leading-relaxed">${trimmed.replace(/\n/g, '<br />')}</p>`;
  }).join('\n');

  // 12. Khôi phục code blocks
  codeBlocks.forEach((code, idx) => {
    html = html.replace(`\u0000CODE_BLOCK_${idx}\u0000`, code);
  });

  // 13. Khôi phục SVG blocks
  svgBlocks.forEach((svg, idx) => {
    html = html.replace(
      `\u0000SVG_BLOCK_${idx}\u0000`,
      `<div class="my-3 flex justify-center">${svg}</div>`
    );
  });

  // 14. Khôi phục block math $$...$$
  mathBlocks.forEach((expr, idx) => {
    html = html.replace(
      `${MATH_BLOCK_TOKEN}${idx}\u0000`,
      `<div class="math-block my-3 text-center overflow-x-auto text-lg">$$${expr}$$</div>`
    );
  });

  // 15. Khôi phục inline math $...$
  mathInlines.forEach((expr, idx) => {
    html = html.replace(
      `${MATH_INLINE_TOKEN}${idx}\u0000`,
      `\\(${ expr }\\)`
    );
  });

  return html;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export const MathMarkdown: React.FC<MathMarkdownProps> = ({ content, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !content) return;

    let timer: ReturnType<typeof setTimeout>;
    let attempts = 0;

    const renderMath = () => {
      const mj = (window as any).MathJax;
      if (mj && typeof mj.typesetPromise === 'function' && containerRef.current) {
        try {
          // Xóa typeset cũ trước khi render mới
          mj.typesetClear([containerRef.current]);
          mj.typesetPromise([containerRef.current]).catch((err: any) => {
            console.warn('MathJax warning:', err);
          });
        } catch (e) {
          console.error('MathJax error:', e);
        }
      } else {
        attempts++;
        if (attempts < 50) {
          timer = setTimeout(renderMath, 200);
        }
      }
    };

    // Delay nhỏ để DOM render xong
    timer = setTimeout(renderMath, 50);
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
