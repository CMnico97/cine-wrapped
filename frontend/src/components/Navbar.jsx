// Link y NavLink permiten navegar entre
// las diferentes páginas de la aplicación.
//
// useNavigate permite realizar una redirección
// después de cerrar sesión.
import { Link, NavLink, useNavigate } from "react-router-dom";

// Importamos las funciones necesarias
// para conocer y modificar la sesión.
import {
  cerrarSesion,
  estaAutenticado,
  obtenerUsuario,
} from "../services/auth";

// =====================================================
// BARRA DE NAVEGACIÓN
// =====================================================

function Navbar() {
  // Comprobamos si existe actualmente
  // una sesión iniciada.
  const autenticado = estaAutenticado();

  // Recuperamos los datos básicos
  // del usuario almacenado.
  const usuario = obtenerUsuario();

  // Comprobamos si el usuario posee
  // permisos administrativos.
  const esAdmin = usuario?.rol === "admin";

  // Herramienta de React Router
  // para realizar redirecciones.
  const navigate = useNavigate();

  // ===================================================
  // CERRAR SESIÓN
  // ===================================================

  const manejarCerrarSesion = () => {
    // Eliminamos tanto el JWT como los datos
    // del usuario almacenados localmente.
    cerrarSesion();

    // Después enviamos al usuario
    // a la página de inicio.
    navigate("/");
  };

  // ===================================================
  // INTERFAZ
  // ===================================================

  return (
    <nav className="navbar">
      <div className="navbar-contenido">
        {/* Logo / nombre de la aplicación. */}
        <Link className="navbar-logo" to="/">
          CINE WRAPPED
        </Link>

        {/* =============================================
            ENLACES PRINCIPALES
            ============================================= */}

        <div className="navbar-enlaces">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "navbar-link activo" : "navbar-link"
            }
          >
            Inicio
          </NavLink>

          <NavLink
            to="/peliculas"
            className={({ isActive }) =>
              isActive ? "navbar-link activo" : "navbar-link"
            }
          >
            Cartelera
          </NavLink>

          {/* Estas opciones solamente tienen sentido
              cuando existe una sesión iniciada. */}
          {autenticado && (
            <>
              <NavLink
                to="/mis-entradas"
                className={({ isActive }) =>
                  isActive ? "navbar-link activo" : "navbar-link"
                }
              >
                Mis entradas
              </NavLink>

              {/* Acceso a la información
              de la cuenta actual. */}
              <NavLink
                to="/perfil"
                className={({ isActive }) =>
                  isActive ? "navbar-link activo" : "navbar-link"
                }
              >
                Mi perfil
              </NavLink>

              <NavLink
                to="/wrapped"
                className={({ isActive }) =>
                  isActive ? "navbar-link activo" : "navbar-link"
                }
              >
                Mi Wrapped
              </NavLink>

              {/* Este enlace solamente aparece
                  cuando el usuario posee rol admin. */}
              {esAdmin && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    isActive ? "navbar-link activo" : "navbar-link"
                  }
                >
                  Administración
                </NavLink>
              )}
            </>
          )}
        </div>

        {/* =============================================
            SESIÓN
            ============================================= */}

        <div className="navbar-sesion">
          {autenticado ? (
            // Si existe una sesión,
            // mostramos el botón para cerrarla.
            <button
              type="button"
              className="navbar-cerrar"
              onClick={manejarCerrarSesion}
            >
              Cerrar sesión
            </button>
          ) : (
            // Si no existe una sesión,
            // mostramos el acceso al login.
            <Link className="navbar-login" to="/login">
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
