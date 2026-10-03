import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import type { AiUseCase } from "../../types";
import { NexaLogo } from "../../components/ui/NexaLogo/NexaLogo";
import "./AiChatDemo.css";

interface Message {
  id: number;
  from: "bot" | "user";
  text: string;
}

interface AiChatDemoProps {
  useCase: AiUseCase;
}

/**
 * Simulación de un asistente IA embebido en una web.
 * Se reinicia al cambiar de caso de uso (el padre le pasa `key`).
 */
export function AiChatDemo({ useCase }: AiChatDemoProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.5 });
  const [messages, setMessages] = useState<Message[]>([{ id: 0, from: "bot", text: useCase.greeting }]);
  const [asked, setAsked] = useState<string[]>([]);
  const [typing, setTyping] = useState(false);
  const [stream, setStream] = useState<{ text: string; shown: number } | null>(null);
  const autoPlayed = useRef(false);
  const busy = typing || stream !== null;

  const ask = (question: string) => {
    if (busy) return;
    const exchange = useCase.chat.find((c) => c.question === question);
    if (!exchange) return;
    setAsked((a) => [...a, question]);
    setMessages((m) => [...m, { id: m.length, from: "user", text: question }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setStream({ text: exchange.answer, shown: 0 });
    }, 900);
  };

  // Respuesta "en streaming", carácter a carácter
  useEffect(() => {
    if (!stream) return;
    if (stream.shown >= stream.text.length) {
      const text = stream.text;
      const t = setTimeout(() => {
        setMessages((m) => [...m, { id: m.length, from: "bot", text }]);
        setStream(null);
      }, 0);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStream({ ...stream, shown: stream.shown + 2 }), 18);
    return () => clearTimeout(t);
  }, [stream]);

  // Primera pregunta automática al entrar en pantalla
  useEffect(() => {
    if (!inView || autoPlayed.current) return;
    autoPlayed.current = true;
    const t = setTimeout(() => ask(useCase.chat[0].question), 1100);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  // Mantener el scroll del chat abajo
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing, stream]);

  const pending = useCase.chat.filter((c) => !asked.includes(c.question));

  const reset = () => {
    setMessages([{ id: 0, from: "bot", text: useCase.greeting }]);
    setAsked([]);
  };

  return (
    <div ref={rootRef} className="chat">
      <div className="chat__head">
        <span className="chat__avatar">
          <NexaLogo />
        </span>
        <div>
          <strong>{useCase.assistant}</strong>
          <span className="chat__status">
            <i /> en línea · responde al instante
          </span>
        </div>
        <span className="chat__badge">Nexa AI</span>
      </div>

      <div ref={listRef} className="chat__list" data-lenis-prevent>
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.p
              key={m.id}
              className={`chat__msg chat__msg--${m.from}`}
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {m.text}
            </motion.p>
          ))}
          {stream && (
            <p key="stream" className="chat__msg chat__msg--bot">
              {stream.text.slice(0, stream.shown)}
              <span className="chat__caret" />
            </p>
          )}
          {typing && (
            <motion.p
              key="typing"
              className="chat__msg chat__msg--bot chat__typing"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              aria-label="Escribiendo"
            >
              <span />
              <span />
              <span />
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="chat__chips">
        {pending.length > 0 ? (
          pending.map((c) => (
            <button key={c.question} type="button" disabled={busy} onClick={() => ask(c.question)} data-cursor="Preguntar">
              {c.question}
            </button>
          ))
        ) : (
          <button type="button" className="chat__reset" onClick={reset} data-cursor="Reiniciar">
            ↻ Volver a probar
          </button>
        )}
      </div>
    </div>
  );
}
