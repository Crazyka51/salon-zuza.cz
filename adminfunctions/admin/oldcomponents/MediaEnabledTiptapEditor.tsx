'use client'

import { useState, useEffect, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Link } from '@tiptap/extension-link'
import { Image } from '@tiptap/extension-image'
import { Placeholder } from '@tiptap/extension-placeholder'
import { TextAlign } from '@tiptap/extension-text-align'
import { Highlight } from '@tiptap/extension-highlight'
import { Typography } from '@tiptap/extension-typography'
import Color from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import Underline from '@tiptap/extension-underline'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import TiptapToolbar from './TiptapToolbar'
import MediaPickerDialog from './MediaPickerDialog'
import { useToast } from '@/hooks/use-toast'

interface MediaEnabledTiptapEditorProps {
  content: string
  onChange: (richText: string) => void
  placeholder?: string
  readOnly?: boolean
}

export default function MediaEnabledTiptapEditor({
  content,
  onChange,
  placeholder = 'Začněte psát obsah...',
  readOnly = false,
}: MediaEnabledTiptapEditorProps) {
  const [isClient, setIsClient] = useState(false)
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setIsClient(true)
  }, [])

  const editor = useEditor({
    // Nastavíme immediatelyRender na false, aby se předešlo hydratačním chybám při SSR
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        // Vypneme rozšíření ze StarterKitu, která chceme nakonfigurovat samostatně
        link: false,
      }),
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
    },
    editable: !readOnly,
  })

  // Funkce pro vložení obrázku z URL
  const addImageFromUrl = useCallback(() => {
    if (!editor) return
    const url = prompt('URL obrázku:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  // Funkce pro vložení obrázku z Media Manageru
  const addImageFromMedia = useCallback((url: string) => {
    if (!editor) return
    editor.chain().focus().setImage({ src: url }).run()
  }, [editor])

  // Funkce pro vložení YouTube videa
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
      toast({
        title: "Neplatná URL",
        description: "Zadaná URL není platným YouTube odkazem",
        variant: "destructive"
      })
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
    
  }, [editor, toast])

  // Funkce pro vložení tabulky
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
    <div className="border border-gray-300 rounded-md overflow-hidden relative">
      <TiptapToolbar 
        editor={editor} 
        addImage={() => setMediaDialogOpen(true)}
        addImageFromUrl={addImageFromUrl}
        addYoutubeEmbed={addYoutubeEmbed}
        insertTable={insertTable}
        uploadingImage={uploadingImage}
      />
      <EditorContent editor={editor} className={uploadingImage ? "opacity-70" : ""} />
      
      <MediaPickerDialog
        open={mediaDialogOpen}
        onOpenChange={setMediaDialogOpen}
        onSelectMedia={(url) => {
          addImageFromMedia(url)
          setMediaDialogOpen(false)
        }}
        trigger={null}
      />
    </div>
  )
}
