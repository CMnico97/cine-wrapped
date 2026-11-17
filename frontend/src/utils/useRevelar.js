import { useEffect } from "react";

// =====================================================
// REVELAR ELEMENTOS AL HACER SCROLL
// =====================================================
// Cada elemento que tenga la clase "revelar" y el atributo
// data-revelar aparece (con animación) cuando entra en la
// pantalla. Así las tarjetas salen una por una.
//
// Uso: useRevelar(true) cuando la página ya tiene sus datos.

export default function useRevelar(listo) {
  useEffect(() => {
    if (!listo) return undefined;

    const elementos = document.querySelectorAll("[data-revelar]");

    // Si el navegador es muy antiguo o el usuario pidió menos
    // movimiento, mostramos todo de una vez.
    const sinAnimacion =
      !("IntersectionObserver" in window) ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (sinAnimacion) {
      elementos.forEach((el) => el.classList.add("visible"));
      return undefined;
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            entrada.target.classList.add("visible");
            observador.unobserve(entrada.target);
          }
        });
      },
      { threshold: 0.15 },
    );

    elementos.forEach((el) => observador.observe(el));

    return () => observador.disconnect();
  }, [listo]);
}
