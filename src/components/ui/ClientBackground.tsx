"use client";

import dynamic from "next/dynamic";

const InteractiveBackground = dynamic(() => import("./InteractiveBackground"), {
  ssr: false,
});

export default function ClientBackground() {
  return <InteractiveBackground />;
}
