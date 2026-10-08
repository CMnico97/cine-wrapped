// Importamos Link para poder navegar entre
// páginas sin recargar completamente el navegador.
import { Link } from "react-router-dom";

// =====================================================
// PÁGINA DE INICIO
// =====================================================

function Inicio() {
  return (
    <main className="contenedor">
      <section className="inicio">
        <p className="etiqueta">Cine Wrapped</p>

        <h1>Tu experiencia de cine en un solo lugar</h1>

        <p className="inicio-descripcion">
          Consulta la cartelera, selecciona tus funciones, elige tus asientos y
          descubre tus estadísticas personales con Cine Wrapped.
        </p>

        {/* Link funciona de manera similar a un enlace,
            pero React Router realiza la navegación
            sin recargar toda la aplicación. */}
        <Link className="boton" to="/peliculas">
          Ver cartelera
        </Link>
      </section>
    </main>
  );
}

// Exportamos la página para utilizarla
// posteriormente desde App.jsx.
export default Inicio;
