"use client";

import dynamic from "next/dynamic";

const StoryExperience = dynamic(() => import("./StoryExperience"), {
  ssr: false,
  loading: () => <StoryFallback />,
});

function StoryFallback() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#f6fbfc] text-[#102d3a]">
      <div className="flex flex-col items-center gap-5">
        <div className="h-10 w-10 rounded-full border border-[#d4e8ed] border-t-[#27a5b8] animate-spin" />
        <span className="text-[11px] uppercase tracking-[0.3em] text-[#55727d]">
          Preparing shield
        </span>
      </div>
    </div>
  );
}

export default function ProductStoryLoader() {
  return <StoryExperience />;
}
