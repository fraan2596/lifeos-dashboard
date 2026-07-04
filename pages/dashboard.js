import { useEffect, useState } from "react";

const ACCIONES_RAPIDAS = [
  { label: "Nómina", icon: "💰", tipo: "💰Ingreso", categoriaNombre: "Nómina" },
  { label: "Ahorro", icon: "🎯", tipo: "🎯Ahorro", categoriaNombre: null },
  { label: "Alquiler", icon: "🏠", tipo: "💸Gasto", categoriaNombre: "Alquiler" },
  {
    label: "Suministros",
    icon: "⚡",
    tipo: "💸Gasto",
    submenu: [
      { label: "Luz", icon: "💡", categoriaNombre: "Luz" },
      { label: "Agua", icon: "🚰", categoriaNombre: "Agua" },
      { label: "Gas", icon: "🔥", categoriaNombre: "Gas" },
      { label: "Internet", icon: "🌐", categoriaNombre: "Internet" },
    ],
  },
  { label: "Gasolina", icon: "⛽", tipo: "💸Gasto", categoriaNombre: "Gasolina" },
  { label: "Alimentación", icon: "🍔", tipo: "💸Gasto", categoriaNombre: "Alimentación" },
  {
    label: "Suscripciones",
    icon: "🔁",
    tipo: "💸Gasto",
    submenu: [
      { label: "Netflix", icon: "🎬", categoriaNombre: "Netflix" },
      { label: "HBO", icon: "📺", categoriaNombre: "HBO" },
      { label: "Disney", icon: "🏰", categoriaNombre: "Disney" },
    ],
  },
  { label: "Otros", icon: "📦", tipo: "💸Gasto", categoriaNombre: null },
];

const TIPOS = ["💰Ingreso", "💸Gasto", "🎯Ahorro", "📈Inversión", "🔁Transferencia"];

