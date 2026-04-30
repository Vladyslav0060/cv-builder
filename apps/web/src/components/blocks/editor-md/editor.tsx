"use client";

import dynamic from "next/dynamic";
import {
  CHECK_LIST,
  ELEMENT_TRANSFORMERS,
  MULTILINE_ELEMENT_TRANSFORMERS,
  TEXT_FORMAT_TRANSFORMERS,
  TEXT_MATCH_TRANSFORMERS,
  $convertFromMarkdownString,
} from "@lexical/markdown";
import {
  InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { EditorState, SerializedEditorState } from "lexical";

import { editorTheme } from "@/components/editor/themes/editor-theme";
import { HR } from "@/components/editor/transformers/markdown-hr-transformer";
import { IMAGE } from "@/components/editor/transformers/markdown-image-transformer";
import { TABLE } from "@/components/editor/transformers/markdown-table-transformer";
import { TooltipProvider } from "@/components/ui/tooltip";

import { nodes } from "./nodes";
import { Plugins } from "./plugins";
type EditorProps = {
  editorState?: EditorState;
  editorSerializedState?: SerializedEditorState;
  initialMarkdown?: string;
  onChange?: (editorState: EditorState) => void;
  onSerializedChange?: (editorSerializedState: SerializedEditorState) => void;
};

const markdownTransformers = [
  TABLE,
  HR,
  IMAGE,
  CHECK_LIST,
  ...ELEMENT_TRANSFORMERS,
  ...MULTILINE_ELEMENT_TRANSFORMERS,
  ...TEXT_FORMAT_TRANSFORMERS,
  ...TEXT_MATCH_TRANSFORMERS,
];

const editorConfig: InitialConfigType = {
  namespace: "Editor",
  theme: editorTheme,
  nodes,
  onError: (error: Error) => {
    console.error(error);
  },
};

function EditorContent({
  editorState,
  editorSerializedState,
  initialMarkdown,
  onChange,
  onSerializedChange,
}: EditorProps) {
  const initialConfig: InitialConfigType = {
    ...editorConfig,
    ...(editorState ? { editorState } : {}),
    ...(editorSerializedState
      ? { editorState: JSON.stringify(editorSerializedState) }
      : {}),
    ...(initialMarkdown
      ? {
          editorState: () => {
            $convertFromMarkdownString(initialMarkdown, markdownTransformers);
          },
        }
      : {}),
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <TooltipProvider>
        <Plugins />

        <OnChangePlugin
          ignoreSelectionChange={true}
          onChange={(editorState) => {
            onChange?.(editorState);
            onSerializedChange?.(editorState.toJSON());
          }}
        />
      </TooltipProvider>
    </LexicalComposer>
  );
}

const EditorClient = dynamic(() => Promise.resolve(EditorContent), {
  ssr: false,
  loading: () => <div aria-hidden="true" className="min-h-72 bg-background" />,
});

export function Editor(props: EditorProps) {
  return (
    <div className="bg-background overflow-hidden rounded-lg border shadow">
      <EditorClient {...props} />
    </div>
  );
}
