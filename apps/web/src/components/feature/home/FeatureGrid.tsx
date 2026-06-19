import { FileDown, LayoutTemplate, Mail, Sparkles } from "lucide-react";

import { Reveal } from "./Reveal";

const features = [
  {
    icon: Sparkles,
    title: "AI-tailored writing",
    description:
      "Turn your raw experience into sharp, role-specific bullet points and summaries, tuned to the job you're applying for.",
  },
  {
    icon: LayoutTemplate,
    title: "ATS-friendly templates",
    description:
      "Pick from clean, recruiter-approved layouts and color themes built to pass applicant tracking systems.",
  },
  {
    icon: FileDown,
    title: "Pixel-perfect PDF export",
    description:
      "What you see is what you get. Export a polished, print-ready PDF in one click, with no formatting surprises.",
  },
  {
    icon: Mail,
    title: "Matching cover letters",
    description:
      "Generate a cover letter in the same voice and style as your resume, tailored to each application.",
  },
];

export const FeatureGrid = () => {
  return (
    <section
      id="features"
      className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
    >
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Everything you need to apply with confidence
        </h2>
        <p className="mt-4 text-muted-foreground">
          From first draft to final PDF, CV Assistant handles the busywork so
          you can focus on telling your story.
        </p>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, index) => (
          <Reveal
            key={feature.title}
            delay={index * 0.08}
            className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
          >
            <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <feature.icon className="size-5" />
            </div>
            <h3 className="font-semibold">{feature.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {feature.description}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
};
