import { Link, useLocation } from "react-router-dom";

// =====================================================
// COMPRA CONFIRMADA
// =====================================================

function CompraConfirmada() {
  // Recuperamos los datos enviados desde
  // SeleccionAsientos después de confirmar la compra.
  const location = useLocation();

  // La entrada contiene los datos registrados
  // por el backend, incluyendo los precios.
  const entrada = location.state?.entrada;

  // ===================================================
  // FORMATEAR PRECIOS EN PESOS CHILENOS
  // ===================================================

  // Convierte valores como 12000 en $12.000.
  const formatearPrecio = (valor) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(Number(valor));
  };

  // ===================================================
  // SIN INFORMACIÓN DE COMPRA
  // ===================================================

  // Si el usuario accede directamente a esta URL,
  // no tendremos datos de una compra reciente.
  if (!entrada) {
    return (
      <main className="contenedor">
        <section className="confirmacion-compra">
          <h1>No hay una compra para mostrar</h1>

          <p>Puedes volver a la cartelera para seleccionar una película.</p>

          <Link className="boton" to="/peliculas">
            Volver a cartelera
          </Link>
        </section>
      </main>
    );
  }

  // ===================================================
  // DATOS ECONÓMICOS DE LA COMPRA
  // ===================================================

  // Estos valores provienen del backend.
  // No recalculamos el precio de la compra,
  // porque ya fue registrado en MySQL.
  const precioEntrada = Number(entrada.precio_entrada ?? 0);
  const cantidadEntradas = Number(
    entrada.cantidad_entradas ?? entrada.asientos?.length ?? 0,
  );

  const subtotal = Number(entrada.subtotal ?? 0);
  const descuentoPuntos = Number(entrada.descuento_puntos ?? 0);
  const puntosUtilizados = Number(entrada.puntos_utilizados ?? 0);
  const total = Number(entrada.total ?? 0);

  // ===================================================
  // COMPRA EXITOSA
  // ===================================================

  return (
    <main className="contenedor">
      <section className="confirmacion-compra">
        <p className="etiqueta">Compra simulada completada</p>

        <h1>¡Entrada confirmada!</h1>

        <p>Tu entrada fue registrada correctamente.</p>

        {/* =============================================
            INFORMACIÓN DE LA ENTRADA
            ============================================= */}

        <div className="entrada-confirmada">
          <div>
            <span>Código de entrada</span>
            <strong>{entrada.codigo}</strong>
          </div>

          <div>
            <span>Función</span>
            <strong>#{entrada.funcion_id}</strong>
          </div>

          <div>
            <span>Estado</span>
            <strong>{entrada.estado}</strong>
          </div>

          <div>
            <span>Asientos</span>
            <strong>{entrada.asientos?.join(", ") ?? "Sin asientos"}</strong>
          </div>
        </div>

        {/* =============================================
            RESUMEN ECONÓMICO
            ============================================= */}

        <div className="resumen-precios">
          <h3>Resumen de compra</h3>

          <div className="resumen-precio-fila">
            <span>Precio por entrada</span>
            <strong>{formatearPrecio(precioEntrada)}</strong>
          </div>

          <div className="resumen-precio-fila">
            <span>Cantidad de entradas</span>
            <strong>{cantidadEntradas}</strong>
          </div>

          <div className="resumen-precio-fila">
            <span>Subtotal</span>
            <strong>{formatearPrecio(subtotal)}</strong>
          </div>

          <div className="resumen-precio-fila">
            <span>Descuento por puntos</span>
            <strong>{formatearPrecio(descuentoPuntos)}</strong>
          </div>

          <div className="resumen-precio-fila">
            <span>Puntos utilizados</span>
            <strong>{puntosUtilizados}</strong>
          </div>

          <div className="resumen-precio-fila resumen-precio-total">
            <span>Total pagado</span>
            <strong>{formatearPrecio(total)}</strong>
          </div>
        </div>

        {/* =============================================
            ACCIONES
            ============================================= */}

        <div className="acciones-confirmacion">
          <Link className="boton" to="/mis-entradas">
            Ver mis entradas
          </Link>

          <Link className="boton" to="/peliculas">
            Volver a cartelera
          </Link>
        </div>
      </section>
    </main>
  );
}

export default CompraConfirmada;
