import { useEffect, useRef, useState } from "react";

// =====================================================
// NÚMERO QUE SUBE CONTANDO (para Cine Wrapped)
// =====================================================
// Empieza a contar cuando el número aparece en pantalla.
//
// Uso:  <NumeroAnimado valor={12} />
//       <NumeroAnimado valor={1440} formato={(n) => `${n} min`} />

function NumeroAnimado({ valor, duracion = 1400, formato }) {
  const [actual, setActual] = useState(0);
  const [visible, setVisible] = useState(false);
  const caja = useRef(null);

  // Esperamos a que el número esté en pantalla.
  useEffect(() => {
    const elemento = caja.current;

    if (!elemento || !("IntersectionObserver" in window)) {
      const cuadro = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(cuadro);
    }

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisible(true);
          observador.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);

  // Contamos desde 0 hasta el valor.
  useEffect(() => {
    if (!visible) return undefined;

    const meta = Number(valor) || 0;

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      const cuadro = requestAnimationFrame(() => setActual(meta));
      return () => cancelAnimationFrame(cuadro);
    }

    let cuadro;
    const inicio = performance.now();

    const paso = (ahora) => {
      const avance = Math.min((ahora - inicio) / duracion, 1);
      const suave = 1 - Math.pow(1 - avance, 3);
      setActual(Math.round(meta * suave));
      if (avance < 1) cuadro = requestAnimationFrame(paso);
    };

    cuadro = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(cuadro);
  }, [valor, duracion, visible]);

  return <span ref={caja}>{formato ? formato(actual) : actual}</span>;
}

export default NumeroAnimado;
