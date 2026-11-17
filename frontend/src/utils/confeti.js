// =====================================================
// CONFETI
// =====================================================
// Dibuja confeti sobre toda la pantalla durante unos
// segundos y después se borra solo.

const COLORES = ["#9CC0FF", "#5B8DEF", "#E3C071", "#F1EBDD", "#E58C6C", "#A593E6"];

export function lanzarConfeti(cantidad = 150) {
  // Si el usuario pidió menos animaciones, no hacemos nada.
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

  const lienzo = document.createElement("canvas");
  lienzo.className = "confeti-lienzo";
  lienzo.setAttribute("aria-hidden", "true");
  lienzo.width = window.innerWidth;
  lienzo.height = window.innerHeight;
  document.body.appendChild(lienzo);

  const pincel = lienzo.getContext("2d");

  // Cada pedacito de confeti tiene posición, velocidad y color.
  const piezas = Array.from({ length: cantidad }, () => ({
    x: lienzo.width / 2 + (Math.random() - 0.5) * lienzo.width * 0.3,
    y: lienzo.height * 0.35,
    vx: (Math.random() - 0.5) * 16,
    vy: -Math.random() * 14 - 4,
    giro: Math.random() * Math.PI,
    velGiro: (Math.random() - 0.5) * 0.35,
    ancho: Math.random() * 8 + 5,
    alto: Math.random() * 5 + 3,
    color: COLORES[Math.floor(Math.random() * COLORES.length)],
  }));

  const inicio = performance.now();

  const dibujar = (ahora) => {
    pincel.clearRect(0, 0, lienzo.width, lienzo.height);

    piezas.forEach((p) => {
      p.vy += 0.32; // gravedad
      p.vx *= 0.99; // roce con el aire
      p.x += p.vx;
      p.y += p.vy;
      p.giro += p.velGiro;

      pincel.save();
      pincel.translate(p.x, p.y);
      pincel.rotate(p.giro);
      pincel.fillStyle = p.color;
      pincel.fillRect(-p.ancho / 2, -p.alto / 2, p.ancho, p.alto);
      pincel.restore();
    });

    // Terminamos a los 4,5 segundos.
    if (ahora - inicio < 4500) {
      requestAnimationFrame(dibujar);
    } else {
      lienzo.remove();
    }
  };

  requestAnimationFrame(dibujar);
}
