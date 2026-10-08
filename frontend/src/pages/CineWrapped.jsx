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
