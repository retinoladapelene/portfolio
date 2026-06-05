"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const InteractiveBackground = dynamic(() => import("./InteractiveBackground"), {
  ssr: false,
});

export default function ClientBackground() {
  const pathname = usePathname();
  
  // Disable the heavy background animation entirely on the main page
  if (pathname === "/") return null;

  return <InteractiveBackground />;
}
