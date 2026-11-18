
// Importamos herramientas de React.
import { useEffect, useState } from "react";

// useParams permite obtener parámetros desde la URL.
//
// Link nos permitirá regresar a la cartelera.
import { Link, useParams } from "react-router-dom";

// Importamos las funciones encargadas de consultar
// la película y sus funciones disponibles.
import {
  obtenerPeliculaPorId,
  obtenerFuncionesPorPelicula,
} from "../services/api";

// =====================================================
// CONFIGURACIÓN DEL BACKEND
// =====================================================

// Dirección donde se encuentra nuestro servidor Express.
const API_URL = "http://localhost:3000";

// =====================================================
// OBTENER URL DE LA PORTADA
// =====================================================

// Convierte las rutas relativas de las imágenes
// en direcciones completas para que React pueda mostrarlas.
const obtenerUrlPoster = (poster) => {
  // Si la película no tiene portada, devolvemos vacío.
  if (!poster) {
    return "";
  }

  // Si ya tiene una dirección completa, la conservamos.
  // Esto mantiene compatibilidad con portadas antiguas.
  if (poster.startsWith("http")) {
    return poster;
  }

  // Agregamos la dirección del backend a la ruta local.
  return `${API_URL}${poster}`;
};

// =====================================================
// DETALLE DE PELÍCULA
// =====================================================

function DetallePelicula() {
  // Obtenemos el identificador desde la URL.
  const { id } = useParams();

  // Guardamos la película recibida desde Express.
  const [pelicula, setPelicula] = useState(null);

  // Guardamos las funciones disponibles.
  const [funciones, setFunciones] = useState([]);

  // Controlamos el estado de carga.
  const [cargando, setCargando] = useState(true);

  // Guardamos posibles errores.
  const [error, setError] = useState(null);

  // ===================================================
  // CARGAR PELÍCULA
  // ===================================================

  useEffect(() => {
    const cargarPelicula = async () => {
      try {
        // Consultamos simultáneamente el detalle
        // de la película y sus funciones disponibles.
        const [peliculaObtenida, funcionesObtenidas] = await Promise.all([
          obtenerPeliculaPorId(id),
          obtenerFuncionesPorPelicula(id),
        ]);

        // Guardamos los resultados en sus estados.
        setPelicula(peliculaObtenida);
        setFunciones(funcionesObtenidas);
      } catch (errorPeticion) {
        setError(errorPeticion.message);
      } finally {
        setCargando(false);
      }
    };

    cargarPelicula();
  }, [id]);

  // ===================================================
  // ESTADO DE CARGA
  // ===================================================

  if (cargando) {
    return (
      <main className="contenedor">
        <p>Cargando película...</p>
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
  // INFORMACIÓN DE LA PELÍCULA
  // ===================================================

  return (
    <main className="contenedor">
      <Link className="enlace-volver" to="/peliculas">
        ← Volver a cartelera
      </Link>

      <section className="detalle-pelicula">
        <div className="poster detalle-poster">
          {pelicula.poster ? (
            <img
              // Utilizamos la dirección completa del backend
              // para mostrar correctamente la portada.
              src={obtenerUrlPoster(pelicula.poster)}
              alt={`Póster de ${pelicula.titulo}`}
            />
          ) : (
            <span>Sin póster</span>
          )}
        </div>

        <div className="detalle-contenido">
          <p className="etiqueta">{pelicula.genero}</p>

          <h1>{pelicula.titulo}</h1>

          <p className="pelicula-datos">
            {pelicula.duracion} minutos
          </p>

          <p>{pelicula.sinopsis}</p>

          <p>
            <strong>Director:</strong> {pelicula.director}
          </p>

          {/* =================================================
              FUNCIONES DISPONIBLES
              ================================================= */}

          <section className="funciones">
            <h2>Funciones disponibles</h2>

            {/* Si no existen funciones, mostramos
                un mensaje informativo. */}
            {funciones.length === 0 ? (
              <p>No hay funciones disponibles para esta película.</p>
            ) : (
              <div className="lista-funciones">
                {/* Mostramos cada función recibida desde la API. */}
                {funciones.map((funcion) => (
                  <Link
                    className="funcion"
                    key={funcion.id}
                    to={`/funciones/${funcion.id}/asientos`}
                  >
                    <span className="funcion-fecha">
                      {new Date(funcion.fecha).toLocaleDateString("es-CL")}
                    </span>

                    <span className="funcion-hora">
                      {funcion.hora.slice(0, 5)}
                    </span>

                    <span className="funcion-sala">
                      Sala {funcion.sala}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

export default DetallePelicula;
