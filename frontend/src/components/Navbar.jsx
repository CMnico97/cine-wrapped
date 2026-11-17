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

// NUEVO: barra de puntos y botón de sonido.
import PuntosBarra from "./PuntosBarra";
import BotonSonido from "./BotonSonido";

// =====================================================
// BARRA DE NAVEGACIÓN
// =====================================================

// Función pequeña para no repetir la clase de cada enlace.
const claseLink = ({ isActive }) =>
  isActive ? "navbar-link activo" : "navbar-link";

function Navbar() {
  const autenticado = estaAutenticado();
  const usuario = obtenerUsuario();
  const esAdmin = usuario?.rol === "admin";
  const navigate = useNavigate();
  const location = useLocation();

  // Comprobamos si estamos en la página de inicio.
  const esInicio = location.pathname === "/";

  // NUEVO: en asientos, confitería y perfil la barra de puntos
  // NO va arriba: se muestra dentro de la propia página.
  const esPantallaDeCompra =
    /^\/funciones\/[^/]+\/asientos/.test(location.pathname) ||
    location.pathname === "/confiteria" ||
    location.pathname === "/perfil";

  // ===================================================
  // REGRESAR A LA PÁGINA ANTERIOR
  // ===================================================

  const manejarVolver = () => {
    if (window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  // ===================================================
  // CERRAR SESIÓN
  // ===================================================

  const manejarCerrarSesion = () => {
    cerrarSesion();
    navigate("/");
  };

  // ===================================================
  // INTERFAZ
  // ===================================================

  return (
    <nav className="navbar">
      <div className="navbar-contenido">
        <Link className="navbar-logo" to="/">
          CINE WRAPPED
        </Link>

        <div className="navbar-enlaces">
          {!esInicio && (
            <button
              type="button"
              className="navbar-volver"
              onClick={manejarVolver}
            >
              ← Volver
            </button>
          )}

          <NavLink to="/" className={claseLink}>
            Inicio
          </NavLink>

          <NavLink to="/peliculas" className={claseLink}>
            Cartelera
          </NavLink>

          <NavLink to="/confiteria" className={claseLink}>
            Confitería
          </NavLink>

          {autenticado && (
            <>
              <NavLink to="/mis-entradas" className={claseLink}>
                Mis entradas
              </NavLink>

              <NavLink to="/perfil" className={claseLink}>
                Mi perfil
              </NavLink>

              <NavLink to="/wrapped" className={claseLink}>
                Mi Wrapped
              </NavLink>

              {esAdmin && (
                <NavLink to="/admin" className={claseLink}>
                  Administración
                </NavLink>
              )}
            </>
          )}
        </div>

        {/* SESIÓN + PUNTOS + SONIDO */}
        <div className="navbar-sesion">
          {/* NUEVO: barra fina verde de puntos. */}
          {autenticado && !esPantallaDeCompra && <PuntosBarra />}

          {/* NUEVO: silenciar / activar sonidos. */}
          <BotonSonido />

          {autenticado ? (
            <button
              type="button"
              className="navbar-cerrar"
              onClick={manejarCerrarSesion}
            >
              Cerrar sesión
            </button>
          ) : (
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
