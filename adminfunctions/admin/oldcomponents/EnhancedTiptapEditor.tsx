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
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { useCallback, useEffect, useState } from 'react';
import TiptapToolbar from './TiptapToolbar';
import { clientAuthorizedFetch } from '@/lib/auth-fetch-client';

interface EnhancedTiptapEditorProps {
  content: string
  onChange: (richText: string) => void
  placeholder?: string
  readOnly?: boolean
}

export default function EnhancedTiptapEditor({
  content,
  onChange,
  placeholder = 'Začněte psát obsah...',
  readOnly = false,
}: EnhancedTiptapEditorProps) {
  const [isClient, setIsClient] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-700',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
        allowBase64: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: placeholder,
      }),
      Highlight,
      Typography,
      Color,
      TextStyle,
      Underline,
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full border border-gray-300',
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'border-b border-gray-300',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 p-2',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'bg-gray-100 font-bold border border-gray-300 p-2',
        },
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none p-4 min-h-[200px] focus:outline-none',
      },
      handleDrop: (view, event, slice, moved) => {
        if (readOnly) return false
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0]
          const fileType = file.type
          
          // Kontrola, zda jde o obrázek
          if (fileType.startsWith('image/')) {
            handleImageUpload(file, view)
            return true
          }
        }
        return false // Necháme výchozí zpracování pro ostatní případy
      },
      handlePaste: (view, event) => {
        if (readOnly) return false
        if (event.clipboardData && event.clipboardData.files && event.clipboardData.files[0]) {
          const file = event.clipboardData.files[0]
          const fileType = file.type
          
          // Kontrola, zda jde o obrázek
          if (fileType.startsWith('image/')) {
            handleImageUpload(file, view)
            return true
          }
        }
        return false // Necháme výchozí zpracování pro ostatní případy
      },
    },
    editable: !readOnly,
  })

  const handleImageUpload = async (file: File, view: any) => {
    try {
      setUploadingImage(true)
      
      // Vytvoříme FormData pro upload
      const formData = new FormData()
      formData.append('file', file)
      
      // Uploadujeme soubor na server
      const response = await authorizedFetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error('Upload failed')
      }
      
      const data = await response.json()
      
      if (data.success && data.url) {
        // Vložíme obrázek na aktuální pozici kurzoru
        const { schema } = view.state
        const imageNode = schema.nodes.image.create({ src: data.url, alt: file.name })
        const transaction = view.state.tr.replaceSelectionWith(imageNode)
        view.dispatch(transaction)
      } else {
        throw new Error(data.error || 'Upload failed')
      }
    } catch (error) {
      alert('Nepodařilo se nahrát obrázek. Zkuste to prosím znovu.')
    } finally {
      setUploadingImage(false)
    }
  }

  const addImage = useCallback(() => {
    if (!editor) return
    
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = 'image/*'
    fileInput.onchange = async (event) => {
      const target = event.target as HTMLInputElement
      const file = target.files?.[0]
      
      if (file) {
        try {
          setUploadingImage(true)
          
          // Vytvoříme FormData pro upload
          const formData = new FormData()
          formData.append('file', file)
          
          // Uploadujeme soubor na server
          const response = await clientAuthorizedFetch('/api/admin/media/upload', {
            method: 'POST',
            body: formData,
          })
          
          if (!response.ok) {
            throw new Error('Upload failed')
          }
          
          const data = await response.json()
          
          if (data.success && data.url) {
            editor.chain().focus().setImage({ src: data.url, alt: file.name }).run()
          } else {
            throw new Error(data.error || 'Upload failed')
          }
        } catch (error) {
          alert('Nepodařilo se nahrát obrázek. Zkuste to prosím znovu.')
        } finally {
          setUploadingImage(false)
        }
      }
    }
    
    fileInput.click()
  }, [editor])

  const addImageFromUrl = useCallback(() => {
    if (!editor) return
    const url = prompt('URL obrázku:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  const addYoutubeEmbed = useCallback(() => {
    if (!editor) return
    
    const url = prompt('Vložte URL YouTube videa:')
    if (!url) return
    
    // Extrahování ID videa z URL
    let videoId = ''
    const youtubeRegex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(youtubeRegex)
    
    if (match && match[2].length === 11) {
      videoId = match[2]
    } else {
      alert('Neplatná YouTube URL')
      return
    }
    
    const embedUrl = `https://www.youtube.com/embed/${videoId}`
    
    // Vytvoření HTML pro vložení YouTube
    const embedHtml = `
      <div class="aspect-w-16 aspect-h-9 my-4">
        <iframe 
          src="${embedUrl}" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen
          class="w-full h-full rounded-lg"
        ></iframe>
      </div>
    `
    
    // Vložení HTML do editoru
    editor.chain().focus().insertContent(embedHtml).run()
    
  }, [editor])

  const insertTable = useCallback(() => {
    if (!editor) return
    
    editor.chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run()
  }, [editor])

  // Pokud editor není inicializován nebo jsme na serveru
  if (!editor || !isClient) {
    return <div className="border border-gray-300 rounded-md p-4 min-h-[200px]">Načítání editoru...</div>
  }

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden">
      <TiptapToolbar 
        editor={editor} 
        addImage={addImage}
        addImageFromUrl={addImageFromUrl}
        addYoutubeEmbed={addYoutubeEmbed}
        insertTable={insertTable}
        uploadingImage={uploadingImage}
      />
      <EditorContent editor={editor} className={uploadingImage ? "opacity-70" : ""} />
      {uploadingImage && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  )
}
