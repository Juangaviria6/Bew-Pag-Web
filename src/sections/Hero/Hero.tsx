import { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { SplitText } from "../../components/ui/SplitText/SplitText";
import { PlayShape, CodeIcon, ArrowUpRight } from "../../components/ui/Shapes/Shapes";
import { Magnetic } from "../../components/ui/Magnetic/Magnetic";
import { scrollToHash } from "../../hooks/useSmoothScroll";
import "./Hero.css";

interface HeroProps {
  ready: boolean;
}

export function Hero({ ready }: HeroProps) {
  const ref = useRef<HTMLElement>(null);

  // Luz que sigue al cursor + parallax de la forma 3D
  const px = useMotionValue(0.7);
  const py = useMotionValue(0.4);
  const spotX = useTransform(px, (v) => `${v * 100}%`);
  const spotY = useTransform(py, (v) => `${v * 100}%`);
  const spotlight = useMotionTemplate`radial-gradient(600px circle at ${spotX} ${spotY}, rgb(255 160 100 / 0.45), transparent 60%)`;
  const shapeX = useSpring(useTransform(px, [0, 1], [-50, 50]), { stiffness: 80, damping: 18 });
  const shapeY = useSpring(useTransform(py, [0, 1], [-40, 40]), { stiffness: 80, damping: 18 });
  const tiltX = useSpring(useTransform(py, [0, 1], [18, -18]), { stiffness: 80, damping: 18 });
  const tiltY = useSpring(useTransform(px, [0, 1], [-22, 22]), { stiffness: 80, damping: 18 });

  // Al hacer scroll el hero se "encapsula" en una tarjeta
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const radius = useTransform(scrollYProgress, [0, 0.4], [0, 40]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const shapeRotate = useTransform(scrollYProgress, [0, 1], [0, 90]);

  const onMove = (e: React.PointerEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  };

  return (
    <section id="top" ref={ref} className="hero" onPointerMove={onMove}>
      <motion.div className="hero__card" style={{ scale, borderRadius: radius }}>
        <motion.div className="hero__spot" style={{ background: spotlight }} />
        <div className="hero__grain" />

        <motion.div className="hero__content container" style={{ y: contentY }}>
          <motion.p
            className="hero__eyebrow eyebrow"
            initial={{ opacity: 0 }}
            animate={{ opacity: ready ? 1 : 0 }}
            transition={{ delay: 0.2 }}
          >
            <span>Websites &amp;</span>
            <span>Landing pages</span>
          </motion.p>

          <SplitText
            as="h1"
            className="hero__title"
            play={ready}
            delay={0.15}
            lines={[
              [{ text: "Tu idea" }],
              [{ text: "también" }],
              [{ text: "puede ser" }],
              [{ text: "una " }, { text: "web.", className: "hero__web" }],
            ]}
            after={<span className="hero__caret blink">_</span>}
          />

          <motion.div
            className="hero__shape-wrap"
            style={{ x: shapeX, y: shapeY, rotateX: tiltX, rotateY: tiltY }}
            initial={{ opacity: 0, scale: 0.4, rotate: -40 }}
            animate={ready ? { opacity: 1, scale: 1, rotate: 0 } : {}}
            transition={{ type: "spring", stiffness: 70, damping: 12, delay: 0.5 }}
          >
            <motion.div
              className="hero__shape"
              style={{ rotate: shapeRotate }}
              drag
              dragSnapToOrigin
              dragElastic={0.5}
              whileDrag={{ scale: 1.1 }}
              whileHover={{ scale: 1.05 }}
              data-cursor="Arrástrame"
            >
              <PlayShape className="hero__svg" />
            </motion.div>
          </motion.div>

          <motion.div
            className="hero__bottom"
            initial={{ opacity: 0, y: 30 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.9, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <Magnetic strength={0.5}>
              <button
                type="button"
                className="hero__arrow"
                onClick={() => scrollToHash("#proyectos")}
                aria-label="Ver proyectos"
                data-cursor="Proyectos"
              >
                <ArrowUpRight />
              </button>
            </Magnetic>
            <p className="hero__lead mono">
              Diseñamos páginas web
              <br />
              que convierten.
            </p>
            <button type="button" className="hero__scroll mono" onClick={() => scrollToHash("#ecuacion")}>
              <span className="hero__scroll-line" />
              Scroll
            </button>
            <CodeIcon className="hero__code" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
