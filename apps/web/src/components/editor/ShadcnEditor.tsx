"use client"

import {
  RichTextEditor,
  type RichTextEditorProps,
} from "./rich-text-editor"

export type ShadcnEditorProps = RichTextEditorProps

export function ShadcnEditor(props: ShadcnEditorProps) {
  return <RichTextEditor {...props} />
}
