"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from "react";

import {
  RichText,
  boldExtension,
  codeExtension,
  createEditorSystem,
  historyExtension,
  htmlExtension,
  italicExtension,
  linkExtension,
  listExtension,
  markdownExtension,
  richTextExtension,
  underlineExtension,
} from "@lexkit/editor";

import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

const extensions = [
  richTextExtension.configure({
    placeholder: "Start writing...",
  }),
  boldExtension,
  italicExtension,
  underlineExtension,
  listExtension,
  codeExtension,
  linkExtension,
  historyExtension,
  markdownExtension,
  htmlExtension,
] as const;

const { Provider, useEditor } = createEditorSystem<typeof extensions>();

export type RichTextEditorHandle = {
  getHTML: () => string;
  getMarkdown: () => string;
  setHTML: (html: string) => void;
  setMarkdown: (markdown: string) => void;
};

export type RichTextEditorProps = {
  /** Initial HTML content (takes precedence over markdown if both provided) */
  initialHTML?: string;
  /** Initial Markdown content */
  initialMarkdown?: string;
  className?: string;
};

export const RichTextEditor = React.forwardRef<
  RichTextEditorHandle,
  RichTextEditorProps
>(({ initialHTML, initialMarkdown, className }, ref) => {
  return (
    <Provider extensions={extensions}>
      <EditorBody
        initialHTML={initialHTML}
        initialMarkdown={initialMarkdown}
        className={className}
        ref={ref}
      />
    </Provider>
  );
});

RichTextEditor.displayName = "RichTextEditor";

type EditorBodyProps = RichTextEditorProps;

const EditorBody = React.forwardRef<RichTextEditorHandle, EditorBodyProps>(
  ({ initialHTML, initialMarkdown, className }, ref) => {
    const { commands, activeStates } = useEditor();
    const lastInitialHTML = React.useRef<string | undefined>(undefined);
    const lastInitialMarkdown = React.useRef<string | undefined>(undefined);

    React.useImperativeHandle(
      ref,
      () => ({
        getHTML: () =>
          typeof (commands as any).exportToHTML === "function"
            ? (commands as any).exportToHTML()
            : "",
        getMarkdown: () =>
          typeof (commands as any).exportToMarkdown === "function"
            ? (commands as any).exportToMarkdown()
            : "",
        setHTML: (html: string) => {
          if (typeof (commands as any).importFromHTML === "function") {
            (commands as any).importFromHTML(html, { immediate: true });
          }
        },
        setMarkdown: (markdown: string) => {
          if (typeof (commands as any).importFromMarkdown === "function") {
            (commands as any).importFromMarkdown(markdown, {
              immediate: true,
            });
          }
        },
      }),
      [commands],
    );

    React.useEffect(() => {
      if (initialHTML && initialHTML !== lastInitialHTML.current) {
        lastInitialHTML.current = initialHTML;
        if ((commands as any).importFromHTML) {
          (commands as any).importFromHTML(initialHTML, { immediate: true });
        }
        return;
      }

      if (
        !initialHTML &&
        initialMarkdown &&
        initialMarkdown !== lastInitialMarkdown.current
      ) {
        lastInitialMarkdown.current = initialMarkdown;
        if ((commands as any).importFromMarkdown) {
          (commands as any).importFromMarkdown(initialMarkdown, {
            immediate: true,
          });
        }
      }
    }, [initialHTML, initialMarkdown, commands]);

    return (
      <div
        className={cn(
          "flex flex-col overflow-hidden rounded-md border bg-background",
          className,
        )}
      >
        <EditorToolbar
          onBold={() => (commands as any).toggleBold?.()}
          onItalic={() => (commands as any).toggleItalic?.()}
          onUnderline={() => (commands as any).toggleUnderline?.()}
          onBullet={() => (commands as any).toggleUnorderedList?.()}
          onOrdered={() => (commands as any).toggleOrderedList?.()}
          onUndo={() => (commands as any).undo?.()}
          onRedo={() => (commands as any).redo?.()}
          isBoldActive={!!(activeStates as any).bold}
          isItalicActive={!!(activeStates as any).italic}
          isUnderlineActive={!!(activeStates as any).underline}
          isBulletActive={!!(activeStates as any).unorderedList}
          isOrderedActive={!!(activeStates as any).orderedList}
        />
        <RichText className="min-h-[240px] px-3 py-2" />
      </div>
    );
  },
);

EditorBody.displayName = "EditorBody";

type EditorToolbarProps = {
  onBold: () => void;
  onItalic: () => void;
  onUnderline: () => void;
  onBullet: () => void;
  onOrdered: () => void;
  onUndo: () => void;
  onRedo: () => void;
  isBoldActive: boolean;
  isItalicActive: boolean;
  isUnderlineActive: boolean;
  isBulletActive: boolean;
  isOrderedActive: boolean;
};

function EditorToolbar(props: EditorToolbarProps) {
  const {
    onBold,
    onItalic,
    onUnderline,
    onBullet,
    onOrdered,
    onUndo,
    onRedo,
    isBoldActive,
    isItalicActive,
    isUnderlineActive,
    isBulletActive,
    isOrderedActive,
  } = props;

  return (
    <div className="flex items-center gap-1 border-b bg-muted/40 px-2 py-1">
      <Button
        type="button"
        size="icon"
        variant={isBoldActive ? "default" : "ghost"}
        className="h-8 w-8 text-xs font-semibold"
        onClick={onBold}
      >
        B
      </Button>
      <Button
        type="button"
        size="icon"
        variant={isItalicActive ? "default" : "ghost"}
        className="h-8 w-8 text-xs italic"
        onClick={onItalic}
      >
        I
      </Button>
      <Button
        type="button"
        size="icon"
        variant={isUnderlineActive ? "default" : "ghost"}
        className="h-8 w-8 text-xs underline"
        onClick={onUnderline}
      >
        U
      </Button>

      <div className="mx-1 h-4 w-px bg-border" />

      <Button
        type="button"
        size="icon"
        variant={isBulletActive ? "default" : "ghost"}
        className="h-8 w-8 text-xs"
        onClick={onBullet}
      >
        ••
      </Button>
      <Button
        type="button"
        size="icon"
        variant={isOrderedActive ? "default" : "ghost"}
        className="h-8 w-8 text-xs"
        onClick={onOrdered}
      >
        1.
      </Button>

      <div className="mx-1 h-4 w-px bg-border" />

      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="h-8 w-8 text-xs"
        onClick={onUndo}
      >
        ↺
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="h-8 w-8 text-xs"
        onClick={onRedo}
      >
        ↻
      </Button>
    </div>
  );
}
