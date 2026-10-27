import { useEffect, useState } from "react";

// Importamos el servicio que obtiene los productos
// disponibles desde nuestra API de Express.
import {
  obtenerProductosConfiteria,
  crearCompraConfiteria,
  obtenerMisPuntos,
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
  // ESTADOS DEL SISTEMA DE PUNTOS
  // =====================================================

  // Saldo disponible del usuario autenticado.
  const [saldoPuntos, setSaldoPuntos] = useState(0);

  // Puntos que el usuario desea utilizar.
  const [puntosUtilizados, setPuntosUtilizados] = useState(0);

  // Indica si estamos consultando la billetera.
  const [cargandoPuntos, setCargandoPuntos] = useState(false);

  // Guarda los errores al consultar los puntos.
  const [errorPuntos, setErrorPuntos] = useState(null);

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
      // Enviamos los productos y los puntos elegidos.
      //
      // El backend calcula nuevamente los precios,
      // valida el saldo y registra la compra.
      const resultado = await crearCompraConfiteria(
        productosCompra,
        token,
        puntosAplicados,
      );

      // Guardamos la información de la compra realizada.
      setCompraConfirmada(resultado.compra);

      // Vaciamos el carrito únicamente después
      // de que el backend confirme la compra.
      setCarrito([]);
      // Actualizamos el saldo utilizando los valores
      // confirmados por el backend.
      //
      // Saldo final = saldo anterior - puntos utilizados
      //               + puntos ganados.
      setSaldoPuntos(
        (saldoActual) =>
          saldoActual -
          Number(resultado.compra.puntos_utilizados) +
          Number(resultado.compra.puntos_ganados),
      );

      // Reiniciamos el selector para la próxima compra.
      setPuntosUtilizados(0);
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

  // =====================================================
  // CONSULTAR SALDO DE PUNTOS
  // =====================================================

  useEffect(() => {
    // La confitería es pública, por lo que no
    // redirigimos a usuarios sin sesión.
    if (!estaAutenticado()) {
      return;
    }

    let activo = true;

    const cargarPuntos = async () => {
      setCargandoPuntos(true);
      setErrorPuntos(null);

      try {
        // Recuperamos el JWT de la sesión.
        const token = obtenerToken();

        // Consultamos el saldo real en MySQL.
        const puntos = await obtenerMisPuntos(token);

        if (activo) {
          setSaldoPuntos(Number(puntos.saldo));
        }
      } catch (errorPeticion) {
        if (activo) {
          setSaldoPuntos(0);
          setErrorPuntos(errorPeticion.message);
        }
      } finally {
        if (activo) {
          setCargandoPuntos(false);
        }
      }
    };

    cargarPuntos();

    // Evitamos actualizar el componente
    // después de salir de la página.
    return () => {
      activo = false;
    };
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

  // =====================================================
  // CALCULAR SUBTOTAL Y DESCUENTO POR PUNTOS
  // =====================================================

  // Calculamos el precio original del carrito.
  const subtotal = carrito.reduce(
    (acumulado, item) => acumulado + Number(item.precio) * item.cantidad,
    0,
  );

  // Cada punto equivale a $10 de descuento.
  const VALOR_PUNTO = 10;

  // El descuento máximo permitido es del 50%.
  const descuentoMaximo = Math.floor(subtotal * 0.5);

  // Convertimos el descuento máximo a puntos.
  const puntosMaximosPorCompra = Math.floor(descuentoMaximo / VALOR_PUNTO);

  // El usuario no puede gastar más puntos
  // de los disponibles ni superar el límite.
  const puntosMaximosUtilizables = Math.min(
    saldoPuntos,
    puntosMaximosPorCompra,
  );

  // Ajustamos los puntos aplicados si cambia el carrito.
  const puntosAplicados = Math.min(puntosUtilizados, puntosMaximosUtilizables);

  // Calculamos el descuento en pesos.
  const descuentoPuntos = puntosAplicados * VALOR_PUNTO;

  // Calculamos el monto final.
  const total = subtotal - descuentoPuntos;

  // Calculamos los puntos que generaría la compra.
  // El backend volverá a calcularlos y validarlos.
  const puntosGanados = Math.floor(total / 100);

  // =====================================================
  // CALCULAR CANTIDAD TOTAL DE PRODUCTOS
  // =====================================================

  // Sumamos las cantidades de todos los productos
  // que el usuario agregó al carrito.
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

                {/* =================================================
    CANJEAR PUNTOS CINE WRAPPED
    ================================================= */}

                <div className="canje-puntos">
                  <h3>Tus puntos Cine Wrapped</h3>

                  {!estaAutenticado() ? (
                    // El catálogo es público, pero comprar requiere login.
                    <p>Inicia sesión para acumular y utilizar puntos.</p>
                  ) : cargandoPuntos ? (
                    <p>Consultando tus puntos...</p>
                  ) : errorPuntos ? (
                    <p className="mensaje-error" role="alert">
                      {errorPuntos}
                    </p>
                  ) : (
                    <>
                      {/* Saldo disponible del usuario. */}
                      <p>
                        Puntos disponibles: <strong>{saldoPuntos}</strong>
                      </p>

                      <p>
                        Cada punto equivale a $10 de descuento. Puedes descontar
                        hasta el 50% de tu compra.
                      </p>

                      {/* Campo para seleccionar los puntos. */}
                      <label htmlFor="puntos-confiteria">
                        Puntos que deseas utilizar
                      </label>

                      <input
                        id="puntos-confiteria"
                        type="number"
                        min="0"
                        max={puntosMaximosUtilizables}
                        step="1"
                        value={puntosAplicados}
                        disabled={comprando}
                        onChange={(evento) => {
                          const valor = Number(evento.target.value);

                          // Solo aceptamos números enteros
                          // dentro del máximo permitido.
                          if (Number.isSafeInteger(valor)) {
                            setPuntosUtilizados(
                              Math.max(
                                0,
                                Math.min(valor, puntosMaximosUtilizables),
                              ),
                            );
                          }
                        }}
                      />

                      <p>
                        Máximo permitido en esta compra:{" "}
                        <strong>{puntosMaximosUtilizables} puntos</strong>
                      </p>

                      <p>
                        Descuento aplicado:{" "}
                        <strong>{formatearPrecio(descuentoPuntos)}</strong>
                      </p>
                    </>
                  )}
                </div>

                <div className="confiteria-resumen">
                  {/* Precio original de los productos. */}
                  <div>
                    <span>Subtotal</span>
                    <strong>{formatearPrecio(subtotal)}</strong>
                  </div>

                  {/* Descuento aplicado mediante puntos. */}
                  <div>
                    <span>Descuento por puntos</span>
                    <strong>-{formatearPrecio(descuentoPuntos)}</strong>
                  </div>

                  {/* Total final que pagará el usuario. */}
                  <div>
                    <span>Total a pagar</span>
                    <strong>{formatearPrecio(total)}</strong>
                  </div>

                  {/* Puntos que se acumularán por esta compra. */}
                  <div>
                    <span>Puntos que ganarás</span>
                    <strong>+{puntosGanados}</strong>
                  </div>

                  {/* Confirmamos la compra solamente cuando
    existen productos y no hay otra petición activa. */}
                  <button
                    type="button"
                    className="boton"
                    disabled={
                      comprando ||
                      carrito.length === 0 ||
                      (estaAutenticado() &&
                        (cargandoPuntos || Boolean(errorPuntos)))
                    }
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

              {/* Identificador de la compra registrada en MySQL. */}
              <p>
                <strong>Número de compra:</strong> {compraConfirmada.id}
              </p>

              {/* Total final pagado después del descuento. */}
              <p>
                <strong>Total pagado:</strong>{" "}
                {formatearPrecio(compraConfirmada.total)}
              </p>

              {/* Cantidad de puntos canjeados. */}
              <p>
                <strong>Puntos utilizados:</strong>{" "}
                {compraConfirmada.puntos_utilizados}
              </p>

              {/* Descuento aplicado mediante puntos. */}
              <p>
                <strong>Descuento por puntos:</strong>{" "}
                {formatearPrecio(compraConfirmada.descuento_puntos)}
              </p>

              {/* Puntos acumulados por la compra realizada. */}
              <p>
                <strong>Puntos ganados:</strong> +
                {compraConfirmada.puntos_ganados}
              </p>
            </section>
          )}
        </>
      )}
    </main>
  );
}

export default Confiteria;
