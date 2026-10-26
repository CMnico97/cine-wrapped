// Importamos herramientas de React para manejar
// estados y cargar las estadísticas al abrir
// la página.
import { useEffect, useState } from "react";

// Link permite navegar mediante enlaces.
//
// useNavigate permite redirigir al usuario
// al login cuando no existe una sesión.
import { Link, useNavigate } from "react-router-dom";

// Importamos la función que consulta
// GET /usuarios/me/wrapped.
import { obtenerWrapped } from "../services/api";

// Importamos la función que recupera
// el JWT almacenado después del login.
import { obtenerToken } from "../services/auth";

// =====================================================
// PÁGINA CINE WRAPPED
// =====================================================

function CineWrapped() {
  // Guardamos las estadísticas recibidas
  // desde nuestro backend.
  const [wrapped, setWrapped] = useState(null);

  // Controlamos la carga inicial.
  const [cargando, setCargando] = useState(true);

  // Guardamos posibles errores.
  const [error, setError] = useState(null);

  // Utilizamos navigate para realizar
  // redirecciones desde JavaScript.
  const navigate = useNavigate();

  // ===================================================
  // CARGAR CINE WRAPPED
  // ===================================================

  useEffect(() => {
    const cargarWrapped = async () => {
      // Recuperamos el JWT guardado
      // durante el inicio de sesión.
      const token = obtenerToken();

      // Si no existe token, el usuario
      // debe iniciar sesión antes de acceder.
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        // Consultamos las estadísticas
        // calculadas por nuestro backend.
        const datos = await obtenerWrapped(token);

        // El endpoint devuelve las estadísticas
        // dentro de la propiedad "wrapped".
        setWrapped(datos.wrapped);
      } catch (errorPeticion) {
        // Guardamos el mensaje para mostrarlo
        // posteriormente en pantalla.
        setError(errorPeticion.message);
      } finally {
        // Indicamos que terminó la carga.
        setCargando(false);
      }
    };

    cargarWrapped();
  }, [navigate]);

  // ===================================================
  // OBTENER NOMBRE DEL MES
  // ===================================================

  // Nuestro backend devuelve el mes mediante
  // un número entre 1 y 12.
  //
  // Esta función lo transforma, por ejemplo:
  //
  // 10 -> Octubre
  const obtenerNombreMes = (numeroMes) => {
    // Creamos una fecha cualquiera utilizando
    // el número del mes recibido.
    const fecha = new Date(2026, Number(numeroMes) - 1, 1);

    // Convertimos el mes al nombre correspondiente
    // utilizando español de Chile.
    const nombreMes = fecha.toLocaleDateString("es-CL", {
      month: "long",
    });

    // Dejamos la primera letra en mayúscula.
    return nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);
  };

  // ===================================================
  // FORMATEAR DURACIÓN
  // ===================================================

  // Además de mostrar los minutos totales,
  // los convertimos a horas y minutos para que
  // la información sea más fácil de interpretar.
  const formatearDuracion = (minutos) => {
    const totalMinutos = Number(minutos) || 0;

    const horas = Math.floor(totalMinutos / 60);

    const minutosRestantes = totalMinutos % 60;

    return `${horas} h ${minutosRestantes} min`;
  };

  // ===================================================
  // FORMATEAR PRECIOS EN PESOS CHILENOS
  // ===================================================

  // Convertimos los montos recibidos desde MySQL
  // al formato de moneda utilizado en Chile.
  //
  // Ejemplo:
  // 14300 -> $14.300
  const formatearPrecio = (monto) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(Number(monto) || 0);
  };

  // ===================================================
  // FORMATEAR FECHA
  // ===================================================

  const formatearFecha = (fecha) => {
    // Si todavía no existe una fecha,
    // evitamos generar un valor inválido.
    if (!fecha) {
      return "-";
    }

    return new Date(fecha).toLocaleDateString("es-CL");
  };

  // ===================================================
  // ESTADO DE CARGA
  // ===================================================

  if (cargando) {
    return (
      <main className="contenedor">
        <p>Preparando tu Cine Wrapped...</p>
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
  // SIN INFORMACIÓN
  // ===================================================

  // Esta validación evita intentar utilizar
  // propiedades de un objeto inexistente.
  if (!wrapped) {
    return (
      <main className="contenedor">
        <p>No hay estadísticas disponibles.</p>
      </main>
    );
  }

  // ===================================================
  // INTERFAZ
  // ===================================================

  return (
    <main className="contenedor wrapped-pagina">
      {/* =================================================
          PRESENTACIÓN
          ================================================= */}

      <header className="wrapped-hero">
        <p className="etiqueta">Tu historia en el cine</p>

        <h1>Cine Wrapped</h1>

        <p>
          Un resumen de tu actividad basado en las entradas que has confirmado.
        </p>
      </header>

      {/* =================================================
          ESTADÍSTICAS PRINCIPALES
          ================================================= */}

      <section className="wrapped-grid">
        {/* Cantidad de películas vistas. */}
        <article className="wrapped-tarjeta wrapped-destacada">
          <span className="wrapped-numero">{wrapped.peliculasVistas}</span>

          <h2>Películas vistas</h2>

          <p>Entradas confirmadas registradas en tu historial.</p>
        </article>

        {/* Tiempo acumulado en películas. */}
        <article className="wrapped-tarjeta">
          <span className="wrapped-valor">
            {formatearDuracion(wrapped.minutosEnCine)}
          </span>

          <h2>Tiempo en el cine</h2>

          <p>{wrapped.minutosEnCine} minutos acumulados.</p>
        </article>

        {/* Género más visto. */}
        <article className="wrapped-tarjeta">
          <span className="wrapped-valor">{wrapped.generoMasVisto || "-"}</span>

          <h2>Tu género más visto</h2>

          <p>El género que más aparece en tus entradas confirmadas.</p>
        </article>

        {/* Mes con mayor actividad. */}
        <article className="wrapped-tarjeta">
          <span className="wrapped-valor">
            {wrapped.mesMasActivo
              ? obtenerNombreMes(wrapped.mesMasActivo.mes)
              : "-"}
          </span>

          <h2>Tu mes más activo</h2>

          {wrapped.mesMasActivo ? (
            <p>
              {wrapped.mesMasActivo.cantidad} entrada(s) durante{" "}
              {wrapped.mesMasActivo.anio}.
            </p>
          ) : (
            <p>Todavía no existen datos suficientes.</p>
          )}
        </article>
      </section>

      {/* =================================================
          ÚLTIMA PELÍCULA
          ================================================= */}

      <section className="wrapped-ultima">
        <p className="etiqueta">Tu película más reciente</p>

        {wrapped.ultimaPelicula ? (
          <>
            <h2>{wrapped.ultimaPelicula.titulo}</h2>

            <p>
              La viste el{" "}
              <strong>{formatearFecha(wrapped.ultimaPelicula.fecha)}</strong>
              {" a las "}
              <strong>{wrapped.ultimaPelicula.hora?.slice(0, 5)}</strong>.
            </p>
          </>
        ) : (
          <>
            <h2>Tu historia comienza aquí</h2>

            <p>Cuando confirmes una entrada, aparecerá en tu Cine Wrapped.</p>
          </>
        )}
      </section>

      {/* =================================================
    ESTADÍSTICAS DE CONFITERÍA
    ================================================= */}

      <section className="wrapped-confiteria">
        {/* Encabezado de la nueva sección. */}
        <div className="wrapped-confiteria-encabezado">
          <p className="etiqueta">Tus compras favoritas</p>

          <h2>Tu Wrapped de confitería 🍿</h2>

          <p>
            Descubre cuánto has gastado y cuáles son tus productos favoritos de
            Cine Wrapped.
          </p>
        </div>

        {/* ===============================================
      TARJETAS DE ESTADÍSTICAS
      =============================================== */}

        {/* Cuadrícula exclusiva para las estadísticas de confitería. */}
        <div className="wrapped-confiteria-grid">
          {/* Total gastado en compras confirmadas. */}
          <article className="wrapped-tarjeta">
            <span className="wrapped-valor">
              {formatearPrecio(wrapped.confiteria?.totalGastado)}
            </span>

            <h3>Total gastado</h3>

            <p>Dinero acumulado en compras confirmadas de confitería.</p>
          </article>

          {/* Producto más comprado por cantidad de unidades. */}
          <article className="wrapped-tarjeta">
            <span className="wrapped-valor">
              {wrapped.confiteria?.productoFavorito?.nombre || "-"}
            </span>

            <h3>Tu producto favorito</h3>

            {wrapped.confiteria?.productoFavorito ? (
              <p>
                Has comprado {wrapped.confiteria.productoFavorito.cantidad}{" "}
                unidad(es) de este producto.
              </p>
            ) : (
              <p>Todavía no has comprado productos de confitería.</p>
            )}
          </article>

          {/* Cantidad total de compras confirmadas. */}
          <article className="wrapped-tarjeta">
            <span className="wrapped-numero">
              {wrapped.confiteria?.cantidadCompras ?? 0}
            </span>

            <h3>Compras realizadas</h3>

            <p>Cantidad de compras confirmadas registradas en tu historial.</p>
          </article>
        </div>

        {/* Acceso al historial de compras. */}
        <div className="wrapped-confiteria-acciones">
          <Link className="boton" to="/mis-compras-confiteria">
            Ver mis compras
          </Link>

          {/* Botón para navegar al catálogo de confitería. */}
          <Link className="boton" to="/confiteria">
            Ir a confitería
          </Link>
        </div>
      </section>

      {/* =================================================
          NAVEGACIÓN
          ================================================= */}

      <div className="wrapped-acciones">
        <Link className="boton" to="/mis-entradas">
          Ver mis entradas
        </Link>

        <Link className="boton" to="/peliculas">
          Volver a cartelera
        </Link>
      </div>
    </main>
  );
}

export default CineWrapped;
