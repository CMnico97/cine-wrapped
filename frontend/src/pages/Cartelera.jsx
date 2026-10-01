// Importamos las herramientas de React necesarias
// para manejar estado y cargar información.
import { useEffect, useState } from 'react';

// Link nos permitirá navegar hacia el detalle
// de cada película.
import { Link } from 'react-router-dom';

// Importamos nuestra función que consulta
// GET /peliculas en el backend.
import {
  obtenerPeliculas
} from '../services/api';


// =====================================================
// PÁGINA DE CARTELERA
// =====================================================

function Cartelera() {
  // Guardamos las películas obtenidas desde la API.
  const [peliculas, setPeliculas] = useState([]);

  // Controlamos si todavía estamos esperando
  // la respuesta del servidor.
  const [cargando, setCargando] = useState(true);

  // Guardamos cualquier error producido
  // durante la petición.
  const [error, setError] = useState(null);


  // ===================================================
  // CARGAR PELÍCULAS
  // ===================================================

  useEffect(() => {
    const cargarPeliculas = async () => {
      try {
        const peliculasObtenidas =
          await obtenerPeliculas();

        setPeliculas(peliculasObtenidas);

      } catch (errorPeticion) {
        setError(errorPeticion.message);

      } finally {
        setCargando(false);
      }
    };

    cargarPeliculas();
  }, []);


  // ===================================================
  // ESTADO DE CARGA
  // ===================================================

  if (cargando) {
    return (
      <main className="contenedor">
        <p>Cargando cartelera...</p>
      </main>
    );
  }


  // ===================================================
  // ESTADO DE ERROR
  // ===================================================

  if (error) {
    return (
      <main className="contenedor">
        <h1>Cartelera</h1>

        <p className="mensaje-error">
          {error}
        </p>
      </main>
    );
  }


  // ===================================================
  // CARTELERA
  // ===================================================

  return (
    <main className="contenedor">
      <header className="encabezado">
        <p className="etiqueta">
          Cine Wrapped
        </p>

        <h1>Cartelera</h1>

        <p>
          Revisa las películas disponibles actualmente.
        </p>
      </header>


      {peliculas.length === 0 ? (
        <p>No hay películas disponibles.</p>
      ) : (
        <section className="cartelera">
          {peliculas.map((pelicula) => (
            <article
              className="pelicula"
              key={pelicula.id}
            >
              <div className="poster">
                {pelicula.poster ? (
                  <img
                    src={pelicula.poster}
                    alt={`Póster de ${pelicula.titulo}`}
                  />
                ) : (
                  <span>Sin póster</span>
                )}
              </div>

              <div className="pelicula-contenido">
                <h2>{pelicula.titulo}</h2>

                <p className="pelicula-datos">
                  {pelicula.genero}
                  {' · '}
                  {pelicula.duracion} min
                </p>

                <p>{pelicula.sinopsis}</p>

                <p>
                  <strong>Director:</strong>{' '}
                  {pelicula.director}
                </p>

                {/* Cada película tendrá una URL
                    construida utilizando su id.

                    Por ejemplo:

                    /peliculas/1 */}
                <Link
                  className="boton"
                  to={`/peliculas/${pelicula.id}`}
                >
                  Ver película
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}


export default Cartelera;