const styles = {
  page: { background: "#0d0d0d", minHeight: "100vh", color: "#f2f2f2", fontFamily: "system-ui, sans-serif", padding: "24px 16px 80px" },
  h1: { fontSize: 26, marginBottom: 4 },
  sub: { color: "#9a9a9a", marginBottom: 24, fontSize: 14 },
  section: { background: "#181818", borderRadius: 14, padding: 16, marginBottom: 16, border: "1px solid #262626" },
  sectionTitle: { fontSize: 17, fontWeight: 600, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 },
  kpiGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  kpiCard: { background: "#111", borderRadius: 10, padding: 12 },
  kpiLabel: { fontSize: 12, color: "#9a9a9a" },
  kpiValue: { fontSize: 18, fontWeight: 700, marginTop: 2 },
  cuenta: { background: "#111", borderRadius: 10, padding: 12, marginBottom: 8 },
  cuentaNombre: { fontWeight: 600, marginBottom: 4 },
  cuentaLinea: { fontSize: 13, color: "#c7c7c7" },
  botonesGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  boton: { background: "#222", border: "1px solid #333", borderRadius: 10, padding: "12px 10px", color: "#f2f2f2", fontSize: 14, display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left" },
  botonActivo: { background: "#2c3e5f", border: "1px solid #3b82f6", borderRadius: 10, padding: "12px 10px", color: "#f2f2f2", fontSize: 14, display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left" },
  submenuBox: { gridColumn: "1 / -1", display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4, marginBottom: 4, paddingLeft: 4 },
  subChip: { background: "#111", border: "1px solid #333", borderRadius: 20, padding: "8px 14px", color: "#f2f2f2", fontSize: 13, display: "flex", alignItems: "center", gap: 6 },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50 },
  modal: { background: "#181818", width: "100%", maxWidth: 480, borderRadius: "16px 16px 0 0", padding: 20, border: "1px solid #262626", maxHeight: "85vh", overflowY: "auto" },
  input: { width: "100%", padding: 10, borderRadius: 8, border: "1px solid #333", background: "#111", color: "#fff", marginBottom: 12, fontSize: 15 },
  label: { fontSize: 13, color: "#9a9a9a", marginBottom: 4, display: "block" },
  submitBtn: { width: "100%", padding: 12, borderRadius: 10, background: "#3b82f6", color: "#fff", border: "none", fontSize: 15, fontWeight: 600 },
  cancelBtn: { width: "100%", padding: 12, borderRadius: 10, background: "transparent", color: "#9a9a9a", border: "1px solid #333", fontSize: 15, marginTop: 8 },
  placeholderBox: { background: "#111", borderRadius: 10, padding: 16, color: "#777", fontSize: 13, textAlign: "center" },
};

function encontrarCategoriaId(nombre, categorias) {
  if (!nombre || !categorias) return "";
  const encontrada = categorias.find(
    (c) => c.categoria?.trim().toLowerCase() === nombre.trim().toLowerCase()
  );
  return encontrada ? encontrada.id : "";
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [modalAccion, setModalAccion] = useState(null);
  const [submenuAbierto, setSubmenuAbierto] = useState(null);
  const [form, setForm] = useState({
    concepto: "",
    importe: "",
    cuentaOrigen: "",
    cuentaDestino: "",
    categoria: "",
    tipo: "",
    fecha: "",
  });
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const cargarDatos = () => {
    fetch("/api/notion")
      .then((r) => r.json())
      .then((res) => setData(res.data));
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const abrirModal = (label, icon, tipo, categoriaNombre) => {
    const categoriaId = encontrarCategoriaId(categoriaNombre, data.categorias);
    setModalAccion({ label, icon, tipo });
    setForm({
      concepto: label,
      importe: "",
      cuentaOrigen: "",
      cuentaDestino: "",
      categoria: categoriaId,
      tipo,
      fecha: new Date().toISOString().split("T")[0],
    });
    setMensaje("");
    setSubmenuAbierto(null);
  };

  const tocarAccion = (accion) => {
    if (accion.submenu) {
      setSubmenuAbierto(submenuAbierto === accion.label ? null : accion.label);
    } else {
      abrirModal(accion.label, accion.icon, accion.tipo, accion.categoriaNombre);
    }
  };

  const cerrarModal = () => setModalAccion(null);

  const necesitaDestino =
    form.tipo === "🔁Transferencia" ||
    form.tipo === "🎯Ahorro" ||
    form.tipo === "📈Inversión";

  const enviarMovimiento = async () => {
    if (!form.importe || !form.cuentaOrigen || !form.tipo) {
      setMensaje("Rellena importe, tipo y cuenta");
      return;
    }
    setEnviando(true);
    setMensaje("");
    try {
      const res = await fetch("/api/add-movimiento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concepto: form.concepto,
          importe: form.importe,
          tipo: form.tipo,
          fecha: form.fecha,
          cuentaOrigen: form.cuentaOrigen,
          cuentaDestino: form.cuentaDestino || null,
          categoria: form.categoria || null,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setMensaje("✅ Guardado");
        cargarDatos();
        setTimeout(cerrarModal, 700);
      } else {
        setMensaje("❌ " + json.error);
      }
    } catch (e) {
      setMensaje("❌ Error de red");
    }
    setEnviando(false);
  };

  if (!data) {
    return (
      <div style={{ ...styles.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
        Cargando...
      </div>
    );
  }

  const { cuentas, categorias, kpis } = data;

  return (
    <div style={styles.page}>
      <h1 style={styles.h1}>💎 LifeOS Finance</h1>
      <p style={styles.sub}>Tu centro de control de finanzas personales</p>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>⚡ Acciones rápidas</div>
        <div style={styles.botonesGrid}>
          {ACCIONES_RAPIDAS.map((a) => (
            <div key={a.label} style={{ display: "contents" }}>
              <button
                style={submenuAbierto === a.label ? styles.botonActivo : styles.boton}
                onClick={() => tocarAccion(a)}
              >
                <span>{a.icon}</span> {a.label} {a.submenu ? (submenuAbierto === a.label ? "▲" : "▼") : ""}
              </button>
              {a.submenu && submenuAbierto === a.label && (
                <div style={styles.submenuBox}>
                  {a.submenu.map((s) => (
                    <button
                      key={s.label}
                      style={styles.subChip}
                      onClick={() => abrirModal(s.label, s.icon, a.tipo, s.categoriaNombre)}
                    >
                      <span>{s.icon}</span> {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>💰 Resumen</div>
        <div style={styles.kpiGrid}>
          <div style={styles.kpiCard}>
            <div style={styles.kpiLabel}>Ingresos</div>
            <div style={styles.kpiValue}>{kpis.ingresos}€</div>
          </div>
          <div style={styles.kpiCard}>
            <div style={styles.kpiLabel}>Gastos</div>
            <div style={styles.kpiValue}>{kpis.gastos}€</div>
          </div>
          <div style={styles.kpiCard}>
            <div style={styles.kpiLabel}>Ahorro</div>
            <div style={styles.kpiValue}>{kpis.ahorro}€</div>
          </div>
          <div style={styles.kpiCard}>
            <div style={styles.kpiLabel}>Inversión</div>
            <div style={styles.kpiValue}>{kpis.inversiones}€</div>
          </div>
          <div style={{ ...styles.kpiCard, gridColumn: "1 / -1" }}>
            <div style={styles.kpiLabel}>Patrimonio total</div>
            <div style={{ ...styles.kpiValue, fontSize: 22 }}>{kpis.patrimonio.toFixed(2)}€</div>
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>🏦 Mis cuentas</div>
        {cuentas.map((c) => (
          <div key={c.id} style={styles.cuenta}>
            <div style={styles.cuentaNombre}>{c.nombre}</div>
            <div style={styles.cuentaLinea}>Cash: {c.cash}€ · Patrimonio: {c.patrimonio}€</div>
          </div>
        ))}
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>🎯 Objetivos</div>
        <div style={styles.placeholderBox}>Aún no conectado — pásame el ID de esta base de datos de Notion</div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>📈 Inversiones y activos</div>
        <div style={styles.placeholderBox}>Aún no conectado — pásame el ID de esta base de datos de Notion</div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>💳 Préstamos</div>
        <div style={styles.placeholderBox}>Aún no conectado — pásame el ID de esta base de datos de Notion</div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>🔁 Suscripciones</div>
        <div style={styles.placeholderBox}>Aún no conectado — pásame el ID de esta base de datos de Notion</div>
      </div>

      {modalAccion && (
        <div style={styles.overlay} onClick={cerrarModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>
              {modalAccion.icon} {modalAccion.label}
            </h3>

            <label style={styles.label}>Concepto</label>
            <input
              style={styles.input}
              value={form.concepto}
              onChange={(e) => setForm({ ...form, concepto: e.target.value })}
            />

            <label style={styles.label}>Tipo</label>
            <select
              style={styles.input}
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            >
              {TIPOS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <label style={styles.label}>Importe (€)</label>
            <input
              style={styles.input}
              type="number"
              value={form.importe}
              onChange={(e) => setForm({ ...form, importe: e.target.value })}
            />

            <label style={styles.label}>Cuenta {necesitaDestino ? "origen" : ""}</label>
            <select
              style={styles.input}
              value={form.cuentaOrigen}
              onChange={(e) => setForm({ ...form, cuentaOrigen: e.target.value })}
            >
              <option value="">Selecciona una cuenta</option>
              {cuentas.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>

            {necesitaDestino && (
              <>
                <label style={styles.label}>Cuenta destino</label>
                <select
                  style={styles.input}
                  value={form.cuentaDestino}
                  onChange={(e) => setForm({ ...form, cuentaDestino: e.target.value })}
                >
                  <option value="">Selecciona una cuenta</option>
                  {cuentas.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </>
            )}

            <label style={styles.label}>Categoría</label>
            <select
              style={styles.input}
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
            >
              <option value="">Selecciona una categoría</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.categoria || "(sin nombre)"}</option>
              ))}
            </select>

            <label style={styles.label}>Fecha</label>
            <input
              style={styles.input}
              type="date"
              value={form.fecha}
              onChange={(e) => setForm({ ...form, fecha: e.target.value })}
            />

            {mensaje && <p style={{ fontSize: 13, marginBottom: 8 }}>{mensaje}</p>}

            <button style={styles.submitBtn} onClick={enviarMovimiento} disabled={enviando}>
              {enviando ? "Guardando..." : "Guardar movimiento"}
            </button>
            <button style={styles.cancelBtn} onClick={cerrarModal}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}
