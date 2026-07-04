import { useEffect, useState } from "react";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/notion")
      .then((r) => r.json())
      .then((res) => setData(res.data));
  }, []);

  if (!data) return <p>Cargando...</p>;

  const { cuentas, kpis } = data;

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>💰 LifeOS Dashboard</h1>

      <h2>KPIs</h2>
      <p>Ingresos: {kpis.ingresos}</p>
      <p>Gastos: {kpis.gastos}</p>
      <p>Ahorro: {kpis.ahorro}</p>
      <p>Inversión: {kpis.inversiones}</p>
      <p>Patrimonio: {kpis.patrimonio}</p>

      <h2>Cuentas</h2>

      {cuentas.map((c) => (
        <div key={c.id}>
          <b>{c.nombre}</b><br />
          Cash: {c.cash}€<br />
          Patrimonio: {c.patrimonio}€
        </div>
      ))}
    </div>
  );
}
