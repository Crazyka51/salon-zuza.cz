'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { Placeholder } from '@tiptap/extension-placeholder';
import { TextAlign } from '@tiptap/extension-text-align';
import { Highlight } from '@tiptap/extension-highlight';
import { Typography } from '@tiptap/extension-typography';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { TiptapToolbar } from './TiptapToolbar';

interface TiptapEditorProps {
  content: string;
  onChange: (richText: string) => void;
  placeholder?: string;
}

export function TiptapEditor({ 
  content, 
  onChange, 
  placeholder = 'Začněte psát svůj článek...' 
}: TiptapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Color,
      TextStyle,
      Underline,
      Image,
      Placeholder.configure({
        placeholder: placeholder,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight,
      Typography,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[300px] p-4',
      },
    },
  });

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <TiptapToolbar editor={editor} />
      <div className="prose-editor bg-background">
        <EditorContent editor={editor} />
      </div>
      <style jsx global>{`
        .prose-editor .ProseMirror {
          min-height: 300px;
          padding: 1rem;
        }
        .prose-editor .ProseMirror p.is-editor-empty:first-child::before {
          color: #676767;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .prose-editor .ProseMirror:focus {
          outline: none;
        }
        .prose-editor .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: #f7b91c;
        }
        .prose-editor .ProseMirror p {
          margin-bottom: 0.75rem;
          line-height: 1.7;
        }
        .prose-editor .ProseMirror ul,
        .prose-editor .ProseMirror ol {
          padding-left: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .prose-editor .ProseMirror li {
          margin-bottom: 0.25rem;
        }
        .prose-editor .ProseMirror blockquote {
          border-left: 4px solid #f7b91c;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #676767;
        }
        .prose-editor .ProseMirror code {
          background-color: #2e2e2e;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 0.875rem;
        }
        .prose-editor .ProseMirror a {
          color: #f7b91c;
          text-decoration: underline;
        }
        .prose-editor .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
        .prose-editor .ProseMirror mark {
          background-color: rgba(247, 185, 28, 0.3);
          padding: 0.125rem 0;
        }
      `}</style>
    </div>
  );
}
