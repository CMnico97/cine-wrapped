// Importamos herramientas de React para manejar
// estados y cargar las estadísticas al abrir
// la página.
import { useEffect, useRef, useState } from "react";

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

// NUEVO: números que suben contando y
// tarjetas que aparecen una por una.
import NumeroAnimado from "../components/NumeroAnimado";
import useRevelar from "../utils/useRevelar";

// NUEVO: sonido y visual según el género, y compartir.
import obtenerTemaGenero from "../utils/temaGenero";
import compartirWrapped from "../utils/compartirWrapped";
import { sonidos } from "../utils/sonido";

// Dirección del backend donde se almacenan las imágenes.
const API_URL = "http://localhost:3000";

// Convierte la ruta guardada en MySQL
// en una dirección que el navegador pueda cargar.
const obtenerUrlPoster = (poster) => {
  // Si no existe una portada, no devolvemos ninguna ruta.
  if (!poster) return "";

  // Si ya es una URL completa, la utilizamos directamente.
  if (poster.startsWith("http")) return poster;

  // Si es una ruta del backend, agregamos la dirección del servidor.
  return `${API_URL}${poster}`;
};

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

  const navigate = useNavigate();

  // NUEVO: tarjeta del género y mensaje del botón compartir.
  const tarjetaGenero = useRef(null);
  const [mensajeCompartir, setMensajeCompartir] = useState("");

  const tema = obtenerTemaGenero(wrapped?.generoMasVisto);

  // NUEVO: el sonido del género suena una vez, cuando
  // la tarjeta aparece en pantalla.
  useEffect(() => {
    const tarjeta = tarjetaGenero.current;
    if (!tarjeta || !wrapped?.generoMasVisto) return undefined;

    const claveTema = obtenerTemaGenero(wrapped.generoMasVisto).clave;
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          sonidos.genero(claveTema);
          observador.disconnect();
        }
      },
      { threshold: 0.7 },
    );

    observador.observe(tarjeta);
    return () => observador.disconnect();
  }, [wrapped]);

  // NUEVO: cuando ya hay datos, las tarjetas
  // empiezan a aparecer una por una.
  useRevelar(!cargando && Boolean(wrapped));

  // ===================================================
  // CARGAR CINE WRAPPED
  // ===================================================

  useEffect(() => {
    const cargarWrapped = async () => {
      const token = obtenerToken();

      // Si no existe token, el usuario
      // debe iniciar sesión antes de acceder.
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const datos = await obtenerWrapped(token);

        // El endpoint devuelve las estadísticas
        // dentro de la propiedad "wrapped".
        setWrapped(datos.wrapped);
      } catch (errorPeticion) {
        setError(errorPeticion.message);
      } finally {
        setCargando(false);
      }
    };

    cargarWrapped();
  }, [navigate]);

  // ===================================================
  // OBTENER NOMBRE DEL MES
  // ===================================================

  // 10 -> Octubre
  const obtenerNombreMes = (numeroMes) => {
    const fecha = new Date(2026, Number(numeroMes) - 1, 1);

    const nombreMes = fecha.toLocaleDateString("es-CL", {
      month: "long",
    });

    return nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);
  };

  // ===================================================
  // FORMATEAR DURACIÓN
  // ===================================================

  const formatearDuracion = (minutos) => {
    const totalMinutos = Number(minutos) || 0;

    const horas = Math.floor(totalMinutos / 60);

    const minutosRestantes = totalMinutos % 60;

    return `${horas} h ${minutosRestantes} min`;
  };

  // ===================================================
  // FORMATEAR PRECIOS EN PESOS CHILENOS
  // ===================================================

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
    if (!fecha) {
      return "-";
    }

    return new Date(fecha).toLocaleDateString("es-CL");
  };

  // ===================================================
  // COMPARTIR COMO IMAGEN
  // ===================================================

  const manejarCompartir = async () => {
    setMensajeCompartir("Creando tu imagen...");

    try {
      const resultado = await compartirWrapped({
        peliculas: wrapped.peliculasVistas ?? 0,
        tiempo: formatearDuracion(wrapped.minutosEnCine),
        mes: wrapped.mesMasActivo
          ? obtenerNombreMes(wrapped.mesMasActivo.mes)
          : "-",
        genero: wrapped.generoMasVisto || "-",
        insignia: tema.insignia,
        emoji: tema.emojis[0],
      });

      setMensajeCompartir(
        resultado === "descargado"
          ? "¡Listo! Tu imagen se descargó."
          : resultado === "compartido"
            ? "¡Compartido!"
            : "",
      );
    } catch {
      setMensajeCompartir("No pudimos crear la imagen. Intenta de nuevo.");
    }
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

        <h1>
          Cine <em>Wrapped</em>
        </h1>

        <p>
          Un resumen de tu actividad basado en las entradas que has confirmado.
        </p>

        {/* NUEVO: frase de apertura. */}
        <p className="wrapped-frase">
          {Number(wrapped.peliculasVistas) > 0 ? (
            <>
              Hasta ahora pasaste{" "}
              <strong>{formatearDuracion(wrapped.minutosEnCine)}</strong> en la
              sala y viste <strong>{wrapped.peliculasVistas}</strong>{" "}
              {Number(wrapped.peliculasVistas) === 1 ? "película" : "películas"}
              .
            </>
          ) : (
            <>Tu historia en el cine está por comenzar.</>
          )}
        </p>
      </header>

      {/* =================================================
          ESTADÍSTICAS PRINCIPALES
          Las tarjetas salen una por una (--retraso).
          ================================================= */}

      <section className="wrapped-grid">
        {/* Cantidad de películas vistas. */}
        <article
          className="wrapped-tarjeta wrapped-destacada revelar"
          data-revelar
          style={{ "--retraso": "0.1s" }}
        >
          <span className="wrapped-numero">
            <NumeroAnimado valor={wrapped.peliculasVistas} />
          </span>

          <h2>Películas vistas</h2>

          <p>Entradas confirmadas registradas en tu historial.</p>
        </article>

        {/* Tiempo acumulado en películas. */}
        <article
          className="wrapped-tarjeta revelar"
          data-revelar
          style={{ "--retraso": "0.35s" }}
        >
          <span className="wrapped-valor">
            <NumeroAnimado
              valor={wrapped.minutosEnCine}
              formato={formatearDuracion}
            />
          </span>

          <h2>Tiempo en el cine</h2>

          <p>{wrapped.minutosEnCine} minutos acumulados.</p>
        </article>

        {/* Mes con mayor actividad. */}
        <article
          className="wrapped-tarjeta revelar"
          data-revelar
          style={{ "--retraso": "0.6s" }}
        >
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
        {/* Género más visto (ahora al final, con visual y sonido). */}
        <article
          ref={tarjetaGenero}
          className={`wrapped-tarjeta wrapped-genero genero-${tema.clave} mov-${tema.movimiento} revelar`}
          data-revelar
          style={{ "--retraso": "0.85s" }}
          onClick={() => sonidos.genero(tema.clave)}
          title="Haz clic para volver a escuchar"
        >
          <div className="genero-flota" aria-hidden="true">
            {tema.emojis.map((emoji, i) => (
              <span key={i} style={{ "--i": i }}>
                {emoji}
              </span>
            ))}
          </div>

          <span className="wrapped-valor">{wrapped.generoMasVisto || "-"}</span>

          <h2>Tu género más visto</h2>

          <p className="wrapped-insignia">
            {tema.emojis[0]} Eres un <strong>{tema.insignia}</strong>
          </p>
        </article>
      </section>

      {/* =================================================
          ÚLTIMA PELÍCULA (con su póster)
          ================================================= */}

      <section className="wrapped-ultima revelar" data-revelar>
        {wrapped.ultimaPelicula ? (
          <>
            {/* Póster de la película. Si no tiene imagen,
                mostramos el mismo fondo de la cartelera. */}
            <Link
              className="wrapped-ultima-poster"
              to={`/peliculas/${wrapped.ultimaPelicula.id}`}
              aria-label={`Ver ${wrapped.ultimaPelicula.titulo}`}
            >
              {wrapped.ultimaPelicula.poster ? (
                <img
                  // Obtenemos la dirección completa de la portada.
                  src={obtenerUrlPoster(wrapped.ultimaPelicula.poster)}
                  alt={`Póster de ${wrapped.ultimaPelicula.titulo}`}
                />
              ) : (
                <span>SIN PÓSTER</span>
              )}
            </Link>

            <div className="wrapped-ultima-info">
              <p className="etiqueta">Tu película más reciente</p>

              <h2>{wrapped.ultimaPelicula.titulo}</h2>

              <p>
                La viste el{" "}
                <strong>{formatearFecha(wrapped.ultimaPelicula.fecha)}</strong>
                {" a las "}
                <strong>{wrapped.ultimaPelicula.hora?.slice(0, 5)}</strong>.
              </p>

              <Link
                className="boton boton-secundario"
                to={`/peliculas/${wrapped.ultimaPelicula.id}`}
              >
                Ver película
              </Link>
            </div>
          </>
        ) : (
          <div className="wrapped-ultima-info">
            <p className="etiqueta">Tu película más reciente</p>

            <h2>Tu historia comienza aquí</h2>

            <p>Cuando confirmes una entrada, aparecerá en tu Cine Wrapped.</p>
          </div>
        )}
      </section>

      {/* =================================================
          ESTADÍSTICAS DE CONFITERÍA
          ================================================= */}

      <section className="wrapped-confiteria">
        <div className="wrapped-confiteria-encabezado revelar" data-revelar>
          <p className="etiqueta">Tus compras favoritas</p>

          <h2>Tu Wrapped de confitería 🍿</h2>

          <p>
            Descubre cuánto has gastado y cuáles son tus productos favoritos de
            Cine Wrapped.
          </p>
        </div>

        <div className="wrapped-confiteria-grid">
          {/* Total gastado en compras confirmadas. */}
          <article
            className="wrapped-tarjeta revelar"
            data-revelar
            style={{ "--retraso": "0.1s" }}
          >
            <span className="wrapped-valor">
              <NumeroAnimado
                valor={wrapped.confiteria?.totalGastado}
                formato={formatearPrecio}
              />
            </span>

            <h3>Total gastado</h3>

            <p>Dinero acumulado en compras confirmadas de confitería.</p>
          </article>

          {/* Producto más comprado por cantidad de unidades. */}
          <article
            className="wrapped-tarjeta revelar"
            data-revelar
            style={{ "--retraso": "0.3s" }}
          >
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
          <article
            className="wrapped-tarjeta revelar"
            data-revelar
            style={{ "--retraso": "0.5s" }}
          >
            <span className="wrapped-numero">
              <NumeroAnimado valor={wrapped.confiteria?.cantidadCompras ?? 0} />
            </span>

            <h3>Compras realizadas</h3>

            <p>Cantidad de compras confirmadas registradas en tu historial.</p>
          </article>
        </div>
      </section>

      {/* =================================================
          BOTONES FINALES (los 4 en una sola fila)
          ================================================= */}

      {/* NUEVO: compartir como imagen. */}
      <div className="wrapped-compartir revelar" data-revelar>
        <button type="button" className="boton" onClick={manejarCompartir}>
          Compartir mi Wrapped
        </button>

        {mensajeCompartir && (
          <p className="wrapped-compartir-mensaje" role="status">
            {mensajeCompartir}
          </p>
        )}
      </div>

      <div className="wrapped-acciones revelar" data-revelar>
        <Link className="boton" to="/mis-entradas">
          Ver mis entradas
        </Link>

        <Link className="boton boton-secundario" to="/mis-compras-confiteria">
          Ver mis compras
        </Link>

        <Link className="boton boton-secundario" to="/confiteria">
          Ir a confitería
        </Link>

        <Link className="boton boton-secundario" to="/peliculas">
          Volver a cartelera
        </Link>
      </div>
    </main>
  );
}

export default CineWrapped;
