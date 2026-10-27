import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// Importamos las consultas del sistema de puntos.
import { obtenerMisPuntos, obtenerMovimientosPuntos } from "../services/api";

// Recuperamos el JWT del usuario autenticado.
import { obtenerToken } from "../services/auth";

// =====================================================
// PÁGINA MIS PUNTOS CINE WRAPPED
// =====================================================

function MisPuntos() {
  const navigate = useNavigate();

  // Saldo actual del usuario.
  const [saldo, setSaldo] = useState(0);

  // Historial de acumulaciones y canjes.
  const [movimientos, setMovimientos] = useState([]);

  // Controlamos carga y errores.
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // =====================================================
  // CARGAR SALDO E HISTORIAL
  // =====================================================

  useEffect(() => {
    // Recuperamos el JWT guardado al iniciar sesión.
    const token = obtenerToken();

    // Si no hay sesión, redirigimos al login.
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    // Evitamos actualizar estados si se desmonta
    // el componente mientras cargan los datos.
    let activo = true;

    const cargarPuntos = async () => {
      try {
        // Consultamos el saldo y los movimientos.
        const [datosPuntos, datosMovimientos] = await Promise.all([
          obtenerMisPuntos(token),
          obtenerMovimientosPuntos(token),
        ]);

        if (!activo) return;

        // Guardamos el saldo real de MySQL.
        setSaldo(Number(datosPuntos.saldo));

        // Guardamos el historial recibido.
        setMovimientos(datosMovimientos);
      } catch (errorPeticion) {
        if (!activo) return;

        // Si el JWT expiró, solicitamos iniciar sesión.
        if (errorPeticion.status === 401) {
          navigate("/login", { replace: true });
          return;
        }

        setError(errorPeticion.message);
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    };

    cargarPuntos();

    return () => {
      activo = false;
    };
  }, [navigate]);

  // =====================================================
  // FORMATEAR FECHA
  // =====================================================

  const formatearFecha = (fecha) => {
    return new Intl.DateTimeFormat("es-CL", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(fecha));
  };

  // =====================================================
  // IDENTIFICAR ORIGEN DEL MOVIMIENTO
  // =====================================================

  const obtenerNombreOrigen = (origen) => {
    if (origen === "entrada") {
      return "Entrada de cine";
    }

    if (origen === "confiteria") {
      return "Compra de confitería";
    }

    return "Compra";
  };

  // =====================================================
  // INTERFAZ
  // =====================================================

  return (
    <main className="contenedor">
      <header className="encabezado">
        <p className="etiqueta">Tu programa de recompensas</p>

        <h1>Mis puntos Cine Wrapped</h1>

        <p>
          Consulta tus puntos disponibles y revisa cuándo los ganaste o
          utilizaste.
        </p>
      </header>

      {/* Mostramos un mensaje durante la carga. */}
      {cargando && <p>Cargando tus puntos...</p>}

      {/* Mostramos errores de consulta. */}
      {error && (
        <p className="mensaje-error" role="alert">
          {error}
        </p>
      )}

      {!cargando && !error && (
        <>
          {/* ============================================
              TARJETA DEL SALDO DISPONIBLE
              ============================================ */}

          <section className="mis-puntos-saldo">
            <p className="etiqueta">Saldo disponible</p>

            <h2>{saldo} puntos</h2>

            <p>
              Cada punto equivale a $10 de descuento. Puedes utilizar hasta el
              50% del valor de tus compras.
            </p>

            <p>
              Acumulas 1 punto por cada $100 pagados en entradas y confitería.
            </p>
          </section>

          {/* ============================================
              HISTORIAL DE MOVIMIENTOS
              ============================================ */}

          <section className="mis-puntos-historial">
            <h2>Historial de movimientos</h2>

            {movimientos.length === 0 ? (
              // Mensaje cuando todavía no existen movimientos.
              <div className="mis-puntos-vacio">
                <p>
                  Todavía no tienes movimientos de puntos. Realiza una compra
                  para comenzar a acumular.
                </p>

                <Link to="/peliculas" className="boton">
                  Ver cartelera
                </Link>
              </div>
            ) : (
              // Mostramos los movimientos registrados en MySQL.
              <div className="mis-puntos-lista">
                {movimientos.map((movimiento) => {
                  // Identificamos si se ganaron o canjearon puntos.
                  const esAcumulacion = movimiento.tipo === "acumulacion";

                  return (
                    <article
                      key={movimiento.id}
                      className="mis-puntos-movimiento"
                    >
                      <div className="mis-puntos-movimiento-info">
                        {/* Mostramos el origen de la compra. */}
                        <h3>
                          {movimiento.origen === "entrada" ? "🎟️" : "🍿"}{" "}
                          {obtenerNombreOrigen(movimiento.origen)}
                          {" #"}
                          {movimiento.compra_id}
                        </h3>

                        {/* Tipo de movimiento. */}
                        <p>
                          {esAcumulacion
                            ? "Puntos ganados"
                            : "Puntos utilizados"}
                        </p>

                        {/* Fecha registrada en MySQL. */}
                        <small>
                          {formatearFecha(movimiento.fecha_movimiento)}
                        </small>
                      </div>

                      {/* Puntos positivos o negativos. */}
                      <strong
                        className={
                          esAcumulacion
                            ? "mis-puntos-positivo"
                            : "mis-puntos-negativo"
                        }
                      >
                        {esAcumulacion ? "+" : "-"}
                        {movimiento.puntos}
                      </strong>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}

export default MisPuntos;
