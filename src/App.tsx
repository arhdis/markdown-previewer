/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Upload, Copy, FileText, Eye } from 'lucide-react';

const defaultMarkdown = `Heading
=======

## Sub-heading

Paragraphs are separated
by a blank line.

Two spaces at the end of a line  
produces a line break.

Text attributes _italic_, 
**bold**, \`monospace\`.

### Code Block Example

\`\`\`typescript
interface User {
  name: string;
  id: number;
}

function greet(user: User) {
  console.log(\`Hello, \${user.name}!\`);
}

greet({ name: "World", id: 1 });
\`\`\`

Horizontal rule:

---

Bullet list:

  * apples
  * oranges
  * pears

Numbered list:

  1. wash
  2. rinse
  3. repeat

A [link](http://example.com).

![Image](https://is1-ssl.mzstatic.com/image/thumb/Purple118/v4/bc/ba/16/bcba16f8-49ce-c6b9-6226-d7d85a8556ea/source/60x60bb.jpg "icon")

> Markdown uses email-style > characters for blockquoting.

Inline <abbr title="Hypertext Markup Language">HTML</abbr> is supported.`;

export default function App() {
  const [markdown, setMarkdown] = useState(defaultMarkdown);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleMarkdownChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target && typeof event.target.result === 'string') {
        setMarkdown(event.target.result);
      }
    };
    
    reader.readAsText(file);
    
    // Reset file input so the same file can be uploaded again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const selectPreviewText = () => {
    if (!previewRef.current) return;
    
    const el = previewRef.current;
    let sel, range;
    
    if (window.getSelection && document.createRange) {
      sel = window.getSelection();
      if (sel) {
        window.setTimeout(() => {
          range = document.createRange();
          range.selectNodeContents(el);
          sel?.removeAllRanges();
          sel?.addRange(range);
        }, 1);
      }
    }
  };

  const copyToClipboard = async () => {
    if (!previewRef.current) return;
    
    try {
      // Try to copy the rendered text
      await navigator.clipboard.writeText(previewRef.current.innerText);
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Fallback to selection
      selectPreviewText();
      document.execCommand('copy');
    }
  };

  return (
    <div className="h-dvh bg-slate-50 flex flex-col font-sans text-slate-900 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-3 sm:px-6 py-2 sm:py-4 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="bg-indigo-600 text-white p-2 rounded-lg">
            <FileText size={20} />
          </div>
          <h1 className="font-semibold text-slate-800 tracking-tight truncate">
            <span className="text-base sm:text-xl hidden sm:inline">Markdown Previewer</span>
            <span className="text-base sm:hidden">MD</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          <input
            type="file"
            accept=".md,.txt,text/markdown,text/plain"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button
            onClick={triggerFileUpload}
            className="inline-flex items-center justify-center gap-2 h-9 w-9 sm:h-auto sm:w-auto px-0 sm:px-4 py-0 sm:py-2 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
            aria-label="Upload file"
            title="Upload file"
          >
            <Upload size={16} />
            <span className="hidden sm:inline">Upload File</span>
          </button>
          <button
            onClick={copyToClipboard}
            className="inline-flex items-center justify-center gap-2 h-9 w-9 sm:h-auto sm:w-auto px-0 sm:px-4 py-0 sm:py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
            aria-label="Copy preview"
            title="Copy preview"
          >
            <Copy size={16} />
            <span className="hidden sm:inline">Copy Preview</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
        {/* Mobile Tabs */}
        <div className="md:hidden bg-white border-b border-slate-200 shrink-0">
          <div className="px-4 py-2 flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={[
                "flex-1 inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1",
                activeTab === 'editor'
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50",
              ].join(' ')}
              aria-pressed={activeTab === 'editor'}
            >
              <FileText size={16} />
              Editor
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={[
                "flex-1 inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1",
                activeTab === 'preview'
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50",
              ].join(' ')}
              aria-pressed={activeTab === 'preview'}
            >
              <Eye size={16} />
              Preview
            </button>
          </div>
        </div>

        {/* Editor Pane */}
        <div
          className={[
            "flex-1 flex flex-col border-slate-200 bg-white min-w-0 min-h-0",
            "md:border-r",
            activeTab === 'preview' ? "hidden md:flex" : "flex",
          ].join(' ')}
        >
          <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 items-center gap-2 text-sm font-medium text-slate-600 shrink-0 hidden md:flex">
            <FileText size={16} />
            Editor
          </div>
          <textarea
            className="flex-1 w-full p-6 resize-none focus:outline-none font-mono text-sm leading-relaxed text-slate-800 bg-transparent overflow-y-auto min-h-0"
            value={markdown}
            onChange={handleMarkdownChange}
            placeholder="Type your markdown here..."
            spellCheck="false"
          />
        </div>

        {/* Preview Pane */}
        <div
          className={[
            "flex-1 flex flex-col bg-white min-w-0 min-h-0",
            activeTab === 'editor' ? "hidden md:flex" : "flex",
          ].join(' ')}
        >
          <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 items-center gap-2 text-sm font-medium text-slate-600 shrink-0 hidden md:flex">
            <Eye size={16} />
            Preview
          </div>
          <div 
            className="flex-1 overflow-y-auto p-6 md:p-8 cursor-text min-h-0"
            onClick={selectPreviewText}
            title="Click to select all text"
          >
            <div 
              ref={previewRef}
              className="prose prose-slate max-w-none prose-headings:font-semibold prose-a:text-indigo-600 hover:prose-a:text-indigo-500 prose-pre:bg-slate-800 prose-pre:text-slate-50"
            >
              <Markdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  code(props) {
                    const {children, className, node, ref, ...rest} = props;
                    const match = /language-(\w+)/.exec(className || '');
                    return match ? (
                      <SyntaxHighlighter
                        {...rest}
                        PreTag="div"
                        children={String(children).replace(/\n$/, '')}
                        language={match[1]}
                        style={vscDarkPlus}
                        className="rounded-md mt-0! mb-0!"
                      />
                    ) : (
                      <code {...rest} ref={ref} className={className}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {markdown}
              </Markdown>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
