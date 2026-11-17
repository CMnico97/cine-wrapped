// =====================================================
// SONIDOS DE CINE WRAPPED
// =====================================================
// Todos los sonidos se crean con código (Web Audio),
// así que no necesitas archivos de audio.
//
// El navegador solo deja sonar el audio después de que
// el usuario hace un clic. Por eso el sonido se crea
// la primera vez que se usa.

const CLAVE = "cw_silencio";

let contexto = null;
let silencio = false;

// Recordamos si el usuario silenció los sonidos.
try {
  silencio = localStorage.getItem(CLAVE) === "1";
} catch {
  silencio = false;
}

// Lista de funciones que quieren enterarse cuando
// el usuario silencia o activa los sonidos.
const oyentes = new Set();

export const estaSilenciado = () => silencio;

export const suscribirSilencio = (funcion) => {
  oyentes.add(funcion);
  return () => oyentes.delete(funcion);
};

export const alternarSilencio = () => {
  silencio = !silencio;

  try {
    localStorage.setItem(CLAVE, silencio ? "1" : "0");
  } catch {
    // Si el navegador no deja guardar, no pasa nada.
  }

  oyentes.forEach((funcion) => funcion());
  return silencio;
};

// Devuelve el "motor de audio" o null si está silenciado.
const obtenerContexto = () => {
  if (silencio) return null;

  if (!contexto) {
    const Motor = window.AudioContext || window.webkitAudioContext;
    if (!Motor) return null;
    contexto = new Motor();
  }

  if (contexto.state === "suspended") contexto.resume();
  return contexto;
};

// Toca un tono corto. "f" es la frecuencia inicial y
// "f2" la final (si quieres que el tono suba o baje).
const tono = ({ f, f2 = null, dur = 0.08, tipo = "sine", vol = 0.05, espera = 0 }) => {
  const audio = obtenerContexto();
  if (!audio) return;

  const t = audio.currentTime + espera;
  const oscilador = audio.createOscillator();
  const ganancia = audio.createGain();

  oscilador.type = tipo;
  oscilador.frequency.setValueAtTime(f, t);
  if (f2) oscilador.frequency.exponentialRampToValueAtTime(f2, t + dur);

  // El volumen sube y baja rápido para evitar "clics" feos.
  ganancia.gain.setValueAtTime(0.0001, t);
  ganancia.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  ganancia.gain.exponentialRampToValueAtTime(0.0001, t + dur);

  oscilador.connect(ganancia);
  ganancia.connect(audio.destination);
  oscilador.start(t);
  oscilador.stop(t + dur + 0.03);
};

export const sonidos = {
  // Clic normal en botones y enlaces.
  click: () => tono({ f: 700, f2: 520, dur: 0.07, tipo: "triangle", vol: 0.045 }),

  // Un "tic" muy suave al pasar el mouse.
  hover: () => tono({ f: 1400, dur: 0.03, vol: 0.01 }),

  // Al elegir un asiento.
  seleccion: () => tono({ f: 660, f2: 900, dur: 0.09, tipo: "triangle", vol: 0.055 }),

  // Asiento ocupado u otra acción no permitida.
  error: () => tono({ f: 220, f2: 150, dur: 0.18, tipo: "sawtooth", vol: 0.035 }),

  // Compra lista o Wrapped: cuatro notas que suben.
  exito: () =>
    [523, 659, 784, 1047].forEach((f, i) =>
      tono({ f, dur: 0.24, vol: 0.055, espera: i * 0.1 }),
    ),

  // Cuando se bajan las luces de la sala.
  luces: () => {
    tono({ f: 260, f2: 70, dur: 1, tipo: "sine", vol: 0.06 });
    tono({ f: 520, f2: 140, dur: 1, tipo: "triangle", vol: 0.02 });
  },

  // Sonido según el género más visto (se toca en el Wrapped).
  genero: (clave) => {
    switch (clave) {
      case "terror":
        // Un retumbar grave y dos chillidos que desafinan.
        tono({ f: 90, f2: 45, dur: 1.2, tipo: "sawtooth", vol: 0.05 });
        tono({ f: 1800, f2: 1500, dur: 0.5, vol: 0.015, espera: 0.3 });
        tono({ f: 1700, f2: 1400, dur: 0.5, vol: 0.015, espera: 0.35 });
        break;
      case "accion":
        // Tres golpes seguidos y un "whoosh".
        [0, 0.14, 0.28].forEach((espera) =>
          tono({ f: 160, f2: 50, dur: 0.16, tipo: "square", vol: 0.05, espera }),
        );
        tono({ f: 900, f2: 200, dur: 0.2, tipo: "sawtooth", vol: 0.02, espera: 0.42 });
        break;
      case "comedia":
        // Notas saltarinas.
        [523, 659, 523, 784].forEach((f, i) =>
          tono({ f, dur: 0.12, tipo: "triangle", vol: 0.05, espera: i * 0.11 }),
        );
        break;
      case "drama":
        // Dos notas lentas y tristes.
        tono({ f: 392, dur: 0.7, vol: 0.05 });
        tono({ f: 311, dur: 1, vol: 0.05, espera: 0.4 });
        break;
      case "scifi":
        // Un rayo láser y dos pitidos.
        tono({ f: 1400, f2: 200, dur: 0.5, tipo: "sawtooth", vol: 0.025 });
        tono({ f: 800, dur: 0.12, vol: 0.04, espera: 0.55 });
        tono({ f: 1200, dur: 0.12, vol: 0.04, espera: 0.7 });
        break;
      case "romance":
        // Un acorde suave.
        [523, 659, 784].forEach((f, i) =>
          tono({ f, dur: 1.1, vol: 0.035, espera: i * 0.06 }),
        );
        break;
      case "animacion":
        // Brillitos que suben.
        [1047, 1319, 1568, 2093].forEach((f, i) =>
          tono({ f, dur: 0.2, vol: 0.035, espera: i * 0.08 }),
        );
        break;
      case "aventura":
        // Una pequeña fanfarria.
        [392, 523, 659, 784].forEach((f, i) =>
          tono({ f, dur: 0.22, tipo: "triangle", vol: 0.05, espera: i * 0.12 }),
        );
        tono({ f: 784, dur: 0.6, tipo: "triangle", vol: 0.05, espera: 0.5 });
        break;
      case "suspenso":
        // Latidos del corazón.
        [0, 0.18, 0.8, 0.98].forEach((espera) =>
          tono({ f: 70, f2: 45, dur: 0.12, vol: 0.08, espera }),
        );
        break;
      case "fantasia":
        // Arpa mágica.
        [523, 659, 784, 988, 1175, 1568].forEach((f, i) =>
          tono({ f, dur: 0.35, vol: 0.03, espera: i * 0.09 }),
        );
        break;
      default:
        sonidos.exito();
    }
  },
};
