// Importamos Link para navegar hacia
// las diferentes secciones administrativas.
//
// Navigate nos permitirá impedir visualmente
// el acceso a usuarios que no sean administradores.
import { Link, Navigate } from "react-router-dom";

// Importamos las funciones necesarias
// para comprobar la sesión actual.
import { estaAutenticado, obtenerUsuario } from "../services/auth";

// =====================================================
// PANEL DE ADMINISTRACIÓN
// =====================================================

function Admin() {
  // Comprobamos si existe una sesión iniciada.
  const autenticado = estaAutenticado();

  // Recuperamos los datos básicos
  // del usuario guardados durante el login.
  const usuario = obtenerUsuario();

  // ===================================================
  // USUARIO NO AUTENTICADO
  // ===================================================

  // Si no existe sesión, enviamos al usuario
  // directamente al login.
  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  // ===================================================
  // USUARIO SIN PERMISOS
  // ===================================================

  // Aunque alguien escriba manualmente /admin,
  // solamente permitimos mostrar esta página
  // cuando el usuario posee rol "admin".
  //
  // Importante:
  // esto mejora la interfaz, pero la seguridad real
  // sigue estando en Express mediante verificarAdmin.
  if (usuario?.rol !== "admin") {
    return (
      <main className="contenedor">
        <section className="admin-sin-permiso">
          <p className="etiqueta">Acceso restringido</p>

          <h1>No tienes permisos de administrador</h1>

          <p>
            Esta sección solamente está disponible para usuarios con rol
            administrativo.
          </p>

          <Link className="boton" to="/peliculas">
            Volver a cartelera
          </Link>
        </section>
      </main>
    );
  }

  // ===================================================
  // INTERFAZ DEL ADMINISTRADOR
  // ===================================================

  return (
    <main className="contenedor">
      {/* Encabezado principal. */}
      <header className="admin-encabezado">
        <p className="etiqueta">Administración</p>

        <h1>Panel administrativo</h1>

        <p>Gestiona las películas y funciones disponibles en Cine Wrapped.</p>
      </header>

      {/* =================================================
          OPCIONES ADMINISTRATIVAS
          ================================================= */}

      <section className="admin-opciones">
        {/* Gestión de películas. */}
        <article className="admin-tarjeta">
          <div>
            <p className="etiqueta">Cartelera</p>

            <h2>Películas</h2>

            <p>
              Agrega nuevas películas, modifica su información o elimina
              películas existentes.
            </p>
          </div>

          <Link className="boton" to="/admin/peliculas">
            Gestionar películas
          </Link>
        </article>

        {/* Gestión de funciones. */}
        <article className="admin-tarjeta">
          <div>
            <p className="etiqueta">Programación</p>

            <h2>Funciones</h2>

            <p>Crea y administra fechas, horarios y salas.</p>
          </div>

          <Link className="boton" to="/admin/funciones">
            Gestionar funciones
          </Link>
        </article>
      </section>
    </main>
  );
}

export default Admin;
