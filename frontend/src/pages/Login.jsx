// Importamos useState para controlar
// los campos y estados del formulario.
import { useState } from "react";

// useNavigate nos permitirá cambiar de página
// después de iniciar sesión.
//
// Link permite navegar hacia Registro.
import { Link, useNavigate } from "react-router-dom";

// Importamos la petición de login.
import { iniciarSesion } from "../services/api";

// Importamos la función que almacena
// nuestro JWT.
import { guardarToken, guardarUsuario } from "../services/auth";

// =====================================================
// PÁGINA DE LOGIN
// =====================================================

function Login() {
  // Guardamos los campos del formulario.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Guardamos posibles mensajes de error.
  const [error, setError] = useState(null);

  // Evita enviar varias veces el formulario
  // mientras esperamos al backend.
  const [enviando, setEnviando] = useState(false);

  // Función proporcionada por React Router
  // para realizar redirecciones.
  const navigate = useNavigate();

  // ===================================================
  // ENVIAR LOGIN
  // ===================================================

  const manejarSubmit = async (evento) => {
    // Evitamos que el navegador recargue la página.
    evento.preventDefault();

    // Limpiamos errores anteriores.
    setError(null);

    // Indicamos que comenzó la petición.
    setEnviando(true);

    try {
      // Enviamos las credenciales al backend.
      const datos = await iniciarSesion(email, password);

      // Guardamos el JWT recibido desde Express.
      guardarToken(datos.token);

      // Guardamos también la información básica
      // del usuario.
      //
      // Esto nos permitirá conocer posteriormente
      // datos como su id o su rol.
      guardarUsuario(datos.usuario);

      // Una vez iniciada la sesión,
      // enviamos al usuario a la cartelera.
      navigate("/peliculas");
    } catch (errorPeticion) {
      // Mostramos el mensaje entregado
      // por nuestra API.
      setError(errorPeticion.message);
    } finally {
      setEnviando(false);
    }
  };

  // ===================================================
  // INTERFAZ
  // ===================================================

  return (
    <main className="contenedor">
      <section className="formulario-contenedor">
        <p className="etiqueta">Cine Wrapped</p>

        <h1>Iniciar sesión</h1>

        <p className="formulario-descripcion">
          Accede para comprar entradas, revisar tu historial y consultar tu Cine
          Wrapped.
        </p>

        {/* Mostramos el error solamente
            cuando exista uno. */}
        {error && <p className="mensaje-error">{error}</p>}

        <form className="formulario" onSubmit={manejarSubmit}>
          <label>
            Correo electrónico
            <input
              type="email"
              value={email}
              required
              autoComplete="email"
              onChange={(evento) => setEmail(evento.target.value)}
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              value={password}
              required
              autoComplete="current-password"
              onChange={(evento) => setPassword(evento.target.value)}
            />
          </label>

          <button
            className="boton boton-formulario"
            type="submit"
            disabled={enviando}
          >
            {enviando ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="formulario-enlace">
          ¿No tienes una cuenta? <Link to="/registro">Registrarse</Link>
        </p>
      </section>
    </main>
  );
}

export default Login;
