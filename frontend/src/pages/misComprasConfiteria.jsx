import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// Servicio que consulta las compras en Express.
import { obtenerMisComprasConfiteria } from "../services/api";

// Funciones para comprobar la autenticación.
import { estaAutenticado, obtenerToken } from "../services/auth";

// =====================================================
// HISTORIAL DE COMPRAS DE CONFITERÍA
// =====================================================

function MisComprasConfiteria() {
  const navigate = useNavigate();

  // Almacenamos las compras del usuario.
  const [compras, setCompras] = useState([]);

  // Controlamos carga y errores.
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // ===================================================
  // CARGAR HISTORIAL
  // ===================================================

  useEffect(() => {
    // Si no existe una sesión local, redirigimos al login.
    if (!estaAutenticado()) {
      navigate("/login", { replace: true });
      return;
    }

    let activo = true;

    const cargarCompras = async () => {
      try {
        // Recuperamos el JWT del usuario.
        const token = obtenerToken();

        // Solicitamos las compras al backend.
        const resultado = await obtenerMisComprasConfiteria(token);

        if (activo) {
          setCompras(resultado);
        }
      } catch (errorPeticion) {
        if (!activo) return;

        // Si el token expiró, solicitamos iniciar sesión.
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

    cargarCompras();

    // Evitamos actualizar estados después de desmontar.
    return () => {
      activo = false;
    };
  }, [navigate]);

  // ===================================================
  // FORMATEAR PRECIOS
  // ===================================================

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(Number(precio));
  };

  // ===================================================
  // FORMATEAR FECHAS
  // ===================================================

  const formatearFecha = (fecha) => {
    return new Intl.DateTimeFormat("es-CL", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date(fecha));
  };

  // ===================================================
  // INTERFAZ
  // ===================================================

  return (
    <main className="contenedor">
      <section className="confiteria-encabezado">
        <p className="etiqueta">Cine Wrapped</p>

        <h1>Mis compras de confitería</h1>

        <p>Consulta tus compras simuladas de popcorn y bebidas.</p>
      </section>

      {/* Mensaje mientras se consulta el backend. */}
      {cargando && <p>Cargando tus compras...</p>}

      {/* Mensaje cuando ocurre un error. */}
      {error && (
        <p className="mensaje-error" role="alert">
          {error}
        </p>
      )}

      {/* Mensaje cuando todavía no existen compras. */}
      {!cargando && !error && compras.length === 0 && (
        <section className="confiteria-historial-vacio">
          <h2>Aún no tienes compras de confitería</h2>

          <p>Visita nuestra confitería y agrega tus productos favoritos.</p>

          <Link to="/confiteria" className="boton">
            Ir a confitería
          </Link>
        </section>
      )}

      {/* Mostramos las compras del usuario autenticado. */}
      {!cargando && !error && compras.length > 0 && (
        <section className="confiteria-historial">
          {compras.map((compra) => (
            <article key={compra.id} className="confiteria-historial-tarjeta">
              {/* Encabezado de la compra. */}
              <div className="confiteria-historial-encabezado">
                <div>
                  <h2>Compra #{compra.id}</h2>

                  <p>{formatearFecha(compra.fecha_compra)}</p>
                </div>

                <span className="confiteria-historial-estado">
                  {compra.estado === "confirmada" ? "Confirmada" : "Cancelada"}
                </span>
              </div>

              {/* Productos comprados. */}
              <div className="confiteria-historial-productos">
                {compra.productos.map((producto) => (
                  <div
                    key={producto.producto_id}
                    className="confiteria-historial-producto"
                  >
                    <div>
                      <strong>
                        {producto.categoria === "popcorn" ? "🍿" : "🥤"}{" "}
                        {producto.nombre}
                      </strong>

                      <p>
                        {producto.cantidad} ×{" "}
                        {formatearPrecio(producto.precio_unitario)}
                      </p>
                    </div>

                    <strong>{formatearPrecio(producto.subtotal)}</strong>
                  </div>
                ))}
              </div>

              {/* Total registrado en MySQL. */}

              {/* =================================================
    RESUMEN DE COMPRA Y PUNTOS CINE WRAPPED
    ================================================= */}

              <div className="confiteria-historial-resumen">
                <h3>Resumen de compra</h3>

                {/* Mostramos el precio original de los productos.
      En compras antiguas, subtotal puede ser NULL,
      por lo que utilizamos total como respaldo. */}
                <div className="confiteria-historial-detalle">
                  <span>Subtotal</span>

                  <strong>
                    {formatearPrecio(compra.subtotal ?? compra.total)}
                  </strong>
                </div>

                {/* Puntos utilizados para obtener un descuento. */}
                <div className="confiteria-historial-detalle">
                  <span>Puntos utilizados</span>

                  <strong>{compra.puntos_utilizados ?? 0}</strong>
                </div>

                {/* Descuento aplicado mediante puntos. */}
                <div className="confiteria-historial-detalle">
                  <span>Descuento por puntos</span>

                  <strong>
                    -{formatearPrecio(compra.descuento_puntos ?? 0)}
                  </strong>
                </div>

                {/* Total final confirmado por el backend. */}
                <div className="confiteria-historial-total">
                  <span>Total pagado</span>

                  <strong>{formatearPrecio(compra.total)}</strong>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

export default MisComprasConfiteria;
