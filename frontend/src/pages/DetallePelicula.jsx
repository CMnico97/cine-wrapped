// Importamos herramientas de React.
import { useEffect, useState } from "react";

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
import { Link, useParams } from "react-router-dom";

// Importamos la función encargada de consultar
// una película específica.
import {
  obtenerPeliculaPorId,
  obtenerFuncionesPorPelicula,
} from "../services/api";

// =====================================================
// DETALLE DE PELÍCULA
// =====================================================

function DetallePelicula() {
  // Obtenemos el :id definido en nuestra ruta.
  const { id } = useParams();

  // Guardamos la película recibida desde Express.
  const [pelicula, setPelicula] = useState(null);

  // Guardamos las funciones disponibles
  // correspondientes a esta película.
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
        // Consultamos simultáneamente:
        //
        // 1. El detalle de la película.
        // 2. Sus funciones disponibles.
        //
        // Promise.all permite realizar ambas peticiones
        // al mismo tiempo.
        const [peliculaObtenida, funcionesObtenidas] = await Promise.all([
          obtenerPeliculaPorId(id),
          obtenerFuncionesPorPelicula(id),
        ]);

        // Guardamos ambos resultados
        // en sus respectivos estados.
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
            <img src={pelicula.poster} alt={`Póster de ${pelicula.titulo}`} />
          ) : (
            <span>Sin póster</span>
          )}
        </div>

        <div className="detalle-contenido">
          <p className="etiqueta">{pelicula.genero}</p>

          <h1>{pelicula.titulo}</h1>

          <p className="pelicula-datos">{pelicula.duracion} minutos</p>

          <p>{pelicula.sinopsis}</p>

          <p>
            <strong>Director:</strong> {pelicula.director}
          </p>
          {/* 
    =================================================
    FUNCIONES DISPONIBLES
    ================================================= */}

          <section className="funciones">
            <h2>Funciones disponibles</h2>

            {/* Si la película todavía no tiene funciones,
      mostramos un mensaje informativo. */}
            {funciones.length === 0 ? (
              <p>No hay funciones disponibles para esta película.</p>
            ) : (
              <div className="lista-funciones">
                {/* Construimos una opción por cada función
          recibida desde nuestra API. */}
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

                    <span className="funcion-sala">Sala {funcion.sala}</span>
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
