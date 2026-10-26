import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";

// Servicios de administración de productos.
import {
  obtenerProductosAdmin,
  crearProductoAdmin,
  editarProductoAdmin,
  cambiarDisponibilidadProductoAdmin,
} from "../services/api";

// Funciones de autenticación.
import {
  estaAutenticado,
  obtenerUsuario,
  obtenerToken,
} from "../services/auth";

// =====================================================
// FORMULARIO INICIAL
// =====================================================

const formularioInicial = {
  nombre: "",
  descripcion: "",
  categoria: "popcorn",
  precio: "",
  imagen: "",
};

// =====================================================
// ADMINISTRACIÓN DE CONFITERÍA
// =====================================================

function AdminConfiteria() {
  // Verificamos la sesión y el rol.
  const autenticado = estaAutenticado();
  const usuario = obtenerUsuario();

  // Lista de productos y estados de la interfaz.
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Datos del formulario y producto en edición.
  const [formulario, setFormulario] = useState(formularioInicial);
  const [productoEditando, setProductoEditando] = useState(null);

  // ===================================================
  // CONSULTAR PRODUCTOS
  // ===================================================

  const cargarProductos = async () => {
    try {
      setCargando(true);
      setError("");

      const resultado = await obtenerProductosAdmin(obtenerToken());

      setProductos(resultado);
    } catch (errorPeticion) {
      setError(errorPeticion.message);
    } finally {
      setCargando(false);
    }
  };

  // Consultamos los productos al abrir la página
  // solamente cuando el usuario es administrador.
  useEffect(() => {
    if (autenticado && usuario?.rol === "admin") {
      cargarProductos();
    }
  }, [autenticado, usuario?.rol]);

  // ===================================================
  // MODIFICAR CAMPOS DEL FORMULARIO
  // ===================================================

  const manejarCambio = (evento) => {
    const { name, value } = evento.target;

    setFormulario((actual) => ({
      ...actual,
      [name]: value,
    }));
  };

  // ===================================================
  // SELECCIONAR PRODUCTO PARA EDITAR
  // ===================================================

  const seleccionarProducto = (producto) => {
    setProductoEditando(producto.id);

    setFormulario({
      nombre: producto.nombre,
      descripcion: producto.descripcion || "",
      categoria: producto.categoria,
      precio: String(producto.precio),
      imagen: producto.imagen || "",
    });

    setMensaje("");
    setError("");

    // Subimos al formulario para facilitar la edición.
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ===================================================
  // CANCELAR EDICIÓN
  // ===================================================

  const cancelarEdicion = () => {
    setProductoEditando(null);
    setFormulario(formularioInicial);
  };

  // ===================================================
  // GUARDAR PRODUCTO
  // ===================================================

  const guardarProducto = async (evento) => {
    evento.preventDefault();

    if (guardando) return;

    setGuardando(true);
    setError("");
    setMensaje("");

    // Convertimos los valores del formulario al
    // formato esperado por el backend.
    const datosProducto = {
      nombre: formulario.nombre.trim(),
      descripcion: formulario.descripcion.trim() || null,
      categoria: formulario.categoria,
      precio: Number(formulario.precio),
      imagen: formulario.imagen.trim() || null,
    };

    try {
      const token = obtenerToken();

      if (productoEditando !== null) {
        // Actualizamos un producto existente.
        await editarProductoAdmin(productoEditando, datosProducto, token);

        setMensaje("Producto actualizado correctamente.");
      } else {
        // Registramos un nuevo producto.
        await crearProductoAdmin(datosProducto, token);

        setMensaje("Producto creado correctamente.");
      }

      // Limpiamos el formulario.
      cancelarEdicion();

      // Actualizamos el listado.
      await cargarProductos();
    } catch (errorPeticion) {
      setError(errorPeticion.message);
    } finally {
      setGuardando(false);
    }
  };

  // ===================================================
  // ACTIVAR O DESACTIVAR PRODUCTO
  // ===================================================

  const cambiarDisponibilidad = async (producto) => {
    if (guardando) return;

    setGuardando(true);
    setError("");
    setMensaje("");

    try {
      // MySQL puede devolver disponible como 1 o 0.
      const disponibleActual = Boolean(producto.disponible);

      await cambiarDisponibilidadProductoAdmin(
        producto.id,
        !disponibleActual,
        obtenerToken(),
      );

      setMensaje(
        disponibleActual
          ? "Producto desactivado correctamente."
          : "Producto activado correctamente.",
      );

      await cargarProductos();
    } catch (errorPeticion) {
      setError(errorPeticion.message);
    } finally {
      setGuardando(false);
    }
  };

  // ===================================================
  // PROTECCIÓN VISUAL DE LA PÁGINA
  // ===================================================

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  if (usuario?.rol !== "admin") {
    return (
      <main className="contenedor">
        <h1>Acceso restringido</h1>
        <p>No tienes permisos de administrador.</p>
        <Link to="/admin" className="boton">
          Volver
        </Link>
      </main>
    );
  }

  // ===================================================
  // INTERFAZ
  // ===================================================

  return (
    <main className="contenedor">
      <header className="admin-encabezado">
        <p className="etiqueta">Administración</p>
        <h1>Gestión de confitería</h1>
        <p>Administra los productos, precios y disponibilidad.</p>
      </header>

      {/* Mensajes de resultado. */}
      {error && (
        <p className="mensaje-error" role="alert">
          {error}
        </p>
      )}

      {mensaje && (
        <p className="admin-confiteria-exito" role="status">
          {mensaje}
        </p>
      )}

      {/* ===============================================
          FORMULARIO DE PRODUCTOS
          =============================================== */}

      <section className="admin-confiteria-seccion">
        <h2>
          {productoEditando !== null ? "Editar producto" : "Agregar producto"}
        </h2>

        <form
          className="admin-confiteria-formulario"
          onSubmit={guardarProducto}
        >
          <label>
            Nombre
            <input
              type="text"
              name="nombre"
              value={formulario.nombre}
              onChange={manejarCambio}
              maxLength={150}
              required
            />
          </label>

          <label>
            Descripción
            <textarea
              name="descripcion"
              value={formulario.descripcion}
              onChange={manejarCambio}
              rows={3}
            />
          </label>

          <label>
            Categoría
            <select
              name="categoria"
              value={formulario.categoria}
              onChange={manejarCambio}
            >
              <option value="popcorn">Popcorn</option>
              <option value="bebida">Bebida</option>
            </select>
          </label>

          <label>
            Precio (CLP)
            <input
              type="number"
              name="precio"
              min="1"
              step="1"
              value={formulario.precio}
              onChange={manejarCambio}
              required
            />
          </label>

          <label>
            URL de imagen (opcional)
            <input
              type="url"
              name="imagen"
              value={formulario.imagen}
              onChange={manejarCambio}
              maxLength={500}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </label>

          <div className="admin-confiteria-acciones">
            <button type="submit" className="boton" disabled={guardando}>
              {guardando
                ? "Guardando..."
                : productoEditando !== null
                  ? "Guardar cambios"
                  : "Agregar producto"}
            </button>

            {productoEditando !== null && (
              <button
                type="button"
                className="admin-confiteria-secundario"
                onClick={cancelarEdicion}
                disabled={guardando}
              >
                Cancelar edición
              </button>
            )}
          </div>
        </form>
      </section>

      {/* ===============================================
          LISTADO DE PRODUCTOS
          =============================================== */}

      <section className="admin-confiteria-seccion">
        <h2>Productos registrados</h2>

        {cargando && <p>Cargando productos...</p>}

        {!cargando && productos.length === 0 && (
          <p>No hay productos registrados.</p>
        )}

        {!cargando && productos.length > 0 && (
          <div className="admin-confiteria-lista">
            {productos.map((producto) => (
              <article key={producto.id} className="admin-confiteria-producto">
                <div>
                  <p className="etiqueta">
                    {producto.categoria === "popcorn"
                      ? "🍿 Popcorn"
                      : "🥤 Bebida"}
                  </p>

                  <h3>{producto.nombre}</h3>

                  <p>{producto.descripcion || "Sin descripción"}</p>

                  <strong>
                    {new Intl.NumberFormat("es-CL", {
                      style: "currency",
                      currency: "CLP",
                      maximumFractionDigits: 0,
                    }).format(Number(producto.precio))}
                  </strong>

                  <p>
                    Estado:{" "}
                    {Boolean(producto.disponible)
                      ? "Disponible"
                      : "Desactivado"}
                  </p>
                </div>

                <div className="admin-confiteria-acciones">
                  <button
                    type="button"
                    className="boton"
                    onClick={() => seleccionarProducto(producto)}
                    disabled={guardando}
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    className="admin-confiteria-secundario"
                    onClick={() => cambiarDisponibilidad(producto)}
                    disabled={guardando}
                  >
                    {Boolean(producto.disponible) ? "Desactivar" : "Activar"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminConfiteria;
