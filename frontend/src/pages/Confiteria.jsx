import { useEffect, useState } from "react";

// Importamos el servicio que obtiene los productos
// disponibles desde nuestra API de Express.
import {
  obtenerProductosConfiteria,
  crearCompraConfiteria,
} from "../services/api";

// Permite redirigir al usuario hacia el login.
import { useNavigate } from "react-router-dom";

// Permite comprobar si existe una sesión activa.
import { estaAutenticado, obtenerToken } from "../services/auth";

// =====================================================
// PÁGINA DE CONFITERÍA
// =====================================================

function Confiteria() {
  // Productos disponibles en MySQL.
  const [productos, setProductos] = useState([]);

  // Carrito de compras.
  // Cada elemento contiene los datos del producto
  // y la cantidad seleccionada.
  const [carrito, setCarrito] = useState([]);

  // Estados de carga y errores.
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Herramienta para navegar entre páginas.
  const navigate = useNavigate();

  // Indica si estamos registrando una compra.
  const [comprando, setComprando] = useState(false);

  // Guarda la información de la última compra confirmada.
  const [compraConfirmada, setCompraConfirmada] = useState(null);

  // Guarda errores relacionados con la compra.
  const [errorCompra, setErrorCompra] = useState(null);

  // =====================================================
  // COMPROBAR SESIÓN ANTES DE COMPRAR
  // =====================================================

  // =====================================================
  // CONFIRMAR COMPRA SIMULADA
  // =====================================================

  const manejarConfirmarCompra = async () => {
    // Comprobamos que existan productos seleccionados.
    if (carrito.length === 0 || comprando) {
      return;
    }

    // Si el usuario no ha iniciado sesión,
    // lo enviamos a la página de login.
    if (!estaAutenticado()) {
      navigate("/login");
      return;
    }

    // Recuperamos el JWT guardado al iniciar sesión.
    const token = obtenerToken();

    // Preparamos los productos en el formato
    // que espera nuestro backend.
    const productosCompra = carrito.map((item) => ({
      producto_id: item.id,
      cantidad: item.cantidad,
    }));

    // Limpiamos los mensajes de compras anteriores.
    setErrorCompra(null);
    setCompraConfirmada(null);
    setComprando(true);

    try {
      // Enviamos la compra simulada a Express.
      const resultado = await crearCompraConfiteria(productosCompra, token);

      // Guardamos la información de la compra realizada.
      setCompraConfirmada(resultado.compra);

      // Vaciamos el carrito únicamente después
      // de que el backend confirme la compra.
      setCarrito([]);
    } catch (errorPeticion) {
      // Si el JWT expiró o es inválido,
      // enviamos al usuario nuevamente al login.
      if (errorPeticion.status === 401) {
        setErrorCompra("Tu sesión expiró. Inicia sesión nuevamente.");

        navigate("/login");
        return;
      }

      // Para otros errores conservamos el carrito
      // y mostramos el mensaje del servidor.
      setErrorCompra(errorPeticion.message);
    } finally {
      // Permitimos volver a intentar la compra.
      setComprando(false);
    }
  };

  // ===================================================
  // CARGAR PRODUCTOS
  // ===================================================

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        // Solicitamos los productos al backend.
        const resultado = await obtenerProductosConfiteria();

        // Guardamos el catálogo recibido.
        setProductos(resultado);
      } catch (errorPeticion) {
        // Mostramos un mensaje si falla la petición.
        setError(errorPeticion.message);
      } finally {
        // Terminamos el estado de carga.
        setCargando(false);
      }
    };

    cargarProductos();
  }, []);

  // ===================================================
  // FORMATEAR PRECIOS EN PESOS CHILENOS
  // ===================================================

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(Number(precio));
  };

  // ===================================================
  // AGREGAR PRODUCTO AL CARRITO
  // ===================================================

  const agregarAlCarrito = (producto) => {
    setCarrito((carritoActual) => {
      // Comprobamos si el producto ya está agregado.
      const productoExistente = carritoActual.find(
        (item) => item.id === producto.id,
      );

      if (productoExistente) {
        // Si ya existe, aumentamos su cantidad.
        return carritoActual.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item,
        );
      }

      // Si todavía no existe, lo agregamos
      // al carrito con cantidad inicial de 1.
      return [
        ...carritoActual,
        {
          ...producto,
          cantidad: 1,
        },
      ];
    });
  };

  // ===================================================
  // AUMENTAR CANTIDAD
  // ===================================================

  const aumentarCantidad = (productoId) => {
    setCarrito((carritoActual) =>
      carritoActual.map((item) =>
        item.id === productoId
          ? { ...item, cantidad: item.cantidad + 1 }
          : item,
      ),
    );
  };

  // ===================================================
  // DISMINUIR CANTIDAD
  // ===================================================

  const disminuirCantidad = (productoId) => {
    setCarrito((carritoActual) =>
      carritoActual
        .map((item) =>
          item.id === productoId
            ? { ...item, cantidad: item.cantidad - 1 }
            : item,
        )
        // Eliminamos los productos cuya cantidad
        // llegue a cero.
        .filter((item) => item.cantidad > 0),
    );
  };

  // ===================================================
  // ELIMINAR PRODUCTO
  // ===================================================

  const eliminarDelCarrito = (productoId) => {
    // Conservamos todos los productos excepto
    // aquel que el usuario desea eliminar.
    setCarrito((carritoActual) =>
      carritoActual.filter((item) => item.id !== productoId),
    );
  };

  // ===================================================
  // VACIAR CARRITO
  // ===================================================

  const vaciarCarrito = () => {
    // Eliminamos todos los productos seleccionados.
    setCarrito([]);
  };

  // ===================================================
  // CALCULAR TOTAL
  // ===================================================

  // Multiplicamos el precio de cada producto
  // por su cantidad y sumamos los subtotales.
  const total = carrito.reduce(
    (acumulado, item) => acumulado + Number(item.precio) * item.cantidad,
    0,
  );

  // Calculamos la cantidad total de unidades.
  const cantidadTotal = carrito.reduce(
    (acumulado, item) => acumulado + item.cantidad,
    0,
  );

  // ===================================================
  // INTERFAZ
  // ===================================================

  return (
    <main className="contenedor">
      {/* Mostramos errores al registrar una compra. */}
      {errorCompra && (
        <p className="mensaje-error" role="alert">
          {errorCompra}
        </p>
      )}
      {/* Encabezado de confitería. */}
      <section className="confiteria-encabezado">
        <p className="etiqueta">Cine Wrapped</p>

        <h1>Confitería</h1>

        <p>Disfruta tus películas favoritas con nuestros popcorn y bebidas.</p>
      </section>

      {/* Mensajes de carga y errores. */}
      {cargando && <p>Cargando productos...</p>}

      {error && <p className="mensaje-error">{error}</p>}

      {!cargando && !error && (
        <>
          {/* =========================================
              CATÁLOGO DE PRODUCTOS
              ========================================= */}

          <section className="confiteria-grid">
            {productos.map((producto) => (
              <article key={producto.id} className="confiteria-tarjeta">
                <div className="confiteria-imagen">
                  {producto.categoria === "popcorn" ? "🍿" : "🥤"}
                </div>

                <div className="confiteria-info">
                  <span className="confiteria-categoria">
                    {producto.categoria === "popcorn" ? "Popcorn" : "Bebidas"}
                  </span>

                  <h2>{producto.nombre}</h2>

                  <p>{producto.descripcion}</p>

                  <strong className="confiteria-precio">
                    {formatearPrecio(producto.precio)}
                  </strong>

                  {/* Agregamos una unidad del producto
                      seleccionado al carrito. */}
                  <button
                    type="button"
                    className="boton"
                    onClick={() => agregarAlCarrito(producto)}
                  >
                    Agregar al carrito
                  </button>
                </div>
              </article>
            ))}
          </section>

          {/* =========================================
              CARRITO DE COMPRAS
              ========================================= */}

          <section className="confiteria-carrito">
            <div className="confiteria-carrito-encabezado">
              <div>
                <p className="etiqueta">Tu selección</p>

                <h2>Carrito de compras</h2>

                <p>{cantidadTotal} producto(s) seleccionado(s)</p>
              </div>

              {/* Permitimos vaciar el carrito
                  solamente cuando tiene productos. */}
              {carrito.length > 0 && (
                <button
                  type="button"
                  className="confiteria-vaciar"
                  onClick={vaciarCarrito}
                >
                  Vaciar carrito
                </button>
              )}
            </div>

            {/* Mensaje cuando todavía no hay productos. */}
            {carrito.length === 0 ? (
              <p className="confiteria-carrito-vacio">
                Tu carrito está vacío. Agrega popcorn o bebidas para comenzar.
              </p>
            ) : (
              <>
                {/* Mostramos los productos seleccionados. */}
                <div className="confiteria-carrito-lista">
                  {carrito.map((item) => (
                    <div key={item.id} className="confiteria-carrito-item">
                      <div className="confiteria-carrito-producto">
                        <span className="confiteria-carrito-icono">
                          {item.categoria === "popcorn" ? "🍿" : "🥤"}
                        </span>

                        <div>
                          <h3>{item.nombre}</h3>

                          <p>{formatearPrecio(item.precio)} por unidad</p>
                        </div>
                      </div>

                      {/* Controles para cambiar cantidad. */}
                      <div className="confiteria-cantidad">
                        <button
                          type="button"
                          aria-label={`Disminuir ${item.nombre}`}
                          onClick={() => disminuirCantidad(item.id)}
                        >
                          −
                        </button>

                        <span>{item.cantidad}</span>

                        <button
                          type="button"
                          aria-label={`Aumentar ${item.nombre}`}
                          onClick={() => aumentarCantidad(item.id)}
                        >
                          +
                        </button>
                      </div>

                      {/* Subtotal del producto. */}
                      <strong>
                        {formatearPrecio(Number(item.precio) * item.cantidad)}
                      </strong>

                      {/* Eliminamos el producto completo. */}
                      <button
                        type="button"
                        className="confiteria-eliminar"
                        onClick={() => eliminarDelCarrito(item.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>

                {/* =====================================
                    RESUMEN DEL CARRITO
                    ===================================== */}

                <div className="confiteria-resumen">
                  <div>
                    <span>Total</span>

                    <strong>{formatearPrecio(total)}</strong>
                  </div>

                  {/* Confirmamos la compra solamente cuando
    existen productos y no hay otra petición activa. */}
                  <button
                    type="button"
                    className="boton"
                    disabled={comprando || carrito.length === 0}
                    onClick={manejarConfirmarCompra}
                  >
                    {comprando ? "Procesando compra..." : "Confirmar compra"}
                  </button>
                </div>
              </>
            )}
          </section>

          {/* Mostramos la confirmación junto al carrito,
              donde el usuario acaba de comprar. */}
          {compraConfirmada && (
            <section className="confiteria-confirmacion" role="status">
              <h2>¡Compra realizada correctamente!</h2>

              <p>Tu compra simulada de confitería fue registrada.</p>

              <p>
                <strong>Número de compra:</strong> {compraConfirmada.id}
              </p>

              <p>
                <strong>Total:</strong>{" "}
                {formatearPrecio(compraConfirmada.total)}
              </p>
            </section>
          )}
        </>
      )}
    </main>
  );
}

export default Confiteria;
