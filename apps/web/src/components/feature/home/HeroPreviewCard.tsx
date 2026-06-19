"use client";

import { motion } from "framer-motion";
import { Sparkles, FileCheck2 } from "lucide-react";

import { PreviewSurface } from "@/components/feature/document/resume-constructor/ResumePdfPreview";
import { defaultResumeData } from "@/shared/resume-constructor-data";

export const HeroPreviewCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32, rotate: -8 }}
      animate={{ opacity: 1, y: 0, rotate: -3 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
      className="relative mx-auto w-full max-w-sm"
    >
      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="relative"
      >
        <div className="aspect-794/1123 w-full overflow-hidden rounded-xl border border-border bg-card shadow-2xl ring-1 ring-black/5">
          <PreviewSurface
            resume={defaultResumeData}
            template="modern"
            colorScheme="slate"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.85, x: -16 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.9, ease: "easeOut" }}
          className="absolute -top-4 -left-8 hidden items-center gap-2 rounded-xl border border-border bg-popover px-3 py-2 text-xs font-medium text-popover-foreground shadow-lg sm:flex"
        >
          <Sparkles className="size-3.5 text-primary" />
          Rewritten with AI
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.85, x: 16 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 1.1, ease: "easeOut" }}
          className="absolute -right-8 -bottom-6 hidden flex-col gap-0.5 rounded-xl border border-border bg-popover px-3 py-2 text-xs font-medium text-popover-foreground shadow-lg sm:flex"
        >
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <FileCheck2 className="size-3.5 text-emerald-500" />
            ATS score
          </span>
          <span className="text-base font-semibold text-emerald-500">96%</span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
