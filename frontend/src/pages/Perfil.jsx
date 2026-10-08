// Importamos herramientas de React para
// manejar estados y cargar información.
import { useEffect, useState } from "react";

// Link permite navegar hacia otras páginas.
//
// useNavigate permite redirigir al usuario
// cuando no existe una sesión.
import { Link, useNavigate } from "react-router-dom";

// Importamos la función que consulta
// GET /auth/me.
import { obtenerPerfil } from "../services/api";

// Importamos la función que recupera
// el JWT almacenado.
import { obtenerToken } from "../services/auth";

// =====================================================
// PERFIL DEL USUARIO
// =====================================================

function Perfil() {
  // Guardamos la información del usuario
  // recibida desde nuestro backend.
  const [usuario, setUsuario] = useState(null);

  // Controlamos la carga inicial.
  const [cargando, setCargando] = useState(true);

  // Guardamos posibles errores.
  const [error, setError] = useState(null);

  // Permite realizar redirecciones.
  const navigate = useNavigate();

  // ===================================================
  // CARGAR PERFIL
  // ===================================================

  useEffect(() => {
    const cargarPerfil = async () => {
      // Recuperamos el JWT.
      const token = obtenerToken();

      // Si no existe una sesión,
      // enviamos al usuario al login.
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        // Consultamos los datos actualizados
        // directamente desde nuestro backend.
        const datosUsuario = await obtenerPerfil(token);

        // Guardamos el usuario recibido.
        setUsuario(datosUsuario);
      } catch (errorPeticion) {
        setError(errorPeticion.message);
      } finally {
        setCargando(false);
      }
    };

    cargarPerfil();
  }, [navigate]);

  // ===================================================
  // FORMATEAR FECHA
  // ===================================================

  const formatearFecha = (fecha) => {
    // Evitamos intentar convertir
    // una fecha inexistente.
    if (!fecha) {
      return "-";
    }

    // Mostramos la fecha utilizando
    // el formato habitual de Chile.
    return new Date(fecha).toLocaleDateString("es-CL");
  };

  // ===================================================
  // FORMATEAR ROL
  // ===================================================

  const formatearRol = (rol) => {
    // Mostramos un nombre más amigable
    // que el valor almacenado en MySQL.
    if (rol === "admin") {
      return "Administrador";
    }

    return "Usuario";
  };

  // ===================================================
  // ESTADO DE CARGA
  // ===================================================

  if (cargando) {
    return (
      <main className="contenedor">
        <p>Cargando perfil...</p>
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
  // INTERFAZ
  // ===================================================

  return (
    <main className="contenedor">
      <header className="perfil-encabezado">
        <p className="etiqueta">Mi cuenta</p>

        <h1>Mi perfil</h1>

        <p>Información asociada a tu cuenta de Cine Wrapped.</p>
      </header>

      {/* =================================================
          INFORMACIÓN PERSONAL
          ================================================= */}

      <section className="perfil-tarjeta">
        <div className="perfil-identidad">
          {/* Utilizamos la primera letra del nombre
              como avatar sencillo. */}
          <div className="perfil-avatar">
            {usuario?.nombre?.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2>{usuario?.nombre}</h2>

            <p>{usuario?.email}</p>
          </div>
        </div>

        {/* =================================================
            DATOS DE LA CUENTA
            ================================================= */}

        <div className="perfil-datos">
          <div className="perfil-dato">
            <span>Rol</span>

            <strong>{formatearRol(usuario?.rol)}</strong>
          </div>

          <div className="perfil-dato">
            <span>Miembro desde</span>

            <strong>{formatearFecha(usuario?.fecha_registro)}</strong>
          </div>
        </div>
      </section>

      {/* =================================================
          ACCESOS
          ================================================= */}

      <section className="perfil-accesos">
        <Link className="boton" to="/mis-entradas">
          Mis entradas
        </Link>

        <Link className="boton" to="/wrapped">
          Mi Cine Wrapped
        </Link>

        {/* Si el usuario es administrador,
            también mostramos el acceso
            al panel administrativo. */}
        {usuario?.rol === "admin" && (
          <Link className="boton" to="/admin">
            Administración
          </Link>
        )}
      </section>
    </main>
  );
}

export default Perfil;
