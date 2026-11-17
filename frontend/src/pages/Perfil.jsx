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

// NUEVO: barra de puntos (fina y verde).
import PuntosBarra from "../components/PuntosBarra";

// =====================================================
// PERFIL DEL USUARIO
// =====================================================

function Perfil() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // ===================================================
  // CARGAR PERFIL
  // ===================================================

  useEffect(() => {
    const cargarPerfil = async () => {
      const token = obtenerToken();

      // Si no existe una sesión, enviamos al login.
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const datosUsuario = await obtenerPerfil(token);
        setUsuario(datosUsuario);
      } catch (errorPeticion) {
        setError(errorPeticion.message);
      } finally {
        setCargando(false);
      }
    };

    cargarPerfil();
  }, [navigate]);

  // Formato de fecha chileno (día-mes-año).
  const formatearFecha = (fecha) => {
    if (!fecha) {
      return "-";
    }

    return new Date(fecha).toLocaleDateString("es-CL");
  };

  // Nombre amigable para el rol.
  const formatearRol = (rol) => {
    return rol === "admin" ? "Administrador" : "Usuario";
  };

  // ===================================================
  // ESTADO DE CARGA Y DE ERROR
  // ===================================================

  if (cargando) {
    return (
      <main className="contenedor">
        <p>Cargando perfil...</p>
      </main>
    );
  }

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
    <main className="contenedor perfil-pagina">
      {/* Foto arriba al centro y los datos debajo. */}
      <section className="perfil-cabecera">
        {/* Avatar con la primera letra del nombre. */}
        <div className="perfil-avatar perfil-avatar-grande">
          {usuario?.nombre?.charAt(0).toUpperCase()}
        </div>

        <h1 className="perfil-nombre">{usuario?.nombre}</h1>

        <p className="perfil-email">{usuario?.email}</p>

        <p className="etiqueta perfil-rol">
          {formatearRol(usuario?.rol)} · Miembro desde{" "}
          {formatearFecha(usuario?.fecha_registro)}
        </p>

        {/* Barra de puntos debajo del correo. */}
        <PuntosBarra variante="resumen" titulo="Tus puntos" />
      </section>

      {/* Botones repartidos parejos al final. */}
      <section className="perfil-accesos">
        <Link className="boton" to="/mis-entradas">
          Mis entradas
        </Link>

        <Link className="boton boton-secundario" to="/wrapped">
          Mi Cine Wrapped
        </Link>

        <Link className="boton boton-secundario" to="/mis-compras-confiteria">
          Mis compras
        </Link>

        <Link className="boton boton-secundario" to="/mis-puntos">
          Mis puntos
        </Link>

        {/* Solo para administradores. */}
        {usuario?.rol === "admin" && (
          <Link className="boton boton-secundario" to="/admin">
            Administración
          </Link>
        )}
      </section>
    </main>
  );
}

export default Perfil;
