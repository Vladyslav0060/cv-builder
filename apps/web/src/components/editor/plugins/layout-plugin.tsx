"use client"

import { useEffect, useState } from "react"
import type { LexicalEditor } from "lexical"
import { Columns3Icon } from "lucide-react"

import { INSERT_NEW_TABLE_COMMAND } from "@/components/editor/plugins/table-plugin"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function InsertLayoutDialog({
  activeEditor,
  onClose,
}: {
  activeEditor: LexicalEditor
  onClose: () => void
}) {
  const [columns, setColumns] = useState("2")
  const [isDisabled, setIsDisabled] = useState(true)

  useEffect(() => {
    const count = Number(columns)
    setIsDisabled(!count || count < 2 || count > 6)
  }, [columns])

  const onConfirm = () => {
    activeEditor.dispatchCommand(INSERT_NEW_TABLE_COMMAND, {
      columns,
      rows: "1",
      includeHeaders: false,
    })
    onClose()
  }

  return (
    <>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="layout-columns">Number of columns</Label>
          <Input
            id="layout-columns"
            type="number"
            min={2}
            max={6}
            value={columns}
            onChange={(e) => setColumns(e.target.value)}
            placeholder="2"
          />
        </div>

        <div className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
          This inserts a one-row table that can be used as a simple columns
          layout in the editor.
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button disabled={isDisabled} onClick={onConfirm}>
          Insert layout
        </Button>
      </DialogFooter>
    </>
  )
}

export function LayoutIcon() {
  return <Columns3Icon className="size-4" />
}
