// =====================================================
// COMPARTIR EL WRAPPED COMO IMAGEN
// =====================================================
// Dibuja una imagen vertical (1080x1350) con el resumen.
// Se descarga directo como "mi-cine-wrapped.png".

const crearImagen = async ({ peliculas, tiempo, mes, genero, insignia, emoji }) => {
  // Esperamos a que carguen las tipografías de la página.
  try {
    await document.fonts.ready;
  } catch {
    // Si falla, se usan las tipografías por defecto.
  }

  const ancho = 1080;
  const alto = 1350;
  const lienzo = document.createElement("canvas");
  lienzo.width = ancho;
  lienzo.height = alto;
  const c = lienzo.getContext("2d");

  // Fondo oscuro con luz azul arriba.
  c.fillStyle = "#060a14";
  c.fillRect(0, 0, ancho, alto);
  const luz = c.createRadialGradient(760, 0, 0, 760, 0, 900);
  luz.addColorStop(0, "rgba(80,130,235,0.35)");
  luz.addColorStop(1, "rgba(80,130,235,0)");
  c.fillStyle = luz;
  c.fillRect(0, 0, ancho, alto);

  const serif = '"Cormorant Garamond", Georgia, serif';
  const sans = '"Nunito", Arial, sans-serif';

  c.textBaseline = "alphabetic";
  c.fillStyle = "#9cc0ff";
  c.font = `800 26px ${sans}`;
  c.fillText("TU HISTORIA EN EL CINE", 80, 130);

  c.fillStyle = "#f1ebdd";
  c.font = `500 130px ${serif}`;
  c.fillText("Cine", 80, 260);
  const anchoCine = c.measureText("Cine ").width;
  c.fillStyle = "#9cc0ff";
  c.font = `italic 500 130px ${serif}`;
  c.fillText("Wrapped", 80 + anchoCine, 260);

  // Tarjetas de colores.
  const tarjeta = (x, y, w, h, color, etiqueta, valor, tamano) => {
    c.fillStyle = color;
    c.beginPath();
    c.roundRect(x, y, w, h, 36);
    c.fill();
    c.fillStyle = "#0b1020";
    c.font = `800 22px ${sans}`;
    c.fillText(etiqueta, x + 36, y + 56);
    c.font = `600 ${tamano}px ${serif}`;
    c.fillText(valor, x + 36, y + h - 40, w - 72);
  };

  tarjeta(80, 330, 440, 320, "#e3c071", "PELÍCULAS VISTAS", String(peliculas), 170);
  tarjeta(560, 330, 440, 320, "#f1ebdd", "TIEMPO EN EL CINE", tiempo, 70);
  tarjeta(80, 690, 440, 240, "#e58c6c", "MES MÁS ACTIVO", mes, 64);
  tarjeta(560, 690, 440, 240, "#a593e6", "GÉNERO FAVORITO", genero, 56);

  // Insignia.
  c.fillStyle = "rgba(14,22,46,0.9)";
  c.strokeStyle = "#3a5390";
  c.lineWidth = 2;
  c.beginPath();
  c.roundRect(80, 980, 920, 180, 36);
  c.fill();
  c.stroke();
  c.font = `80px ${sans}`;
  c.fillText(emoji, 120, 1100);
  c.fillStyle = "#a9b6d4";
  c.font = `800 22px ${sans}`;
  c.fillText("ERES UN", 240, 1050);
  c.fillStyle = "#f1ebdd";
  c.font = `600 66px ${serif}`;
  c.fillText(insignia, 240, 1118, 720);

  c.fillStyle = "#a9b6d4";
  c.font = `700 26px ${sans}`;
  c.fillText("CINE WRAPPED", 80, 1260);

  return new Promise((resolver) => lienzo.toBlob(resolver, "image/png"));
};

// Devuelve "descargado".
export default async function compartirWrapped(datos) {
  const blob = await crearImagen(datos);
  if (!blob) throw new Error("No se pudo crear la imagen.");

  // Descarga directa: el archivo va a la carpeta de descargas del navegador.
  const enlace = document.createElement("a");
  enlace.href = URL.createObjectURL(blob);
  enlace.download = "mi-cine-wrapped.png";
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(enlace.href), 1000);
  return "descargado";
}
