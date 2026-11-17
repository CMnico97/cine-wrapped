import { useSyncExternalStore } from "react";

import {
  alternarSilencio,
  estaSilenciado,
  suscribirSilencio,
} from "../utils/sonido";

// =====================================================
// BOTÓN PARA SILENCIAR / ACTIVAR SONIDOS
// =====================================================

function BotonSonido() {
  // Se actualiza solo cuando cambia el silencio.
  const silenciado = useSyncExternalStore(suscribirSilencio, estaSilenciado);

  return (
    <button
      type="button"
      className="boton-sonido"
      onClick={alternarSilencio}
      aria-pressed={silenciado}
      aria-label={silenciado ? "Activar sonidos" : "Silenciar sonidos"}
      title={silenciado ? "Activar sonidos" : "Silenciar sonidos"}
    >
      <svg
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
        <path d="M11 5 6 9H3v6h3l5 4V5z" />
        {silenciado ? (
          <>
            <path d="m16 9 5 6" />
            <path d="m21 9-5 6" />
          </>
        ) : (
          <>
            <path d="M15.5 8.5a5 5 0 0 1 0 7" />
            <path d="M18.5 5.5a9 9 0 0 1 0 13" />
          </>
        )}
      </svg>
    </button>
  );
}

export default BotonSonido;
