// =====================================================
// FOCOS DE LA SALA
// =====================================================
// Dibuja 4 focos a cada lado de la pantalla, apuntando
// hacia el centro. Entre foco y foco queda sombra.
//
// Solo se muestra en las páginas "de sala" (película y
// asientos). Todo el estilo está en tema.css.
// La intensidad se cambia con --luz en tema.css.

const POSICIONES = [0, 1, 2, 3];

function Focos() {
  return (
    <div className="focos" aria-hidden="true">
      {["izquierda", "derecha"].map((lado) =>
        POSICIONES.map((i) => (
          <div key={`${lado}-${i}`} className={`foco foco-${lado}`} style={{ "--i": i }}>
            <span className="foco-lampara" />
          </div>
        )),
      )}
    </div>
  );
}

export default Focos;
