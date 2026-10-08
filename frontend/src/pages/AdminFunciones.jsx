// Importamos herramientas de React para
// controlar estados y cargar información.
import { useEffect, useState } from "react";

// Link permite regresar al panel.
//
// Navigate permite impedir visualmente
// el acceso a usuarios no autorizados.
import { Link, Navigate } from "react-router-dom";

// Importamos las operaciones necesarias.
import {
  actualizarFuncionAdmin,
  crearFuncionAdmin,
  eliminarFuncionAdmin,
  obtenerFuncionesPorPelicula,
  obtenerPeliculas,
} from "../services/api";

// Importamos información de la sesión.
import {
  estaAutenticado,
  obtenerToken,
  obtenerUsuario,
} from "../services/auth";

// =====================================================
// FORMULARIO INICIAL
// =====================================================

const formularioInicial = {
  pelicula_id: "",
  fecha: "",
  hora: "",
  sala: "",
};

// =====================================================
// ADMINISTRACIÓN DE FUNCIONES
// =====================================================

function AdminFunciones() {
  // Recuperamos información de la sesión.
  const autenticado = estaAutenticado();
  const usuario = obtenerUsuario();
  const token = obtenerToken();

  // ===================================================
  // ESTADOS
  // ===================================================

  // Películas disponibles.
  const [peliculas, setPeliculas] = useState([]);

  // Todas las funciones encontradas.
  const [funciones, setFunciones] = useState([]);

  // Datos actuales del formulario.
  const [formulario, setFormulario] = useState(formularioInicial);

  // Id de la función que estamos editando.
  //
  // null significa que estamos creando.
  const [funcionEditando, setFuncionEditando] = useState(null);

  // Estados visuales.
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  // ===================================================
  // CARGAR INFORMACIÓN
  // ===================================================

  const cargarDatos = async () => {
    try {
      // Primero obtenemos todas las películas.
      //
      // Esta función ya devuelve directamente
      // el arreglo de películas.
      const peliculasObtenidas = await obtenerPeliculas();

      setPeliculas(peliculasObtenidas);

      // Nuestro backend público obtiene funciones
      // mediante una película determinada:
      //
      // GET /peliculas/:id/funciones
      //
      // Por eso consultamos las funciones
      // correspondientes a cada película.
      const consultasFunciones = peliculasObtenidas.map(async (pelicula) => {
        const funcionesPelicula = await obtenerFuncionesPorPelicula(
          pelicula.id,
        );

        // Agregamos temporalmente los datos
        // básicos de la película a cada función.
        //
        // Esto solamente se utiliza para mostrar
        // información en el panel.
        return funcionesPelicula.map((funcion) => ({
          ...funcion,

          pelicula: {
            id: pelicula.id,
            titulo: pelicula.titulo,
          },
        }));
      });

      // Esperamos todas las consultas.
      const resultados = await Promise.all(consultasFunciones);

      // Promise.all produce un arreglo
      // que contiene otros arreglos.
      //
      // flat() los convierte en una sola lista.
      const todasLasFunciones = resultados.flat();

      // Ordenamos las funciones por fecha y hora.
      todasLasFunciones.sort((a, b) => {
        const fechaA = `${a.fecha} ${a.hora}`;

        const fechaB = `${b.fecha} ${b.hora}`;

        return fechaA.localeCompare(fechaB);
      });

      setFunciones(todasLasFunciones);
    } catch (errorPeticion) {
      setError(errorPeticion.message);
    } finally {
      setCargando(false);
    }
  };

  // Cargamos la información cuando
  // se abre la página.
  useEffect(() => {
    cargarDatos();
  }, []);

  // ===================================================
  // MODIFICAR FORMULARIO
  // ===================================================

  const manejarCambio = (evento) => {
    const { name, value } = evento.target;

    setFormulario((formularioActual) => ({
      ...formularioActual,
      [name]: value,
    }));
  };

  // ===================================================
  // LIMPIAR FORMULARIO
  // ===================================================

  const limpiarFormulario = () => {
    setFormulario(formularioInicial);
    setFuncionEditando(null);
  };

  // ===================================================
  // CREAR / ACTUALIZAR FUNCIÓN
  // ===================================================

  const manejarSubmit = async (evento) => {
    evento.preventDefault();

    setError(null);
    setMensaje(null);
    setGuardando(true);

    try {
      // Construimos exactamente los datos
      // esperados por nuestro backend.
      const datosFuncion = {
        pelicula_id: Number(formulario.pelicula_id),

        fecha: formulario.fecha,

        hora: formulario.hora,

        sala: Number(formulario.sala),
      };

      // Si existe un id, actualizamos.
      if (funcionEditando) {
        await actualizarFuncionAdmin(funcionEditando, datosFuncion, token);

        setMensaje("Función actualizada correctamente.");
      } else {
        // Si no existe id, creamos.
        await crearFuncionAdmin(datosFuncion, token);

        setMensaje("Función creada correctamente.");
      }

      // Limpiamos el formulario.
      limpiarFormulario();

      // Volvemos a consultar la información
      // para reflejar inmediatamente el cambio.
      await cargarDatos();
    } catch (errorPeticion) {
      setError(errorPeticion.message);
    } finally {
      setGuardando(false);
    }
  };

  // ===================================================
  // EDITAR FUNCIÓN
  // ===================================================

  const comenzarEdicion = (funcion) => {
    // Guardamos el id de la función.
    setFuncionEditando(funcion.id);

    // Cargamos sus datos en el formulario.
    setFormulario({
      pelicula_id: String(funcion.pelicula_id ?? funcion.pelicula?.id ?? ""),

      // El input date solamente acepta
      // YYYY-MM-DD.
      fecha: funcion.fecha ? funcion.fecha.slice(0, 10) : "",

      // El input time necesita HH:MM.
      hora: funcion.hora ? funcion.hora.slice(0, 5) : "",

      sala: String(funcion.sala || ""),
    });

    setError(null);
    setMensaje(null);

    // Subimos al formulario.
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ===================================================
  // ELIMINAR FUNCIÓN
  // ===================================================

  const eliminarFuncion = async (funcion) => {
    const confirmado = window.confirm(`¿Eliminar la función #${funcion.id}?`);

    if (!confirmado) {
      return;
    }

    setError(null);
    setMensaje(null);

    try {
      await eliminarFuncionAdmin(funcion.id, token);

      setMensaje("Función eliminada correctamente.");

      // Si estábamos editando la misma función,
      // limpiamos el formulario.
      if (funcionEditando === funcion.id) {
        limpiarFormulario();
      }

      // Actualizamos el listado.
      await cargarDatos();
    } catch (errorPeticion) {
      setError(errorPeticion.message);
    }
  };

  // ===================================================
  // PROTECCIÓN DE LA INTERFAZ
  // ===================================================

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

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

        <h1>Gestionar funciones</h1>

        <p>
          Administra las fechas, horarios y salas correspondientes a cada
          película.
        </p>
      </header>

      {/* =================================================
          FORMULARIO
          ================================================= */}

      <section className="admin-formulario-seccion">
        <h2>{funcionEditando ? "Editar función" : "Nueva función"}</h2>

        {error && <p className="mensaje-error">{error}</p>}

        {mensaje && <p className="mensaje-exito">{mensaje}</p>}

        <form className="formulario admin-formulario" onSubmit={manejarSubmit}>
          {/* Seleccionamos una película existente
              en vez de pedir manualmente su id. */}
          <label>
            Película
            <select
              name="pelicula_id"
              value={formulario.pelicula_id}
              onChange={manejarCambio}
              required
            >
              <option value="">Selecciona una película</option>

              {peliculas.map((pelicula) => (
                <option key={pelicula.id} value={pelicula.id}>
                  {pelicula.titulo}
                </option>
              ))}
            </select>
          </label>

          <div className="admin-formulario-fila">
            <label>
              Fecha
              <input
                type="date"
                name="fecha"
                value={formulario.fecha}
                onChange={manejarCambio}
                required
              />
            </label>

            <label>
              Hora
              <input
                type="time"
                name="hora"
                value={formulario.hora}
                onChange={manejarCambio}
                required
              />
            </label>
          </div>

          <label>
            Sala
            <input
              type="number"
              name="sala"
              value={formulario.sala}
              onChange={manejarCambio}
              required
              min="1"
            />
          </label>

          <div className="admin-formulario-acciones">
            <button
              type="submit"
              className="boton boton-formulario"
              disabled={guardando}
            >
              {guardando
                ? "Guardando..."
                : funcionEditando
                  ? "Guardar cambios"
                  : "Crear función"}
            </button>

            {funcionEditando && (
              <button
                type="button"
                className="boton boton-secundario"
                onClick={limpiarFormulario}
              >
                Cancelar edición
              </button>
            )}
          </div>
        </form>
      </section>

      {/* =================================================
          LISTADO DE FUNCIONES
          ================================================= */}

      <section className="admin-listado">
        <div className="admin-listado-encabezado">
          <div>
            <p className="etiqueta">Programación actual</p>

            <h2>Funciones existentes</h2>
          </div>

          <span>{funciones.length} función(es)</span>
        </div>

        {cargando ? (
          <p>Cargando funciones...</p>
        ) : funciones.length === 0 ? (
          <p>Todavía no existen funciones.</p>
        ) : (
          <div className="admin-peliculas-lista">
            {funciones.map((funcion) => (
              <article className="admin-pelicula" key={funcion.id}>
                <div className="admin-pelicula-info">
                  <p className="etiqueta">Función #{funcion.id}</p>

                  <h3>{funcion.pelicula?.titulo}</h3>

                  <p>
                    {new Date(funcion.fecha).toLocaleDateString("es-CL")}
                    {" · "}
                    {funcion.hora.slice(0, 5)}
                  </p>

                  <p>Sala {funcion.sala}</p>
                </div>

                <div className="admin-pelicula-acciones">
                  <button
                    type="button"
                    className="boton boton-secundario"
                    onClick={() => comenzarEdicion(funcion)}
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    className="boton boton-peligro"
                    onClick={() => eliminarFuncion(funcion)}
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="acciones-historial">
        <Link className="boton" to="/admin">
          Volver al panel
        </Link>
      </div>
    </main>
  );
}

export default AdminFunciones;
