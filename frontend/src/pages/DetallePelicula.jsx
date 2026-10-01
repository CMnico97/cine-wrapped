// Importamos herramientas de React.
import { useEffect, useState } from 'react';

// useParams permite obtener parámetros desde la URL.
//
// Por ejemplo:
//
// /peliculas/1
//
// nos permitirá obtener:
//
// id = "1"
//
// Link nos permitirá regresar a la cartelera.
import {
  Link,
  useParams
} from 'react-router-dom';

// Importamos la función encargada de consultar
// una película específica.
import {
  obtenerPeliculaPorId
} from '../services/api';


// =====================================================
// DETALLE DE PELÍCULA
// =====================================================

function DetallePelicula() {
  // Obtenemos el :id definido en nuestra ruta.
  const { id } = useParams();

  // Guardamos la película recibida desde Express.
  const [pelicula, setPelicula] = useState(null);

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
        const peliculaObtenida =
          await obtenerPeliculaPorId(id);

        setPelicula(peliculaObtenida);

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
        <p className="mensaje-error">
          {error}
        </p>

        <Link
          className="boton"
          to="/peliculas"
        >
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
      <Link
        className="enlace-volver"
        to="/peliculas"
      >
        ← Volver a cartelera
      </Link>

      <section className="detalle-pelicula">
        <div className="poster detalle-poster">
          {pelicula.poster ? (
            <img
              src={pelicula.poster}
              alt={`Póster de ${pelicula.titulo}`}
            />
          ) : (
            <span>Sin póster</span>
          )}
        </div>

        <div className="detalle-contenido">
          <p className="etiqueta">
            {pelicula.genero}
          </p>

          <h1>{pelicula.titulo}</h1>

          <p className="pelicula-datos">
            {pelicula.duracion} minutos
          </p>

          <p>{pelicula.sinopsis}</p>

          <p>
            <strong>Director:</strong>{' '}
            {pelicula.director}
          </p>
        </div>
      </section>
    </main>
  );
}


export default DetallePelicula;