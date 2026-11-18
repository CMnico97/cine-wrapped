import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { obtenerPeliculas } from "../services/api";

// Dirección del servidor backend.
const API_URL = "http://localhost:3000";

// Convierte la ruta de la portada en una URL completa.
const obtenerUrlPoster = (poster) => {
  // Si no existe una portada, devolvemos una cadena vacía.
  if (!poster) return "";

  // Si ya es una URL completa, la mantenemos.
  if (poster.startsWith("http")) return poster;

  // Agregamos la dirección del backend a la ruta recibida.
  return `${API_URL}${poster}`;
};

// =====================================================
// CARRUSEL DE PELÍCULAS (para la página de inicio)
// =====================================================
// Muestra algunas películas de la cartelera en una fila
// que se desliza sola cada pocos segundos. Se detiene si
// el usuario pasa el mouse por encima.

// Cuántas películas mostramos como máximo.
const MAXIMO_PELICULAS = 8;

// Mueve la fila hacia la derecha (1) o la izquierda (-1).
const desplazar = (pista, direccion) => {
  if (!pista) return;

  const tarjeta = pista.firstElementChild;
  const paso = tarjeta ? tarjeta.getBoundingClientRect().width + 16 : 240;

  pista.scrollBy({ left: direccion * paso, behavior: "smooth" });
};

function CarruselPeliculas() {
  const [peliculas, setPeliculas] = useState([]);
  const [estado, setEstado] = useState("cargando"); // cargando | listo | error
  const [pausa, setPausa] = useState(false);
  const pista = useRef(null);

  // Cargamos las películas desde el backend.
  useEffect(() => {
    let activo = true;

    obtenerPeliculas()
      .then((lista) => {
        if (!activo) return;
        setPeliculas(lista.slice(0, MAXIMO_PELICULAS));
        setEstado("listo");
      })
      .catch((error) => {
        // Mostramos un aviso en vez de esconder el carrusel.
        console.error("No se pudo cargar el carrusel:", error);
        if (activo) setEstado("error");
      });

    return () => {
      activo = false;
    };
  }, []);

  // Avance automático cada 4,5 segundos.
  useEffect(() => {
    const reducirMovimiento = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (pausa || reducirMovimiento || peliculas.length < 2) return undefined;

    const temporizador = setInterval(() => {
      const el = pista.current;
      if (!el) return;

      const llegoAlFinal = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;

      if (llegoAlFinal) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        desplazar(el, 1);
      }
    }, 4500);

    return () => clearInterval(temporizador);
  }, [pausa, peliculas.length]);

  // Mientras carga mostramos tarjetas vacías (esqueleto).
  if (estado === "cargando") {
    return (
      <section className="carrusel" aria-busy="true">
        <div className="carrusel-cabecera">
          <div>
            <p className="etiqueta">En cartelera</p>
            <h2>
              Películas de <em>hoy</em>
            </h2>
          </div>
        </div>

        <div className="carrusel-pista">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="carrusel-tarjeta carrusel-esqueleto">
              <div className="carrusel-poster" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (estado === "error" || peliculas.length === 0) {
    return (
      <section className="carrusel">
        <div className="carrusel-cabecera">
          <div>
            <p className="etiqueta">En cartelera</p>
            <h2>
              Películas de <em>hoy</em>
            </h2>
          </div>
        </div>

        <p className="carrusel-aviso">
          {estado === "error"
            ? "No pudimos cargar las películas. Revisa que el backend esté encendido."
            : "Todavía no hay películas en cartelera."}
        </p>
      </section>
    );
  }

  return (
    <section
      className="carrusel"
      onMouseEnter={() => setPausa(true)}
      onMouseLeave={() => setPausa(false)}
      onFocus={() => setPausa(true)}
      onBlur={() => setPausa(false)}
    >
      <div className="carrusel-cabecera">
        <div>
          <p className="etiqueta">En cartelera</p>
          <h2>
            Películas de <em>hoy</em>
          </h2>
        </div>

        <div className="carrusel-controles">
          <Link className="carrusel-todas" to="/peliculas">
            Ver toda la cartelera →
          </Link>

          <button
            type="button"
            className="carrusel-flecha"
            aria-label="Películas anteriores"
            onClick={() => desplazar(pista.current, -1)}
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
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          <button
            type="button"
            className="carrusel-flecha"
            aria-label="Películas siguientes"
            onClick={() => desplazar(pista.current, 1)}
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
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      <div className="carrusel-pista" ref={pista}>
        {peliculas.map((pelicula) => (
          <Link
            key={pelicula.id}
            className="carrusel-tarjeta"
            to={`/peliculas/${pelicula.id}`}
          >
            <div className="carrusel-poster">
              {pelicula.poster ? (
                <img
                  // Utilizamos la URL completa para cargar la portada.
                  src={obtenerUrlPoster(pelicula.poster)}
                  alt={`Póster de ${pelicula.titulo}`}
                />
              ) : (
                <span>SIN PÓSTER</span>
              )}
            </div>

            <span className="carrusel-titulo">{pelicula.titulo}</span>

            <span className="carrusel-datos">
              {pelicula.genero} · {pelicula.duracion} min
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default CarruselPeliculas;
