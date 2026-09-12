"use client"

import React from 'react'
import { type Editor } from '@tiptap/react'
import Color from '@tiptap/extension-color'
import {
  Bold,
  Strikethrough,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Underline,
  Quote,
  Undo,
  Redo,
  Code,
  Link,
  Image as ImageIcon,
  Table,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  Youtube,
  Loader2,
} from 'lucide-react'

type Props = {
  editor: Editor | null;
  addImage?: () => void;
  addImageFromUrl?: () => void;
  addYoutubeEmbed?: () => void;
  insertTable?: () => void;
  uploadingImage?: boolean;
}

const TiptapToolbar = ({ 
  editor, 
  addImage: customAddImage, 
  addImageFromUrl: customAddImageFromUrl, 
  addYoutubeEmbed,
  insertTable: customInsertTable,
  uploadingImage = false
}: Props) => {
  if (!editor) {
    return null
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    if (url === null) {
      return
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const addImage = () => {
    if (customAddImage) {
      customAddImage()
    } else {
      const url = window.prompt('URL obrázku')
      if (url) {
        editor.chain().focus().setImage({ src: url }).run()
      }
    }
  }
  
  const addImageFromUrl = () => {
    if (customAddImageFromUrl) {
      customAddImageFromUrl()
    } else {
      const url = window.prompt('URL obrázku')
      if (url) {
        editor.chain().focus().setImage({ src: url }).run()
      }
    }
  }
  
  const insertTable = () => {
    if (customInsertTable) {
      customInsertTable()
    } else {
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
    }
  }

  return (
    <div className="border border-gray-300 rounded-t-lg p-2 flex flex-wrap items-center gap-2 bg-gray-50">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'is-active' : ''}
      >
        <Bold className="w-5 h-5" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'is-active' : ''}
      >
        <Italic className="w-5 h-5" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        disabled={!editor.can().chain().focus().toggleUnderline().run()}
        className={editor.isActive('underline') ? 'is-active' : ''}
      >
        <Underline className="w-5 h-5" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={editor.isActive('strike') ? 'is-active' : ''}
      >
        <Strikethrough className="w-5 h-5" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
      >
        <Heading2 className="w-5 h-5" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'is-active' : ''}
      >
        <List className="w-5 h-5" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'is-active' : ''}
      >
        <ListOrdered className="w-5 h-5" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive('blockquote') ? 'is-active' : ''}
      >
        <Quote className="w-5 h-5" />
      </button>
      <button onClick={setLink} className={editor.isActive('link') ? 'is-active' : ''}>
        <Link className="w-5 h-5" />
      </button>
      <button 
        onClick={addImage}
        disabled={uploadingImage}
        className="relative"
      >
        {uploadingImage ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <ImageIcon className="w-5 h-5" />
        )}
      </button>
      {addImageFromUrl && (
        <button onClick={addImageFromUrl} disabled={uploadingImage}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-image-down">
            <circle cx="9" cy="9" r="2" />
            <path d="M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10.8" />
            <path d="m21 15-3.1-3.1a2 2 0 0 0-2.814.014L6 21" />
            <path d="M14 19.5h7" />
            <path d="M17.5 16v7" />
          </svg>
        </button>
      )}
      {addYoutubeEmbed && (
        <button onClick={addYoutubeEmbed}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-youtube">
            <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
            <path d="m10 15 5-3-5-3z"/>
          </svg>
        </button>
      )}
      <button
        onClick={insertTable}
      >
        <Table className="w-5 h-5" />
      </button>
      <div className="flex items-center gap-1">
        <input
            type="color"
            onInput={(event) => editor.chain().focus().setColor((event.target as HTMLInputElement).value).run()}
            value={editor.getAttributes('textStyle').color || '#000000'}
            className="w-6 h-6 border-none p-0 bg-transparent"
        />
        <Palette className="w-5 h-5" />
      </div>
       <div className="flex items-center gap-1">
        <input
            type="color"
            onInput={(event) => editor.chain().focus().toggleHighlight().run()}
            value={(editor.getAttributes('highlight').color as string) || '#ffffff'}
            className="w-6 h-6 border-none p-0 bg-transparent"
        />
        <Highlighter className="w-5 h-5" />
      </div>
      <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}>
        <AlignLeft className="w-5 h-5" />
      </button>
      <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}>
        <AlignCenter className="w-5 h-5" />
      </button>
      <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}>
        <AlignRight className="w-5 h-5" />
      </button>
       <button onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={editor.isActive({ textAlign: 'justify' }) ? 'is-active' : ''}>
        <AlignJustify className="w-5 h-5" />
      </button>
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
      >
        <Undo className="w-5 h-5" />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
      >
        <Redo className="w-5 h-5" />
      </button>
    </div>
  )
}

export default TiptapToolbar
