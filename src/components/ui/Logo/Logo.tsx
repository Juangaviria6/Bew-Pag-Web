import "./Logo.css";

interface LogoProps {
  className?: string;
  blink?: boolean;
}

/** Wordmark "bew_" con guion bajo parpadeante (estilo terminal). */
export function Logo({ className = "", blink = true }: LogoProps) {
  return (
    <span className={`logo ${className}`} aria-label="bew">
      bew<span className={`logo__caret ${blink ? "blink" : ""}`}>_</span>
    </span>
  );
}
