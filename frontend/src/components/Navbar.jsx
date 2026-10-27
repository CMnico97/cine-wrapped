// Link y NavLink permiten navegar entre
// las diferentes páginas de la aplicación.
//
// useNavigate permite realizar una redirección
// después de cerrar sesión.
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";

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
  // REGRESAR A LA PÁGINA ANTERIOR
  // ===================================================

  const manejarVolver = () => {
    // Comprobamos si React Router tiene una página
    // anterior dentro del historial de navegación.
    if (window.history.state?.idx > 0) {
      // Regresamos una posición en el historial.
      navigate(-1);
    } else {
      // Si el usuario abrió la página directamente,
      // lo enviamos al inicio de Cine Wrapped.
      navigate("/");
    }
  };
  // Obtenemos la ruta actual de la aplicación.
  const location = useLocation();

  // Comprobamos si estamos en la página de inicio.
  const esInicio = location.pathname === "/";

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
          {/* Botón para regresar a la página anterior.
    Se mantiene junto a los enlaces principales
    para funcionar también en dispositivos móviles. */}
          {/* Mostramos el botón Volver solamente
    cuando NO estamos en la página de inicio. */}
          {!esInicio && (
            <button
              type="button"
              className="navbar-volver"
              onClick={manejarVolver}
            >
              ← Volver
            </button>
          )}
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

          {/* Acceso público al catálogo de confitería. */}
          <NavLink
            to="/confiteria"
            className={({ isActive }) =>
              isActive ? "navbar-link activo" : "navbar-link"
            }
          >
            Confitería
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

              {/* =====================================================
    SISTEMA DE PUNTOS CINE WRAPPED
    ===================================================== */}

              {/* Permite consultar el saldo disponible y
    el historial de puntos acumulados y canjeados.

    Este enlace está dentro de autenticado,
    por lo que solamente aparece cuando
    el usuario ha iniciado sesión.

    Funciona tanto para usuarios normales
    como para administradores. */}

              <NavLink
                to="/mis-puntos"
                className={({ isActive }) =>
                  isActive ? "navbar-link activo" : "navbar-link"
                }
              >
                Mis puntos
              </NavLink>

              {/* Historial de compras de confitería.
    Visible para usuarios autenticados,
    incluidos los administradores. */}
              <NavLink
                to="/mis-compras-confiteria"
                className={({ isActive }) =>
                  isActive ? "navbar-link activo" : "navbar-link"
                }
              >
                Mis compras
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
