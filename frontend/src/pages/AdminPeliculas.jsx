// Importamos herramientas de React
// para controlar los datos de la página.
import { useEffect, useState } from "react";

// Link permite regresar al panel administrativo.
//
// Navigate impide mostrar esta pantalla
// a usuarios que no sean administradores.
import { Link, Navigate } from "react-router-dom";

// Importamos las operaciones necesarias
// para administrar películas.
import {
  actualizarPeliculaAdmin,
  crearPeliculaAdmin,
  eliminarPeliculaAdmin,
  obtenerPeliculas,
} from "../services/api";

// Importamos las funciones relacionadas
// con la sesión actual.
import {
  estaAutenticado,
  obtenerToken,
  obtenerUsuario,
} from "../services/auth";

// =====================================================
// VALORES INICIALES DEL FORMULARIO
// =====================================================

// Utilizamos este objeto cada vez que necesitemos
// limpiar el formulario.
const formularioInicial = {
  titulo: "",
  sinopsis: "",
  duracion: "",
  genero: "",
  director: "",
  poster: "",
  fecha_estreno: "",
};

// =====================================================
// ADMINISTRACIÓN DE PELÍCULAS
// =====================================================

function AdminPeliculas() {
  // Recuperamos información de la sesión.
  const autenticado = estaAutenticado();
  const usuario = obtenerUsuario();
  const token = obtenerToken();

  // ===================================================
  // ESTADOS
  // ===================================================

  // Lista de películas existentes.
  const [peliculas, setPeliculas] = useState([]);

  // Datos actuales del formulario.
  const [formulario, setFormulario] = useState(formularioInicial);

  // Si este valor contiene un id,
  // significa que estamos editando una película.
  //
  // Si es null, estamos creando una nueva.
  const [peliculaEditando, setPeliculaEditando] = useState(null);

  // Controlamos la carga inicial.
  const [cargando, setCargando] = useState(true);

  // Controlamos el envío del formulario.
  const [guardando, setGuardando] = useState(false);

  // Guardamos posibles errores.
  const [error, setError] = useState(null);

  // Guardamos mensajes de éxito.
  const [mensaje, setMensaje] = useState(null);

  // ===================================================
  // CARGAR PELÍCULAS
  // ===================================================

  const cargarPeliculas = async () => {
    try {
      // obtenerPeliculas() ya devuelve directamente
      // el arreglo de películas recibido desde la API.
      const datos = await obtenerPeliculas();

      // Por lo tanto, guardamos directamente
      // ese arreglo en el estado.
      setPeliculas(datos);
    } catch (errorPeticion) {
      // Si ocurre un error durante la consulta,
      // guardamos el mensaje para mostrarlo.
      setError(errorPeticion.message);
    } finally {
      // Indicamos que terminó la carga inicial.
      setCargando(false);
    }
  };

  // Ejecutamos la consulta cuando
  // se abre la página.
  useEffect(() => {
    cargarPeliculas();
  }, []);

  // ===================================================
  // CAMBIAR CAMPOS DEL FORMULARIO
  // ===================================================

  const manejarCambio = (evento) => {
    // Obtenemos el nombre y valor
    // del input modificado.
    const { name, value } = evento.target;

    // Actualizamos solamente ese campo,
    // manteniendo los demás sin cambios.
    setFormulario((formularioActual) => ({
      ...formularioActual,
      [name]: value,
    }));
  };

  // ===================================================
  // LIMPIAR FORMULARIO
  // ===================================================

  const limpiarFormulario = () => {
    // Restauramos todos los campos.
    setFormulario(formularioInicial);

    // Salimos del modo edición.
    setPeliculaEditando(null);
  };

  // ===================================================
  // GUARDAR PELÍCULA
  // ===================================================

  const manejarSubmit = async (evento) => {
    // Evitamos que el navegador recargue
    // completamente la página.
    evento.preventDefault();

    // Limpiamos mensajes anteriores.
    setError(null);
    setMensaje(null);

    // Indicamos que comenzó la operación.
    setGuardando(true);

    try {
      // Construimos el objeto que enviaremos
      // a nuestro backend.
      const datosPelicula = {
        titulo: formulario.titulo,
        sinopsis: formulario.sinopsis,

        // El input devuelve texto,
        // por lo que convertimos duración a número.
        duracion: Number(formulario.duracion),

        genero: formulario.genero,
        director: formulario.director,

        // Si el póster está vacío,
        // enviamos null.
        poster: formulario.poster.trim() || null,

        // Lo mismo para la fecha de estreno.
        fecha_estreno: formulario.fecha_estreno || null,
      };

      // Si tenemos un id guardado,
      // estamos actualizando una película.
      if (peliculaEditando) {
        await actualizarPeliculaAdmin(peliculaEditando, datosPelicula, token);

        setMensaje("Película actualizada correctamente.");
      } else {
        // Si no existe id,
        // creamos una película nueva.
        await crearPeliculaAdmin(datosPelicula, token);

        setMensaje("Película creada correctamente.");
      }

      // Limpiamos el formulario.
      limpiarFormulario();

      // Volvemos a consultar el backend para
      // mostrar inmediatamente los cambios.
      await cargarPeliculas();
    } catch (errorPeticion) {
      setError(errorPeticion.message);
    } finally {
      setGuardando(false);
    }
  };

  // ===================================================
  // EDITAR PELÍCULA
  // ===================================================

  const comenzarEdicion = (pelicula) => {
    // Guardamos el id para indicar
    // que estamos en modo edición.
    setPeliculaEditando(pelicula.id);

    // Cargamos los datos actuales
    // dentro del formulario.
    setFormulario({
      titulo: pelicula.titulo || "",

      sinopsis: pelicula.sinopsis || "",

      duracion: pelicula.duracion || "",

      genero: pelicula.genero || "",

      director: pelicula.director || "",

      poster: pelicula.poster || "",

      // MySQL puede devolver la fecha como
      // una cadena ISO completa.
      //
      // El input type="date" necesita solamente:
      //
      // YYYY-MM-DD
      fecha_estreno: pelicula.fecha_estreno
        ? pelicula.fecha_estreno.slice(0, 10)
        : "",
    });

    // Limpiamos mensajes anteriores.
    setError(null);
    setMensaje(null);

    // Llevamos al usuario hacia arriba
    // para que vea el formulario cargado.
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ===================================================
  // ELIMINAR PELÍCULA
  // ===================================================

  const eliminarPelicula = async (pelicula) => {
    // Pedimos una confirmación antes de ejecutar
    // una operación destructiva.
    const confirmado = window.confirm(`¿Eliminar "${pelicula.titulo}"?`);

    if (!confirmado) {
      return;
    }

    setError(null);
    setMensaje(null);

    try {
      // Ejecutamos DELETE /admin/peliculas/:id.
      await eliminarPeliculaAdmin(pelicula.id, token);

      setMensaje("Película eliminada correctamente.");

      // Si estábamos editando precisamente
      // esta película, limpiamos el formulario.
      if (peliculaEditando === pelicula.id) {
        limpiarFormulario();
      }

      // Actualizamos la lista.
      await cargarPeliculas();
    } catch (errorPeticion) {
      setError(errorPeticion.message);
    }
  };

  // ===================================================
  // PROTECCIÓN DE LA INTERFAZ
  // ===================================================

  // Si no existe sesión, enviamos al login.
  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  // Si existe sesión pero no corresponde
  // a un administrador, regresamos al panel.
  //
  // Express también comprobará el rol
  // para cada POST, PUT y DELETE.
  if (usuario?.rol !== "admin") {
    return <Navigate to="/peliculas" replace />;
  }

  // ===================================================
  // INTERFAZ
  // ===================================================

  return (
    <main className="contenedor">
      {/* =================================================
          ENCABEZADO
          ================================================= */}

      <header className="admin-encabezado">
        <p className="etiqueta">Administración</p>

        <h1>Gestionar películas</h1>

        <p>Crea, modifica y elimina películas disponibles en la cartelera.</p>
      </header>

      {/* =================================================
          FORMULARIO
          ================================================= */}

      <section className="admin-formulario-seccion">
        <h2>{peliculaEditando ? "Editar película" : "Nueva película"}</h2>

        {/* Mostramos mensajes del backend. */}
        {error && <p className="mensaje-error">{error}</p>}

        {mensaje && <p className="mensaje-exito">{mensaje}</p>}

        <form className="formulario admin-formulario" onSubmit={manejarSubmit}>
          <label>
            Título
            <input
              type="text"
              name="titulo"
              value={formulario.titulo}
              onChange={manejarCambio}
              required
            />
          </label>

          <label>
            Sinopsis
            <textarea
              name="sinopsis"
              value={formulario.sinopsis}
              onChange={manejarCambio}
              required
              rows="5"
            />
          </label>

          <div className="admin-formulario-fila">
            <label>
              Duración en minutos
              <input
                type="number"
                name="duracion"
                value={formulario.duracion}
                onChange={manejarCambio}
                required
                min="1"
              />
            </label>

            <label>
              Género
              <input
                type="text"
                name="genero"
                value={formulario.genero}
                onChange={manejarCambio}
                required
              />
            </label>
          </div>

          <label>
            Director
            <input
              type="text"
              name="director"
              value={formulario.director}
              onChange={manejarCambio}
              required
            />
          </label>

          <label>
            URL del póster
            <input
              type="url"
              name="poster"
              value={formulario.poster}
              onChange={manejarCambio}
              placeholder="https://..."
            />
          </label>

          <label>
            Fecha de estreno
            <input
              type="date"
              name="fecha_estreno"
              value={formulario.fecha_estreno}
              onChange={manejarCambio}
            />
          </label>

          <div className="admin-formulario-acciones">
            <button
              className="boton boton-formulario"
              type="submit"
              disabled={guardando}
            >
              {guardando
                ? "Guardando..."
                : peliculaEditando
                  ? "Guardar cambios"
                  : "Crear película"}
            </button>

            {/* Este botón solamente aparece
                cuando estamos editando. */}
            {peliculaEditando && (
              <button
                className="boton boton-secundario"
                type="button"
                onClick={limpiarFormulario}
              >
                Cancelar edición
              </button>
            )}
          </div>
        </form>
      </section>

      {/* =================================================
          PELÍCULAS EXISTENTES
          ================================================= */}

      <section className="admin-listado">
        <div className="admin-listado-encabezado">
          <div>
            <p className="etiqueta">Cartelera actual</p>

            <h2>Películas existentes</h2>
          </div>

          <span>{peliculas.length} película(s)</span>
        </div>

        {cargando ? (
          <p>Cargando películas...</p>
        ) : peliculas.length === 0 ? (
          <p>Todavía no existen películas.</p>
        ) : (
          <div className="admin-peliculas-lista">
            {peliculas.map((pelicula) => (
              <article className="admin-pelicula" key={pelicula.id}>
                <div className="admin-pelicula-info">
                  <p className="etiqueta">Película #{pelicula.id}</p>

                  <h3>{pelicula.titulo}</h3>

                  <p>
                    {pelicula.genero}
                    {" · "}
                    {pelicula.duracion} min
                  </p>

                  <p>Dirigida por {pelicula.director}</p>
                </div>

                <div className="admin-pelicula-acciones">
                  <button
                    type="button"
                    className="boton boton-secundario"
                    onClick={() => comenzarEdicion(pelicula)}
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    className="boton boton-peligro"
                    onClick={() => eliminarPelicula(pelicula)}
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Regreso al panel principal. */}
      <div className="acciones-historial">
        <Link className="boton" to="/admin">
          Volver al panel
        </Link>
      </div>
    </main>
  );
}

export default AdminPeliculas;
