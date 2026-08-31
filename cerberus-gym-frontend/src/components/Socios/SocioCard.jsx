import "./Socios.css";

export default function SocioCard({ socio, onClick }) {
  const iniciales = `${socio.nombre[0] ?? ""}${socio.apellido[0] ?? ""}`.toUpperCase();

  return (
    <button className="socio-card" onClick={() => onClick?.(socio)}>
      <div className="socio-card-foto">
        {socio.foto ? (
          <img src={socio.foto} alt="" />
        ) : (
          <span aria-hidden="true">{iniciales}</span>
        )}
      </div>
      <p className="socio-card-nombre">
        {socio.nombre} {socio.apellido}
      </p>
      <p className="socio-card-dni">DNI: {socio.dni}</p>
    </button>
  );
}
