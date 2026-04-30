"use client";

import dynamic from "next/dynamic";

const Scene = dynamic(() => import("./Scene"), {
  ssr: false,
  loading: () => <SceneFallback />,
});

function SceneFallback() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-5">
        <div className="w-10 h-10 rounded-full border border-white/10 border-t-[#6ee7ff] animate-spin" />
        <span className="text-[11px] uppercase tracking-[0.32em] text-[#8b8b95]">
          Calibrating shielding…
        </span>
      </div>
    </div>
  );
}

export default function SceneLoader() {
  return <Scene />;
}
