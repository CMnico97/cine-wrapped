import { useEffect, useRef, useState } from "react";

// =====================================================
// SELECTOR DE MES (menú desplegable)
// =====================================================
// Uso:
//   <SelectorMes
//     opciones={[{ valor: "todos", etiqueta: "Todos los meses", cantidad: 5 }, ...]}
//     valor={mesElegido}
//     onChange={setMesElegido}
//   />

function SelectorMes({ opciones, valor, onChange }) {
  const [abierto, setAbierto] = useState(false);
  const raiz = useRef(null);

  // Cerramos el menú al hacer clic afuera o al apretar Escape.
  useEffect(() => {
    if (!abierto) return undefined;

    const alHacerClicAfuera = (evento) => {
      if (raiz.current && !raiz.current.contains(evento.target)) {
        setAbierto(false);
      }
    };

    const alApretarTecla = (evento) => {
      if (evento.key === "Escape") setAbierto(false);
    };

    document.addEventListener("mousedown", alHacerClicAfuera);
    document.addEventListener("keydown", alApretarTecla);

    return () => {
      document.removeEventListener("mousedown", alHacerClicAfuera);
      document.removeEventListener("keydown", alApretarTecla);
    };
  }, [abierto]);

  const actual = opciones.find((opcion) => opcion.valor === valor) ?? opciones[0];

  return (
    <div className="selector-mes" ref={raiz}>
      <button
        type="button"
        className="selector-mes-boton"
        aria-haspopup="listbox"
        aria-expanded={abierto}
        onClick={() => setAbierto(!abierto)}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="3" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>

        <span className="selector-mes-texto">
          <small>Filtrar por mes</small>
          <strong>{actual.etiqueta}</strong>
        </span>

        <svg
          className={abierto ? "selector-mes-flecha girada" : "selector-mes-flecha"}
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {abierto && (
        <ul className="selector-mes-lista" role="listbox">
          {opciones.map((opcion) => {
            const elegida = opcion.valor === actual.valor;

            return (
              <li key={opcion.valor} role="option" aria-selected={elegida}>
                <button
                  type="button"
                  className={
                    elegida ? "selector-mes-opcion elegida" : "selector-mes-opcion"
                  }
                  onClick={() => {
                    onChange(opcion.valor);
                    setAbierto(false);
                  }}
                >
                  <span>{opcion.etiqueta}</span>
                  <span className="selector-mes-cuenta">{opcion.cantidad}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default SelectorMes;
