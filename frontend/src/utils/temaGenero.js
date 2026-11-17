// =====================================================
// TEMA SEGÚN EL GÉNERO MÁS VISTO
// =====================================================
// Cada género tiene: un título divertido, emojis que
// flotan en la tarjeta y un sonido (ver sonido.js).

const TEMAS = {
  terror: { emojis: ["👻", "🕷️", "💀", "🦇", "🕸️"], insignia: "Cazador de sustos", movimiento: "flota" },
  accion: { emojis: ["💥", "🥊", "🚗", "🔥", "⚡"], insignia: "Héroe de acción", movimiento: "tiembla" },
  comedia: { emojis: ["😂", "🤣", "🎭", "🤡", "😜"], insignia: "Rey de la risa", movimiento: "rebota" },
  drama: { emojis: ["🎭", "🌧️", "🥀", "🕯️", "💔"], insignia: "Alma sensible", movimiento: "flota" },
  scifi: { emojis: ["🚀", "👽", "🛸", "🪐", "✨"], insignia: "Viajero del espacio", movimiento: "gira" },
  romance: { emojis: ["💖", "🌹", "💌", "💞", "✨"], insignia: "Corazón de cine", movimiento: "flota" },
  animacion: { emojis: ["🎨", "⭐", "🌈", "🧸", "✨"], insignia: "Eterno soñador", movimiento: "rebota" },
  aventura: { emojis: ["🧭", "🗺️", "⛰️", "🏴‍☠️", "🌴"], insignia: "Explorador de mundos", movimiento: "gira" },
  suspenso: { emojis: ["🕵️", "🔍", "🗝️", "🌙", "❓"], insignia: "Detective de butaca", movimiento: "flota" },
  fantasia: { emojis: ["🐉", "🧙", "🔮", "🏰", "✨"], insignia: "Mago de la butaca", movimiento: "flota" },
  documental: { emojis: ["🎞️", "🌍", "📚", "🔭", "💡"], insignia: "Mente curiosa", movimiento: "flota" },
  otro: { emojis: ["🍿", "🎬", "🎟️", "⭐", "🎥"], insignia: "Amante del cine", movimiento: "rebota" },
};

// Quita tildes y pasa a minúsculas: "Acción" -> "accion".
const limpiar = (texto) =>
  String(texto || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

export default function obtenerTemaGenero(genero) {
  const t = limpiar(genero);

  let clave = "otro";
  if (/terror|horror|miedo/.test(t)) clave = "terror";
  else if (/accion/.test(t)) clave = "accion";
  else if (/comedia|humor/.test(t)) clave = "comedia";
  else if (/ciencia|ficcion|sci/.test(t)) clave = "scifi";
  else if (/romanc|romant/.test(t)) clave = "romance";
  else if (/animacion|animad|infantil|familia/.test(t)) clave = "animacion";
  else if (/aventura/.test(t)) clave = "aventura";
  else if (/suspenso|thriller|misterio|policia|crimen/.test(t)) clave = "suspenso";
  else if (/fantasia/.test(t)) clave = "fantasia";
  else if (/document/.test(t)) clave = "documental";
  else if (/drama/.test(t)) clave = "drama";

  return { clave, ...TEMAS[clave] };
}
