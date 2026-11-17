// Importamos herramientas de React para
// manejar estados y cargar información
// cuando se abre la página.
import { useEffect, useState } from "react";

// Link permite navegar mediante enlaces.
//
// useNavigate nos permitirá enviar al usuario
// al login si todavía no inició sesión.
import { Link, useNavigate } from "react-router-dom";

// Importamos la función que consulta
// GET /usuarios/me/entradas.
import { obtenerMisEntradas } from "../services/api";

// Importamos la función que recupera
// el JWT guardado después del login.
import { obtenerToken } from "../services/auth";

// NUEVO: menú desplegable para elegir el mes.
import SelectorMes from "../components/SelectorMes";

// =====================================================
// FUNCIONES AUXILIARES PARA AGRUPAR POR MES
// =====================================================

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

// Devuelve algo como "2026-10" a partir de la fecha de la
// función. Usamos la misma fecha que se muestra en pantalla.
const obtenerClaveMes = (fecha) => {
  const f = new Date(fecha);

  if (!fecha || Number.isNaN(f.getTime())) {
    return "sin-fecha";
  }

  return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, "0")}`;
};

// Convierte "2026-10" en "Octubre 2026".
const obtenerNombreMes = (clave) => {
  if (clave === "sin-fecha") {
    return "Sin fecha";
  }

  const [anio, mes] = clave.split("-");
  return `${MESES[Number(mes) - 1]} ${anio}`;
};

// =====================================================
// PÁGINA MIS ENTRADAS
// =====================================================

function MisEntradas() {
  // Guardamos las entradas obtenidas
  // desde nuestro backend.
  const [entradas, setEntradas] = useState([]);

  // Controlamos el estado de carga inicial.
  const [cargando, setCargando] = useState(true);

  // Guardamos posibles errores.
  const [error, setError] = useState(null);

  // NUEVO: mes que el usuario eligió para filtrar.
  // "todos" muestra todo el historial.
  const [mesElegido, setMesElegido] = useState("todos");

  // Utilizamos navigate para realizar
  // redirecciones desde JavaScript.
  const navigate = useNavigate();

  // ===================================================
  // CARGAR HISTORIAL
  // ===================================================

  useEffect(() => {
    const cargarEntradas = async () => {
      const token = obtenerToken();

      // Si no existe token, el usuario
      // todavía no ha iniciado sesión.
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const datos = await obtenerMisEntradas(token);
        setEntradas(datos.entradas || []);
      } catch (errorPeticion) {
        // Si el JWT expiró o dejó de ser válido,
        // redirigimos al usuario al login.
        if (errorPeticion.status === 401) {
          navigate("/login", { replace: true });
          return;
        }

        setError(errorPeticion.message);
      } finally {
        setCargando(false);
      }
    };

    cargarEntradas();
  }, [navigate]);

  // ===================================================
  // FORMATEAR FECHA
  // ===================================================

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-CL");
  };

  // ===================================================
  // FORMATEAR PRECIOS EN PESOS CHILENOS
  // ===================================================

  const formatearPrecio = (valor) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(Number(valor));
  };

  // ===================================================
  // ESTADO DE CARGA
  // ===================================================

  if (cargando) {
    return (
      <main className="contenedor">
        <p>Cargando tus entradas...</p>
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
  // ORDENAR Y AGRUPAR POR MES (NUEVO)
  // ===================================================

  // Primero las más recientes: por fecha de la función
  // y, si coincide, por número de entrada.
  const entradasOrdenadas = [...entradas].sort((a, b) => {
    const fechaA = new Date(a.funcion?.fecha).getTime() || 0;
    const fechaB = new Date(b.funcion?.fecha).getTime() || 0;

    return fechaB - fechaA || b.id - a.id;
  });

  // Agrupamos las entradas dentro de cada mes.
  const grupos = [];

  entradasOrdenadas.forEach((entrada) => {
    const clave = obtenerClaveMes(entrada.funcion?.fecha);
    let grupo = grupos.find((g) => g.clave === clave);

    if (!grupo) {
      grupo = { clave, entradas: [] };
      grupos.push(grupo);
    }

    grupo.entradas.push(entrada);
  });

  // Si el mes elegido ya no existe, mostramos todo.
  const mesValido =
    mesElegido === "todos" || grupos.some((g) => g.clave === mesElegido);

  const gruposVisibles =
    mesValido && mesElegido !== "todos"
      ? grupos.filter((g) => g.clave === mesElegido)
      : grupos;

  // Suma lo pagado en un grupo (ignora entradas antiguas sin total).
  const sumarTotal = (lista) =>
    lista.reduce(
      (acumulado, entrada) =>
        entrada.total != null ? acumulado + Number(entrada.total) : acumulado,
      0,
    );

  // ===================================================
  // INTERFAZ
  // ===================================================

  return (
    <main className="contenedor">
      {/* Encabezado principal de la página. */}
      <header className="encabezado">
        <p className="etiqueta">Tu historial</p>

        <h1>Mis entradas</h1>

        <p>
          Aquí puedes revisar las películas que has visto y tus entradas
          registradas.
        </p>
      </header>

      {entradas.length === 0 ? (
        <section className="sin-entradas">
          <h2>Todavía no tienes entradas</h2>

          <p>
            Cuando realices una compra simulada, aparecerá automáticamente aquí.
          </p>

          <Link className="boton" to="/peliculas">
            Ver cartelera
          </Link>
        </section>
      ) : (
        <>
          {/* =============================================
              NUEVO: MENÚ DESPLEGABLE PARA FILTRAR POR MES
              Solo aparecen los meses que tienen entradas.
              ============================================= */}
          <div className="filtro-barra">
            <p className="filtro-info">
              {mesValido && mesElegido !== "todos"
                ? `Mostrando ${obtenerNombreMes(mesElegido)}`
                : "Mostrando todo tu historial"}
            </p>

            <SelectorMes
              valor={mesValido ? mesElegido : "todos"}
              onChange={setMesElegido}
              opciones={[
                {
                  valor: "todos",
                  etiqueta: "Todos los meses",
                  cantidad: entradas.length,
                },
                ...grupos.map((grupo) => ({
                  valor: grupo.clave,
                  etiqueta: obtenerNombreMes(grupo.clave),
                  cantidad: grupo.entradas.length,
                })),
              ]}
            />
          </div>

          {/* =============================================
              LISTA DE ENTRADAS, AGRUPADAS POR MES
              ============================================= */}
          {gruposVisibles.map((grupo) => (
            <section className="mes-grupo" key={grupo.clave}>
              <div className="mes-cabecera">
                <h2 className="mes-titulo">{obtenerNombreMes(grupo.clave)}</h2>

                <p className="mes-resumen">
                  {grupo.entradas.length}{" "}
                  {grupo.entradas.length === 1 ? "entrada" : "entradas"}
                  {sumarTotal(grupo.entradas) > 0 &&
                    ` · ${formatearPrecio(sumarTotal(grupo.entradas))}`}
                </p>
              </div>

              <div className="lista-entradas">
                {grupo.entradas.map((entrada) => (
                  <article className="tarjeta-entrada" key={entrada.id}>
                    <div className="entrada-encabezado">
                      <div>
                        <p className="etiqueta">Entrada #{entrada.id}</p>

                        <h2>{entrada.pelicula?.titulo}</h2>
                      </div>

                      <span className="estado-entrada">{entrada.estado}</span>
                    </div>

                    <div className="entrada-datos">
                      <div>
                        <span>Fecha</span>

                        <strong>{formatearFecha(entrada.funcion?.fecha)}</strong>
                      </div>

                      <div>
                        <span>Hora</span>

                        <strong>{entrada.funcion?.hora?.slice(0, 5)}</strong>
                      </div>

                      <div>
                        <span>Sala</span>

                        <strong>{entrada.funcion?.sala}</strong>
                      </div>

                      <div>
                        <span>Asientos</span>

                        <strong>
                          {entrada.asientos
                            ?.map((asiento) => `${asiento.fila}${asiento.numero}`)
                            .join(", ")}
                        </strong>
                      </div>
                    </div>

                    {/* Las entradas antiguas tienen subtotal y total
                        en NULL porque se registraron antes de implementar
                        el sistema de precios. */}
                    {entrada.subtotal != null && entrada.total != null ? (
                      <div className="resumen-precios">
                        <h3>Resumen de compra</h3>

                        <div className="resumen-precio-fila">
                          <span>Cantidad de entradas</span>
                          <strong>{entrada.asientos?.length ?? 0}</strong>
                        </div>

                        <div className="resumen-precio-fila">
                          <span>Subtotal</span>
                          <strong>{formatearPrecio(entrada.subtotal)}</strong>
                        </div>

                        <div className="resumen-precio-fila">
                          <span>Descuento por puntos</span>
                          <strong>
                            -{formatearPrecio(entrada.descuento_puntos ?? 0)}
                          </strong>
                        </div>

                        <div className="resumen-precio-fila">
                          <span>Puntos utilizados</span>
                          <strong>{entrada.puntos_utilizados ?? 0}</strong>
                        </div>

                        <div className="resumen-precio-fila resumen-precio-total">
                          <span>Total pagado</span>
                          <strong>{formatearPrecio(entrada.total)}</strong>
                        </div>
                      </div>
                    ) : (
                      <div className="entrada-sin-precio">
                        <span>
                          Esta entrada fue registrada antes de implementar el
                          sistema de precios.
                        </span>
                      </div>
                    )}

                    <div className="codigo-entrada">
                      <span>Código de entrada</span>

                      <strong>{entrada.codigo}</strong>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </>
      )}

      {/* Permitimos acceder al Cine Wrapped
          o regresar a la cartelera. */}
      <div className="acciones-historial">
        <Link className="boton" to="/wrapped">
          Ver mi Cine Wrapped
        </Link>

        <Link className="boton" to="/peliculas">
          Volver a cartelera
        </Link>
      </div>
    </main>
  );
}

export default MisEntradas;
