// Importamos herramientas de React Router.
//
// Link permite continuar navegando.
//
// useLocation permite recuperar la entrada
// enviada desde SeleccionAsientos.
import { Link, useLocation } from "react-router-dom";

// =====================================================
// COMPRA CONFIRMADA
// =====================================================

function CompraConfirmada() {
  // Obtenemos la información asociada
  // a la navegación actual.
  const location = useLocation();

  // Recuperamos la entrada enviada después
  // de realizar POST /entradas.
  const entrada = location.state?.entrada;

  // ===================================================
  // SIN INFORMACIÓN DE COMPRA
  // ===================================================

  // Si alguien entra manualmente a esta URL
  // sin haber realizado una compra,
  // no tendremos una entrada disponible.
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
  // COMPRA EXITOSA
  // ===================================================

  return (
    <main className="contenedor">
      <section className="confirmacion-compra">
        <p className="etiqueta">Compra simulada completada</p>

        <h1>¡Entrada confirmada!</h1>

        <p>Tu entrada fue registrada correctamente.</p>

        {/* Mostramos información básica de
            la entrada creada por el backend. */}
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

            <strong>{entrada.asientos.join(", ")}</strong>
          </div>
        </div>

        {/* Después de la compra permitimos
        ir al historial o volver a cartelera. */}
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
