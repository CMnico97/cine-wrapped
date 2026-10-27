// Importamos herramientas de React para manejar
// estados y ejecutar la consulta al cargar la página.
import { useEffect, useState } from "react";

// Link permite navegar mediante enlaces.
//
// useParams obtiene el id de la función.
//
// useNavigate nos permitirá redirigir al usuario
// después de realizar la compra.
import { Link, useNavigate, useParams } from "react-router-dom";

// Importamos las funciones necesarias para:
//
// 1. Obtener los asientos.
// 2. Crear la entrada.
import {
  crearEntrada,
  obtenerAsientosPorFuncion,
  obtenerMisPuntos,
} from "../services/api";

// Importamos la función que recupera
// el JWT guardado después del login.
import { obtenerToken } from "../services/auth";

// =====================================================
// SELECCIÓN DE ASIENTOS
// =====================================================

function SeleccionAsientos() {
  // Obtenemos el :id de una URL como:
  //
  // /funciones/1/asientos
  const { id } = useParams();

  // Guardamos información básica de la función.
  const [funcion, setFuncion] = useState(null);

  // Guardamos todos los asientos recibidos
  // desde Express.
  const [asientos, setAsientos] = useState([]);

  // Guardamos solamente los identificadores
  // de los asientos seleccionados por el usuario.
  const [asientosSeleccionados, setAsientosSeleccionados] = useState([]);

  // Controlamos la carga inicial.
  const [cargando, setCargando] = useState(true);

  // Guardamos posibles errores.
  const [error, setError] = useState(null);

  // Indica si actualmente estamos enviando
  // la compra al backend.
  //
  // Esto evita que el usuario presione varias veces
  // el botón mientras se procesa la operación.
  const [comprando, setComprando] = useState(false);

  // Guardamos un error específico relacionado
  // con la compra.
  const [errorCompra, setErrorCompra] = useState(null);

  // =====================================================
  // ESTADOS DEL SISTEMA DE PUNTOS
  // =====================================================

  // Saldo disponible del usuario autenticado.
  const [saldoPuntos, setSaldoPuntos] = useState(0);

  // Cantidad de puntos que desea utilizar.
  const [puntosUtilizados, setPuntosUtilizados] = useState(0);

  // Indica si estamos consultando el saldo.
  const [cargandoPuntos, setCargandoPuntos] = useState(true);

  // Guardamos errores al consultar la billetera.
  const [errorPuntos, setErrorPuntos] = useState(null);

  // React Router nos proporciona esta función
  // para redirigir al usuario.
  const navigate = useNavigate();

  // =====================================================
  // FORMATO DE PRECIOS EN PESOS CHILENOS
  // =====================================================

  // Convierte un número en un precio como $6.000.
  const formatearPrecio = (valor) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(valor);
  };

  // Obtenemos el precio individual de la función.
  // Este dato viene desde el backend.
  const precioEntrada = Number(funcion?.precio_entrada ?? 0);

  // Calculamos cuántos asientos seleccionó el usuario.
  const cantidadEntradas = asientosSeleccionados.length;

  // Calculamos el subtotal de la compra.
  const subtotal = precioEntrada * cantidadEntradas;

  // =====================================================
  // CÁLCULO DE DESCUENTOS POR PUNTOS
  // =====================================================

  // Cada punto equivale a $10 CLP.
  const VALOR_PUNTO = 10;

  // El descuento máximo es el 50% del subtotal.
  const descuentoMaximo = Math.floor(subtotal * 0.5);

  // Convertimos el descuento máximo a puntos.
  const puntosMaximosPorCompra = Math.floor(descuentoMaximo / VALOR_PUNTO);

  // El usuario solo puede utilizar los puntos
  // que tiene disponibles y los permitidos por compra.
  const puntosMaximosUtilizables = Math.min(
    saldoPuntos,
    puntosMaximosPorCompra,
  );

  // Evitamos aplicar más puntos de los permitidos
  // si el usuario cambia la cantidad de asientos.
  const puntosAplicados = Math.min(puntosUtilizados, puntosMaximosUtilizables);

  // Calculamos el descuento.
  const descuentoPuntos = puntosAplicados * VALOR_PUNTO;

  // Calculamos el total final.
  const total = subtotal - descuentoPuntos;

  // Calculamos los puntos que generaría esta compra.
  // El backend realizará nuevamente este cálculo.
  const puntosGanados = Math.floor(total / 100);

  // ===================================================
  // CARGAR ASIENTOS
  // ===================================================

  useEffect(() => {
    const cargarAsientos = async () => {
      try {
        // Consultamos los asientos reales
        // correspondientes a esta función.
        const datos = await obtenerAsientosPorFuncion(id);

        // Guardamos la información recibida.
        setFuncion(datos.funcion);
        setAsientos(datos.asientos);
      } catch (errorPeticion) {
        setError(errorPeticion.message);
      } finally {
        setCargando(false);
      }
    };

    cargarAsientos();
  }, [id]);

  // =====================================================
  // CONSULTAR SALDO DE PUNTOS
  // =====================================================

  // Consultamos los puntos al entrar a la página.
  // El usuario debe tener una sesión iniciada.
  useEffect(() => {
    let activo = true;

    const cargarPuntos = async () => {
      const token = obtenerToken();

      // Si el usuario no ha iniciado sesión,
      // no podemos consultar su billetera.
      if (!token) {
        if (activo) {
          setSaldoPuntos(0);
          setCargandoPuntos(false);
        }
        return;
      }

      try {
        // Consultamos el saldo real en MySQL
        // mediante nuestro endpoint protegido.
        const puntos = await obtenerMisPuntos(token);

        if (activo) {
          setSaldoPuntos(Number(puntos.saldo));
          setErrorPuntos(null);
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

    // Evitamos actualizar estados si el componente
    // se desmonta antes de terminar la petición.
    return () => {
      activo = false;
    };
  }, []);

  // ===================================================
  // SELECCIONAR / DESELECCIONAR ASIENTO
  // ===================================================

  const alternarAsiento = (asiento) => {
    // Nunca permitimos seleccionar un asiento
    // marcado como ocupado por el backend.
    if (!asiento.disponible) {
      return;
    }

    // Comprobamos si el asiento ya se encuentra
    // dentro de nuestra selección.
    const estaSeleccionado = asientosSeleccionados.includes(asiento.id);

    if (estaSeleccionado) {
      // Si ya estaba seleccionado,
      // lo eliminamos del arreglo.
      setAsientosSeleccionados(
        asientosSeleccionados.filter((asientoId) => asientoId !== asiento.id),
      );
    } else {
      // Si estaba disponible y todavía no había
      // sido seleccionado, lo agregamos.
      setAsientosSeleccionados([...asientosSeleccionados, asiento.id]);
    }
  };

  // ===================================================
  // REALIZAR COMPRA
  // ===================================================

  // Esta función se ejecutará cuando el usuario
  // presione el botón "Confirmar compra".
  const realizarCompra = async () => {
    // Si no existen asientos seleccionados,
    // no realizamos ninguna operación.
    if (asientosSeleccionados.length === 0) {
      return;
    }

    // Recuperamos el JWT guardado
    // cuando el usuario inició sesión.
    const token = obtenerToken();

    // Si no existe un token, enviamos al usuario
    // a la página de inicio de sesión.
    if (!token) {
      navigate("/login");
      return;
    }

    // Eliminamos cualquier mensaje de error
    // producido por una compra anterior.
    setErrorCompra(null);

    // Indicamos que comenzó el proceso de compra.
    //
    // Esto permitirá deshabilitar temporalmente
    // el botón para evitar múltiples peticiones.
    setComprando(true);

    try {
      // Enviamos al backend:
      //
      // - el identificador de la función
      // - los asientos seleccionados
      // - el JWT del usuario
      const datos = await crearEntrada(
        Number(id),
        asientosSeleccionados,
        token,
        puntosAplicados,
      );

      // Si la compra fue realizada correctamente,
      // enviamos al usuario a la página
      // de confirmación.
      navigate("/compra-confirmada", {
        // Enviamos los datos de la entrada creada
        // a la siguiente página.
        state: {
          entrada: datos.entrada,
        },
      });
    } catch (errorPeticion) {
      // Si el backend rechaza la compra,
      // mostramos el mensaje correspondiente.
      setErrorCompra(errorPeticion.message);
    } finally {
      // La petición terminó, por lo que volvemos
      // a habilitar el botón.
      setComprando(false);
    }
  };

  // ===================================================
  // ESTADO DE CARGA
  // ===================================================

  if (cargando) {
    return (
      <main className="contenedor">
        <p>Cargando asientos...</p>
      </main>
    );
  }

  // ===================================================
  // ESTADO DE ERROR
  // ===================================================

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
    <main className="contenedor">
      <header className="encabezado">
        <p className="etiqueta">Selección de asientos</p>

        <h1>Elige tus asientos</h1>

        {/* Mostramos información de la función
            que seleccionó el usuario. */}
        {/* Mostramos la sala, el horario y el precio. */}
        {funcion && (
          <div>
            <p>
              Sala {funcion.sala}
              {" · "}
              {funcion.hora.slice(0, 5)}
            </p>

            <p>
              Precio por entrada:{" "}
              <strong>{formatearPrecio(precioEntrada)}</strong>
            </p>
          </div>
        )}
      </header>

      {/* =================================================
          PANTALLA DEL CINE
          ================================================= */}

      <section className="sala-cine">
        <div className="pantalla">PANTALLA</div>

        {/* ===============================================
            ASIENTOS
            =============================================== */}

        <div className="asientos">
          {asientos.map((asiento) => {
            // Comprobamos si este asiento está
            // seleccionado actualmente.
            const seleccionado = asientosSeleccionados.includes(asiento.id);

            // Construimos las clases CSS según
            // el estado del asiento.
            let claseAsiento = "asiento";

            if (!asiento.disponible) {
              claseAsiento += " asiento-ocupado";
            } else if (seleccionado) {
              claseAsiento += " asiento-seleccionado";
            } else {
              claseAsiento += " asiento-disponible";
            }

            return (
              <button
                key={asiento.id}
                type="button"
                className={claseAsiento}
                // Un asiento ocupado queda además
                // deshabilitado a nivel HTML.
                disabled={!asiento.disponible}
                // Permitimos seleccionar o quitar
                // solamente asientos disponibles.
                onClick={() => alternarAsiento(asiento)}
              >
                {asiento.fila}
                {asiento.numero}
              </button>
            );
          })}
        </div>

        {/* ===============================================
            LEYENDA
            =============================================== */}

        <div className="leyenda-asientos">
          <span>
            <i className="leyenda disponible" />
            Disponible
          </span>

          <span>
            <i className="leyenda seleccionado" />
            Seleccionado
          </span>

          <span>
            <i className="leyenda ocupado" />
            Ocupado
          </span>
        </div>
      </section>

      {/* =================================================
          RESUMEN DE SELECCIÓN
          ================================================= */}

      <section className="resumen-asientos">
        <h2>Tu selección</h2>

        {asientosSeleccionados.length === 0 ? (
          <p>Todavía no has seleccionado asientos.</p>
        ) : (
          <>
            <p>
              Has seleccionado <strong>{asientosSeleccionados.length}</strong>{" "}
              asiento(s).
            </p>

            <div className="asientos-elegidos">
              {asientos
                .filter((asiento) => asientosSeleccionados.includes(asiento.id))
                .map((asiento) => (
                  <span key={asiento.id}>
                    {asiento.fila}
                    {asiento.numero}
                  </span>
                ))}
            </div>

            {/* =================================================
    CANJEAR PUNTOS CINE WRAPPED
    ================================================= */}

            <div className="canje-puntos">
              <h3>Tus puntos Cine Wrapped</h3>

              {cargandoPuntos ? (
                <p>Consultando tus puntos...</p>
              ) : errorPuntos ? (
                <p className="mensaje-error">{errorPuntos}</p>
              ) : (
                <>
                  {/* Mostramos el saldo del usuario. */}
                  <p>
                    Puntos disponibles: <strong>{saldoPuntos}</strong>
                  </p>

                  <p>
                    Cada punto equivale a $10 de descuento. Puedes descontar
                    hasta el 50% de tu compra.
                  </p>

                  {/* El usuario puede elegir cuántos puntos canjear. */}
                  <label htmlFor="puntos-canje">
                    Puntos que deseas utilizar
                  </label>

                  <input
                    id="puntos-canje"
                    type="number"
                    min="0"
                    max={puntosMaximosUtilizables}
                    step="1"
                    value={puntosAplicados}
                    onChange={(evento) => {
                      const valor = Number(evento.target.value);

                      // Solo permitimos enteros dentro del límite.
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

            {/* =================================================
    RESUMEN ECONÓMICO DE LA COMPRA
    ================================================= */}

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

              <div className="resumen-precio-fila resumen-precio-total">
                <span>Total a pagar</span>
                <strong>{formatearPrecio(total)}</strong>
              </div>
              {/* Mostramos los puntos que generaría la compra. */}
              <div className="resumen-precio-fila">
                <span>Puntos que ganarás</span>
                <strong>+{puntosGanados}</strong>
              </div>
            </div>
          </>
        )}

        {/* Si la compra produce algún error,
    lo mostramos antes del botón. */}
        {errorCompra && <p className="mensaje-error">{errorCompra}</p>}

        {/* Este botón ahora ejecuta realmente
    POST /entradas. */}
        <button
          type="button"
          className="boton boton-compra"
          // Ejecutamos la compra al hacer clic.
          onClick={realizarCompra}
          // Deshabilitamos el botón cuando:
          // - No hay asientos seleccionados.
          // - Se está procesando una compra.
          // - Se están consultando los puntos.
          // - Ocurrió un error al consultar los puntos.
          disabled={
            asientosSeleccionados.length === 0 ||
            comprando ||
            cargandoPuntos ||
            Boolean(errorPuntos)
          }
        >
          {comprando ? "Confirmando..." : "Confirmar compra"}
        </button>
      </section>
    </main>
  );
}

export default SeleccionAsientos;
