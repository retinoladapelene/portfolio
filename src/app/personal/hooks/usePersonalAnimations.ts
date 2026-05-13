"use client";

import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function usePersonalAnimations({
  mounted,
  trackRef,
  imageRef,
  activeTheme,
}: {
  mounted: boolean;
  trackRef: React.RefObject<HTMLDivElement | null>;
  imageRef: React.RefObject<HTMLDivElement | null>;
  activeTheme: any;
}) {
  useLayoutEffect(() => {
    if (!mounted || !trackRef.current || !imageRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: trackRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
          fastScrollEnd: true,
        },
      });

      tl.to(
        imageRef.current,
        {
          scale: 0.35,
          x: 0,
          y: 0,
          borderRadius: "48px",
          boxShadow: `0 30px 90px ${activeTheme.primary}4D`,
          force3D: true,
          willChange: "transform",
          ease: "none",
        },
        0
      );

      tl.to("#mask-reveal-layer", { borderRadius: "48px", force3D: true, ease: "power2.inOut" }, 0);

      tl.to(
        ["#reveal-name-back", "#reveal-name-front"],
        { opacity: 1, y: -10, stagger: 0.1, duration: 0.8, ease: "power2.out" },
        0.7
      );

      tl.to("#transition-text", { opacity: 1, y: -20, duration: 0.5, ease: "power2.out" }, 0.8);

      tl.to("#marquee-container", { opacity: 0.1, duration: 0.8, ease: "power2.inOut" }, 0.85);

      tl.to(["#side-label-left", "#side-label-right"], { opacity: 1, duration: 0.8, ease: "power2.out" }, 0.8);

      // Profile section animations
      gsap.fromTo(
        "#profile-section-title",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          scrollTrigger: {
            trigger: "#profile-section",
            start: "top 80%",
            end: "top 20%",
            scrub: 1,
          },
        }
      );

      gsap.fromTo(
        ".stat-card-morph",
        { scale: 0.8, opacity: 0, rotate: -2 },
        {
          scale: 1,
          opacity: 1,
          rotate: 0,
          stagger: 0.1,
          scrollTrigger: {
            trigger: "#profile-section",
            start: "top 60%",
            end: "top 10%",
            scrub: 1,
          },
        }
      );

      // Watermark parallax
      gsap.to(".watermark-morph", {
        y: -100,
        scrollTrigger: {
          trigger: "#skills-section",
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
        },
      });

      gsap.fromTo(
        ".methodology-card-morph",
        { x: 50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          stagger: 0.2,
          scrollTrigger: {
            trigger: ".methodology-trigger",
            start: "top 85%",
            end: "top 30%",
            scrub: 1,
          },
        }
      );

      // Gallery stagger
      gsap.fromTo(
        ".gallery-card-morph",
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.2,
          scrollTrigger: {
            trigger: ".gallery-trigger",
            start: "top 90%",
            end: "top 40%",
            scrub: 1,
          },
        }
      );
    }, trackRef);

    return () => ctx.revert();
  }, [mounted, trackRef, imageRef, activeTheme]);
}
