"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function DocumentAiLoader({
  mode,
}: {
  mode: "ACCOUNT" | "SCRATCH";
}) {
  const title =
    mode === "ACCOUNT"
      ? "Generating your document"
      : "Generating your draft";

  const description =
    mode === "ACCOUNT"
      ? "The AI is turning your wizard answers into a tailored document."
      : "The AI is turning your brief into a polished first draft.";

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-3xl bg-background/80 px-4 py-10 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-border/60 bg-card/90 shadow-2xl"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_36%),radial-gradient(circle_at_top_right,_rgba(234,179,8,0.14),_transparent_28%),linear-gradient(135deg,rgba(59,130,246,0.06),rgba(16,185,129,0.04))]" />
        <div className="relative p-8 sm:p-10">
          <div className="flex items-start gap-4">
            <div className="relative flex size-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-500">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
              >
                <Sparkles className="size-6" />
              </motion.div>
              <span className="absolute -right-1 -top-1 size-3 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.85)]" />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                AI is working
              </p>
              <h3 className="text-2xl font-semibold tracking-tight">{title}</h3>
              <p className="max-w-lg text-sm text-muted-foreground">
                {description}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              "Reading your form",
              "Shaping the prompt",
              "Writing the draft",
            ].map((label, index) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="rounded-2xl border border-border/60 bg-muted/30 px-4 py-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-full bg-foreground text-background">
                    {index + 1}
                  </span>
                  <span className="font-medium">{label}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              Building your document
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full w-2/3 rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-amber-300"
                animate={{ x: ["-35%", "110%"] }}
                transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
