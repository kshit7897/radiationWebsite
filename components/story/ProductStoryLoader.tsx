"use client";

import dynamic from "next/dynamic";

const StoryExperience = dynamic(() => import("./StoryExperience"), {
  ssr: false,
  loading: () => <StoryFallback />,
});

function StoryFallback() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center gap-6">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border border-[color:var(--accent)]/20" />
          <div className="absolute inset-0 rounded-full border-t border-[color:var(--accent)] animate-spin" />
          <div className="absolute inset-3 rounded-full bg-[color:var(--accent)]/15 blur-md" />
        </div>
        <span className="kicker text-[10.5px] uppercase text-[color:var(--muted)] animate-pulse">
          Preparing shield
        </span>
      </div>
    </div>
  );
}

export default function ProductStoryLoader() {
  return <StoryExperience />;
}
