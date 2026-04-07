import React, { useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import styles from './TipTapEditor.module.css'

function ToolbarButton({ active, onClick, title, children }) {
  return (
    <button
      type="button"
      className={`${styles.toolBtn} ${active ? styles.toolBtnActive : ''}`}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  )
}

export default function TipTapEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Artikel-Inhalt hier schreiben...' }),
    ],
    content: value ?? '',
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
  })

  const addImage = useCallback(() => {
    const url = window.prompt('Bild-URL eingeben:')
    if (url && editor) editor.chain().focus().setImage({ src: url }).run()
  }, [editor])

  const addLink = useCallback(() => {
    const url = window.prompt('Link-URL eingeben:')
    if (url && editor) editor.chain().focus().setLink({ href: url }).run()
  }, [editor])

  if (!editor) return null

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')} title="Fett">B</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')} title="Kursiv"><em>I</em></ToolbarButton>
        <div className={styles.sep} />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })} title="Überschrift 1">H1</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })} title="Überschrift 2">H2</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })} title="Überschrift 3">H3</ToolbarButton>
        <div className={styles.sep} />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')} title="Zitat">❝</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')} title="Code">{`<>`}</ToolbarButton>
        <div className={styles.sep} />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')} title="Aufzählung">• —</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')} title="Nummerierung">1.</ToolbarButton>
        <div className={styles.sep} />
        <ToolbarButton onClick={addImage} title="Bild">🖼</ToolbarButton>
        <ToolbarButton onClick={addLink} active={editor.isActive('link')} title="Link">🔗</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Trennlinie">—</ToolbarButton>
      </div>
      <EditorContent editor={editor} className={styles.editor} />
    </div>
  )
}
