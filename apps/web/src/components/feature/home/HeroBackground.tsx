export const HeroBackground = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--color-border) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse 60% 50% at 50% 0%, black 50%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 50% at 50% 0%, black 50%, transparent 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, var(--color-background) 0%, transparent 35%, transparent 65%, var(--color-background) 100%)",
        }}
      />
    </div>
  );
};
