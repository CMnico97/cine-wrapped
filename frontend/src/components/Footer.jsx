// Pie de página: marca, contacto y línea final.
// Los datos de contacto son de ejemplo: cámbialos por los que quieras.
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <h3 className="footer-marca">CINE WRAPPED</h3>
          <p>Tu experiencia de cine en un solo lugar.</p>
        </div>

        <div>
          <h4>Contacto</h4>
          <p>contacto@cinewrapped.cl</p>
          <p>+56 9 1234 5678</p>
          <p>Av. Ejemplo 123, Santiago</p>
        </div>
      </div>

      <p className="footer-final">
        © 2026 Cine Wrapped · Proyecto académico Duoc UC
      </p>
    </footer>
  );
}
