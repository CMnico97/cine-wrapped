// Importamos useState para controlar
// los datos del formulario.
import { useState } from "react";

// Importamos herramientas de navegación.
import { Link, useNavigate } from "react-router-dom";

// Importamos la función que realiza
// POST /auth/register.
import { registrarUsuario } from "../services/api";

// =====================================================
// PÁGINA DE REGISTRO
// =====================================================

function Registro() {
  // Estados de los campos.
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Estados relacionados con la petición.
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const navigate = useNavigate();

  // ===================================================
  // ENVIAR REGISTRO
  // ===================================================

  const manejarSubmit = async (evento) => {
    evento.preventDefault();

    setError(null);
    setEnviando(true);

    try {
      // Creamos el usuario mediante nuestra API.
      await registrarUsuario(nombre, email, password);

      // Después de registrarse, el usuario
      // debe iniciar sesión.
      navigate("/login");
    } catch (errorPeticion) {
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

        <h1>Crear cuenta</h1>

        <p className="formulario-descripcion">
          Regístrate para guardar tus entradas y construir tu Cine Wrapped.
        </p>

        {error && <p className="mensaje-error">{error}</p>}

        <form className="formulario" onSubmit={manejarSubmit}>
          <label>
            Nombre
            <input
              type="text"
              value={nombre}
              required
              autoComplete="name"
              onChange={(evento) => setNombre(evento.target.value)}
            />
          </label>

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
              minLength="6"
              autoComplete="new-password"
              onChange={(evento) => setPassword(evento.target.value)}
            />
          </label>

          <button
            className="boton boton-formulario"
            type="submit"
            disabled={enviando}
          >
            {enviando ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="formulario-enlace">
          ¿Ya tienes una cuenta? <Link to="/login">Iniciar sesión</Link>
        </p>
      </section>
    </main>
  );
}

export default Registro;
