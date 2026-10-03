import type { AiBenefit, AiUseCase } from "../types";

export const nexa = {
  name: "Nexa AI",
  intro:
    "Ayudamos a empresas a *automatizar* sus *procesos* utilizando inteligencia artificial y herramientas avanzadas.",
  pitch: "Eliminamos tareas repetitivas, optimizamos tiempos y aumentamos la productividad de tu negocio.",
};

export const aiBenefits: AiBenefit[] = [
  {
    icon: "repeat",
    title: "Eliminamos tareas repetitivas",
    description: "Tu web responde, agenda y hace seguimiento por ti, sin copiar y pegar.",
  },
  {
    icon: "clock",
    title: "Optimizamos tiempos",
    description: "Atención inmediata 24/7 para tus clientes mientras tu equipo se enfoca en lo importante.",
  },
  {
    icon: "chart",
    title: "Aumentamos la productividad",
    description: "Reportes y datos automáticos para decidir mejor y vender más.",
  },
];

export const aiUseCases: AiUseCase[] = [
  {
    id: "ecommerce",
    label: "Ecommerce",
    summary: "Respuestas a clientes, *seguimiento* de *pedidos*, reporte de ventas.",
    assistant: "Asistente de tu tienda",
    greeting: "¡Hola! 👋 Soy el asistente de la tienda. ¿En qué te ayudo hoy?",
    chat: [
      {
        question: "¿Dónde está mi pedido?",
        answer: "Tu pedido #4821 salió hoy 📦 y llega mañana. Te aviso por WhatsApp cuando esté en camino.",
      },
      {
        question: "¿Tienen envío gratis?",
        answer: "¡Sí! Esta semana el envío es gratis en todo el catálogo. ¿Te ayudo a completar tu carrito? 🛒",
      },
      {
        question: "Resumen de ventas de hoy",
        answer: "📊 Hoy: 38 pedidos y el producto más vendido fue la camiseta básica. Te envié el reporte completo a tu correo.",
      },
    ],
  },
  {
    id: "servicios",
    label: "Servicios",
    summary: "Agenda de *citas*, *recordatorios* automáticos, captación de clientes.",
    assistant: "Asistente de tu consultorio",
    greeting: "¡Hola! Soy el asistente virtual. ¿Quieres agendar o tienes alguna pregunta?",
    chat: [
      {
        question: "Quiero agendar una cita",
        answer: "Claro 📅 Tengo disponible el jueves a las 10:00 o el viernes a las 16:30. ¿Cuál prefieres?",
      },
      {
        question: "¿Cuánto dura la consulta?",
        answer: "La consulta inicial dura 30 minutos y puede ser presencial o virtual. ¿Te reservo un espacio?",
      },
      {
        question: "Recuérdame mi cita",
        answer: "Listo ✅ Te enviaré un recordatorio 24 horas antes por WhatsApp y por correo.",
      },
    ],
  },
  {
    id: "restaurantes",
    label: "Restaurantes",
    summary: "*Reservas*, pedidos a *domicilio*, menú siempre actualizado.",
    assistant: "Asistente del restaurante",
    greeting: "¡Bienvenido! 🍽️ ¿Quieres reservar, ver el menú o pedir a domicilio?",
    chat: [
      {
        question: "¿Tienen mesa para 4 hoy?",
        answer: "¡Sí! Hay mesa disponible a las 20:00. ¿La reservo a tu nombre?",
      },
      {
        question: "¿Cuál es el plato del día?",
        answer: "Hoy tenemos risotto de hongos con parmesano 🍄 ¿Te lo agrego a un pedido?",
      },
      {
        question: "Pedir a domicilio",
        answer: "Perfecto 🛵 Envíame tu dirección y te confirmo el tiempo de entrega al instante.",
      },
    ],
  },
];
