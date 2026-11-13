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
      "Nivel uno. Alcanzar. Va a aparecer un círculo. Lleve la mano hasta él y déjela quieta un momento, hasta que el anillo se llene. No hay prisa.",
    introTouch:
      "Nivel uno. Alcanzar. Va a aparecer un círculo. Toque el círculo y mantenga el dedo encima hasta que el anillo se llene. No hay prisa.",
  },
  {
    kind: "llevar",
    title: "Llevar",
    goal: 4,
    unit: "objetos",
    intro:
      "Nivel dos. Llevar. Ponga la mano sobre la estrella y espere a que la agarre. Luego llévela despacio hasta la canasta y quédese quieto para soltarla.",
    introTouch:
      "Nivel dos. Llevar. Mantenga el dedo sobre la estrella hasta agarrarla. Luego arrástrela despacio hasta la canasta y quédese quieto para soltarla.",
  },
  {
    kind: "seguir",
    title: "Seguir",
    goal: 15,
    unit: "segundos",
    intro:
      "Nivel tres. Seguir. Un círculo se va a mover despacio. Mantenga la mano dentro del círculo y acompáñelo. Si se sale, no pasa nada, solo vuelva.",
    introTouch:
      "Nivel tres. Seguir. Un círculo se va a mover despacio. Mantenga el dedo dentro del círculo y acompáñelo. Si se sale, solo vuelva.",
  },
  {
    kind: "abrir",
    title: "Abrir y cerrar",
    goal: 8,
    unit: "repeticiones",
    intro:
      "Nivel cuatro. Abrir y cerrar. Muestre la mano a la cámara. Ábrala bien grande, estirando los dedos, y luego cierre el puño. Hágalo con calma y con movimientos amplios.",
    introTouch:
      "Nivel cuatro. Alternar. Toque el círculo de la izquierda y luego el de la derecha, uno a la vez, con movimientos amplios y tranquilos.",
  },
];

export const PRAISE = ["¡Muy bien!", "¡Excelente!", "¡Eso es!", "¡Lo está haciendo muy bien!", "¡Perfecto!"];

export const FINISH = "¡Terminó todos los niveles! Excelente trabajo. Descanse un momento y tome agua.";
