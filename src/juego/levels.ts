/** Definición de los niveles: qué se hace, qué dice la voz y cuántas repeticiones pide. */

export type LevelKind = "alcanzar" | "llevar" | "seguir" | "abrir";

export interface Level {
  kind: LevelKind;
  title: string;
  goal: number;
  /** Unidad del objetivo, para el marcador ("toques", "segundos"...). */
  unit: string;
  /** Lo que dice la voz al empezar (también se muestra como subtítulo). */
  intro: string;
  /** Variante sin cámara cuando la acción es distinta. */
  introTouch?: string;
}

export const LEVELS: Level[] = [
  {
    kind: "alcanzar",
    title: "Alcanzar",
    goal: 5,
    unit: "círculos",
    intro:
      "¡Hola! Qué bueno tenerle aquí. Empecemos suave. Va a aparecer un círculo: lleve la mano hasta él y déjela quietica un momento, hasta que se llene el anillo. Tranquilo, sin afán.",
    introTouch:
      "¡Hola! Qué bueno tenerle aquí. Empecemos suave. Va a aparecer un círculo: tóquelo y deje el dedo encima un momento, hasta que se llene el anillo. Tranquilo, sin afán.",
  },
  {
    kind: "llevar",
    title: "Llevar",
    goal: 4,
    unit: "objetos",
    intro:
      "¡Vamos muy bien! Ahora vamos a llevar cosas. Ponga la mano sobre la estrella y espere a que la agarre. Después llévela despacito hasta la canasta y quédese ahí para soltarla.",
    introTouch:
      "¡Vamos muy bien! Ahora vamos a llevar cosas. Deje el dedo sobre la estrella hasta agarrarla. Después llévela despacito hasta la canasta y quédese ahí para soltarla.",
  },
  {
    kind: "seguir",
    title: "Seguir",
    goal: 15,
    unit: "segundos",
    intro:
      "¡Qué bien lo está haciendo! Ahora un círculo va a pasear despacio. Acompáñelo con la mano, como si bailaran juntos. Si se sale, no pasa nada, vuelva con calma.",
    introTouch:
      "¡Qué bien lo está haciendo! Ahora un círculo va a pasear despacio. Acompáñelo con el dedo, como si bailaran juntos. Si se sale, no pasa nada, vuelva con calma.",
  },
  {
    kind: "abrir",
    title: "Abrir y cerrar",
    goal: 8,
    unit: "repeticiones",
    intro:
      "¡Último nivel, ya casi! Muéstrele la mano a la cámara. Ábrala bien grande, estirando todos los dedos, y luego cierre el puño. Movimientos grandes y con calma. ¡Usted puede!",
    introTouch:
      "¡Último nivel, ya casi! Toque el círculo de la izquierda y luego el de la derecha, uno a la vez. Movimientos grandes y con calma. ¡Usted puede!",
  },
];

export const PRAISE = [
  "¡Muy bien!",
  "¡Eso es!",
  "¡Qué bien lo hace!",
  "¡Excelente, siga así!",
  "¡Bravo!",
  "¡Lo está logrando!",
];

export const LEVEL_DONE = [
  "¡Lo logró! Me encanta cómo lo hizo. Tómese un respiro y, cuando quiera, seguimos.",
  "¡Nivel completado! Estuvo muy bien. Descanse un poquito y seguimos cuando esté listo.",
];

export const FINISH =
  "¡Terminó todos los niveles! Fue un gusto acompañarle. Ahora descanse, tome un poquito de agua, y nos vemos en la próxima.";
