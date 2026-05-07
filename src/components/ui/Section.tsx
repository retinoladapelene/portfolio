import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  container?: boolean;
}

const Section = forwardRef<HTMLElement, SectionProps>(
  ({ className, container = true, children, ...props }, ref) => {
    const verticalPadding = className?.includes("py-") ? "" : "py-16";
    return (
      <section
        ref={ref}
        className={cn(verticalPadding, "px-6", className)}
        {...props}
      >
        <div className={cn(container && "max-w-7xl mx-auto")}>
          {children}
        </div>
      </section>
    );
  }
);

Section.displayName = "Section";

export default Section;
