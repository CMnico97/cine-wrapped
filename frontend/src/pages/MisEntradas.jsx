// Importamos herramientas de React para
// manejar estados y cargar información
// cuando se abre la página.
import { useEffect, useState } from "react";

// Link permite navegar mediante enlaces.
//
// useNavigate nos permitirá enviar al usuario
// al login si todavía no inició sesión.
import { Link, useNavigate } from "react-router-dom";

// Importamos la función que consulta
// GET /usuarios/me/entradas.
import { obtenerMisEntradas } from "../services/api";

// Importamos la función que recupera
// el JWT guardado después del login.
import { obtenerToken } from "../services/auth";

// =====================================================
// PÁGINA MIS ENTRADAS
// =====================================================

function MisEntradas() {
  // Guardamos las entradas obtenidas
  // desde nuestro backend.
  const [entradas, setEntradas] = useState([]);

  // Controlamos el estado de carga inicial.
  const [cargando, setCargando] = useState(true);

  // Guardamos posibles errores.
  const [error, setError] = useState(null);

  // Utilizamos navigate para realizar
  // redirecciones desde JavaScript.
  const navigate = useNavigate();

  // ===================================================
  // CARGAR HISTORIAL
  // ===================================================

  useEffect(() => {
    const cargarEntradas = async () => {
      // Recuperamos el JWT almacenado
      // durante el inicio de sesión.
      const token = obtenerToken();

      // Si no existe token, el usuario
      // todavía no ha iniciado sesión.
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        // Consultamos el historial del usuario
        // actualmente autenticado.
        const datos = await obtenerMisEntradas(token);

        // Nuestro backend devuelve las entradas
        // dentro de la propiedad "entradas".
        setEntradas(datos.entradas || []);
      } catch (errorPeticion) {
        // Si el JWT expiró o dejó de ser válido,
        // redirigimos al usuario al login.
        if (errorPeticion.status === 401) {
          navigate("/login", { replace: true });
          return;
        }

        // Para otros errores mostramos el mensaje
        // sin eliminar el historial almacenado.
        setError(errorPeticion.message);
      } finally {
        // Indicamos que terminó la carga.
        setCargando(false);
      }
    };

    cargarEntradas();
  }, [navigate]);

  // ===================================================
  // FORMATEAR FECHA
  // ===================================================

  // Creamos una pequeña función para mostrar
  // las fechas en un formato más amigable.
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-CL");
  };

  // ===================================================
  // FORMATEAR PRECIOS EN PESOS CHILENOS
  // ===================================================

  // Convierte valores como 12000 en $12.000.
  //
  // La utilizaremos para mostrar los montos
  // registrados en las compras simuladas.
  const formatearPrecio = (valor) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(Number(valor));
  };

  // ===================================================
  // ESTADO DE CARGA
  // ===================================================

  if (cargando) {
    return (
      <main className="contenedor">
        <p>Cargando tus entradas...</p>
      </main>
    );
  }

  // ===================================================
  // ESTADO DE ERROR
  // ===================================================

  if (error) {
    return (
      <main className="contenedor">
        <p className="mensaje-error">{error}</p>

        <Link className="boton" to="/peliculas">
          Volver a cartelera
        </Link>
      </main>
    );
  }

  // ===================================================
  // INTERFAZ
  // ===================================================

  return (
    <main className="contenedor">
      {/* Encabezado principal de la página. */}
      <header className="encabezado">
        <p className="etiqueta">Tu historial</p>

        <h1>Mis entradas</h1>

        <p>
          Aquí puedes revisar las películas que has visto y tus entradas
          registradas.
        </p>
      </header>

      {/* =================================================
          SIN ENTRADAS
          ================================================= */}

      {entradas.length === 0 ? (
        <section className="sin-entradas">
          <h2>Todavía no tienes entradas</h2>

          <p>
            Cuando realices una compra simulada, aparecerá automáticamente aquí.
          </p>

          <Link className="boton" to="/peliculas">
            Ver cartelera
          </Link>
        </section>
      ) : (
        /* ===============================================
           LISTA DE ENTRADAS
           =============================================== */

        <section className="lista-entradas">
          {entradas.map((entrada) => (
            <article className="tarjeta-entrada" key={entrada.id}>
              {/* Información principal de
                  la película. */}
              <div className="entrada-encabezado">
                <div>
                  <p className="etiqueta">Entrada #{entrada.id}</p>

                  <h2>{entrada.pelicula?.titulo}</h2>
                </div>

                {/* Mostramos el estado actual
                    de la entrada. */}
                <span className="estado-entrada">{entrada.estado}</span>
              </div>

              {/* Información correspondiente
                  a la función. */}
              <div className="entrada-datos">
                <div>
                  <span>Fecha</span>

                  <strong>{formatearFecha(entrada.funcion?.fecha)}</strong>
                </div>

                <div>
                  <span>Hora</span>

                  <strong>{entrada.funcion?.hora?.slice(0, 5)}</strong>
                </div>

                <div>
                  <span>Sala</span>

                  <strong>{entrada.funcion?.sala}</strong>
                </div>

                <div>
                  <span>Asientos</span>

                  <strong>
                    {entrada.asientos
                      ?.map((asiento) => `${asiento.fila}${asiento.numero}`)
                      .join(", ")}
                  </strong>
                </div>
              </div>

              {/* =================================================
    RESUMEN ECONÓMICO DE LA ENTRADA
    ================================================= */}

              {/* Las entradas antiguas tienen subtotal y total
    en NULL porque se registraron antes de implementar
    el sistema de precios.

    Por eso, solo mostramos montos cuando el backend
    dispone de esa información. */}

              {entrada.subtotal != null && entrada.total != null ? (
                <div className="resumen-precios">
                  <h3>Resumen de compra</h3>

                  {/* Cantidad de entradas compradas. */}
                  <div className="resumen-precio-fila">
                    <span>Cantidad de entradas</span>
                    <strong>{entrada.asientos?.length ?? 0}</strong>
                  </div>

                  {/* Precio original antes del descuento. */}
                  <div className="resumen-precio-fila">
                    <span>Subtotal</span>
                    <strong>{formatearPrecio(entrada.subtotal)}</strong>
                  </div>

                  {/* Descuento aplicado mediante puntos. */}
                  <div className="resumen-precio-fila">
                    <span>Descuento por puntos</span>
                    <strong>
                      -{formatearPrecio(entrada.descuento_puntos ?? 0)}
                    </strong>
                  </div>

                  {/* Puntos canjeados en esta compra. */}
                  <div className="resumen-precio-fila">
                    <span>Puntos utilizados</span>
                    <strong>{entrada.puntos_utilizados ?? 0}</strong>
                  </div>

                  {/* Total final registrado en MySQL. */}
                  <div className="resumen-precio-fila resumen-precio-total">
                    <span>Total pagado</span>
                    <strong>{formatearPrecio(entrada.total)}</strong>
                  </div>
                </div>
              ) : (
                // Mensaje para entradas registradas antes
                // de implementar los precios.
                <div className="entrada-sin-precio">
                  <span>
                    Esta entrada fue registrada antes de implementar el sistema
                    de precios.
                  </span>
                </div>
              )}

              {/* Código único generado por nuestro
                  backend al registrar la entrada. */}
              <div className="codigo-entrada">
                <span>Código de entrada</span>

                <strong>{entrada.codigo}</strong>
              </div>
            </article>
          ))}
        </section>
      )}

      {/* Permitimos acceder al Cine Wrapped
    o regresar a la cartelera. */}
      <div className="acciones-historial">
        <Link className="boton" to="/wrapped">
          Ver mi Cine Wrapped
        </Link>

        <Link className="boton" to="/peliculas">
          Volver a cartelera
        </Link>
      </div>
    </main>
  );
}

export default MisEntradas;
