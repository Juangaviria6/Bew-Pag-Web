import type { ReactNode } from "react";
import { motion } from "motion/react";

interface Segment {
  text: string;
  className?: string;
}

interface SplitTextProps {
  /** Cada línea es un array de segmentos (permite resaltar palabras). */
  lines: Segment[][];
  delay?: number;
  stagger?: number;
  className?: string;
  as?: "h1" | "h2" | "p";
  after?: ReactNode;
  once?: boolean;
  /** Si se define, controla la animación manualmente en vez de usar el viewport. */
  play?: boolean;
}

/** Revela el texto palabra por palabra, desde abajo, con máscara. */
export function SplitText({
  lines,
  delay = 0,
  stagger = 0.06,
  className,
  as = "h2",
  after,
  once = true,
  play,
}: SplitTextProps) {
  const Tag = motion[as];
  let index = 0;
  const trigger =
    play === undefined
      ? { whileInView: "visible", viewport: { once, amount: 0.4 } }
      : { animate: play ? "visible" : "hidden" };

  return (
    <Tag
      className={className}
      initial="hidden"
      {...trigger}
      aria-label={lines.map((l) => l.map((s) => s.text).join("")).join(" ")}
    >
      {lines.map((line, li) => (
        <span key={li} style={{ display: "block" }} aria-hidden="true">
          {line.map((seg, si) =>
            seg.text.split(/(\s+)/).map((word, wi) => {
              if (/^\s+$/.test(word)) return word;
              if (!word) return null;
              const i = index++;
              return (
                <span
                  key={`${si}-${wi}`}
                  style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", paddingBottom: "0.08em", marginBottom: "-0.08em" }}
                >
                  <motion.span
                    className={seg.className}
                    style={{ display: "inline-block" }}
                    variants={{
                      hidden: { y: "110%", rotate: 4 },
                      visible: {
                        y: "0%",
                        rotate: 0,
                        transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: delay + i * stagger },
                      },
                    }}
                  >
                    {word}
                  </motion.span>
                </span>
              );
            }),
          )}
          {li === lines.length - 1 && after}
        </span>
      ))}
    </Tag>
  );
}
