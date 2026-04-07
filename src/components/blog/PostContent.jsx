import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import styles from './PostContent.module.css'

export default function PostContent({ content }) {
  const editor = useEditor({
    extensions: [StarterKit, Image, Link.configure({ openOnClick: true, autolink: true })],
    content: content ?? '',
    editable: false,
  })
  if (!content) return null
  return <EditorContent editor={editor} className={styles.content} />
}
