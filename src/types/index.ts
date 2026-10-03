export interface NavLink {
  label: string;
  href: string;
}

export interface Service {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  image: string;
  href?: string;
}

export interface Project {
  src: string;
  alt: string;
  code: string;
  title: string;
  tag: string;
}

export interface Feature {
  title: string;
  description: string;
}

export interface ProcessStep {
  number: string;
  title: string;
  description: string;
}

export type CodeToken = {
  text: string;
  kind?: "tag" | "attr" | "value" | "text" | "punct";
};

export type CodeLine = CodeToken[];

export interface ChatExchange {
  question: string;
  answer: string;
}

export interface AiUseCase {
  id: string;
  label: string;
  /** Texto con palabras resaltadas entre *asteriscos*. */
  summary: string;
  assistant: string;
  greeting: string;
  chat: ChatExchange[];
}

export interface AiBenefit {
  title: string;
  description: string;
  icon: "repeat" | "clock" | "chart";
}

export interface Plan {
  id: string;
  name: string;
  tagline: string;
  audience: string;
  /** Texto de precio. Reemplazar por el valor real, p. ej. "Desde $ 1.690.000". */
  price: string;
  priceNote: string;
  features: string[];
  projectType: string;
  featured?: boolean;
}
