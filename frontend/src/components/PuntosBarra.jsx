import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { obtenerMisPuntos } from "../services/api";
import { estaAutenticado, obtenerToken } from "../services/auth";

// =====================================================
// BARRA DE PUNTOS (fina y verde)
// =====================================================
// Dos formas de usarla:
//
//   <PuntosBarra />
//     Versión chica para el Navbar. Ella misma consulta
//     el saldo al backend.
//
//   <PuntosBarra variante="resumen" saldo={saldo} />
//   (opcional: titulo="Tus puntos" cambia el texto de la izquierda)
//     Versión más grande para el resumen de compra
//     (asientos y carrito de confitería). Como esas
//     páginas ya conocen el saldo, se lo pasas por "saldo".
//
// "meta" es el número al que apunta la barra (100 por ahora).

function PuntosBarra({
  variante = "nav",
  saldo: saldoRecibido,
  meta = 100,
  titulo,
}) {
  const { pathname } = useLocation();
  const [saldoPropio, setSaldoPropio] = useState(null);
  const [ancho, setAncho] = useState(0);

  // Si la página nos pasa el saldo, usamos ese.
  const saldo = saldoRecibido ?? saldoPropio;

  // Consultamos el saldo (solo si no nos lo pasaron)
  // y lo volvemos a pedir cada vez que cambia la página
  // o cuando alguien avisa que los puntos cambiaron.
  useEffect(() => {
    if (saldoRecibido !== undefined || !estaAutenticado()) return undefined;

    let activo = true;

    const cargar = () => {
      obtenerMisPuntos(obtenerToken())
        .then((puntos) => {
          if (activo) setSaldoPropio(Number(puntos.saldo));
        })
        .catch(() => {
          // Si falla, simplemente no mostramos la barra.
        });
    };

    cargar();
    window.addEventListener("puntos:actualizar", cargar);

    return () => {
      activo = false;
      window.removeEventListener("puntos:actualizar", cargar);
    };
  }, [pathname, saldoRecibido]);

  // La barra "crece" desde 0 hasta su valor con animación.
  const porcentaje =
    saldo === null || saldo === undefined
      ? 0
      : Math.min(100, (saldo / meta) * 100);

  useEffect(() => {
    const cuadro = requestAnimationFrame(() => setAncho(porcentaje));
    return () => cancelAnimationFrame(cuadro);
  }, [porcentaje]);

  if (saldo === null || saldo === undefined) return null;

  return (
    <div className={`puntos-barra puntos-barra-${variante}`}>
      <div className="puntos-barra-cabecera">
        <span>
          {titulo ?? (variante === "nav" ? "Mis puntos" : "Puntos disponibles")}
        </span>
        <span className="puntos-barra-valor">{saldo} pts</span>
      </div>

      <div
        className="puntos-barra-pista"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={meta}
        aria-valuenow={Math.min(saldo, meta)}
        aria-label="Progreso de puntos"
      >
        <div className="puntos-barra-relleno" style={{ width: `${ancho}%` }} />
      </div>
    </div>
  );
}

export default PuntosBarra;
