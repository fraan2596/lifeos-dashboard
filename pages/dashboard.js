import { useEffect, useState } from "react";

const ACCIONES_RAPIDAS = [
  { label: "Nómina", icon: "💰", tipo: "💰Ingreso" },
  { label: "Ahorro", icon: "🎯", tipo: "🎯Ahorro" },
  { label: "Alquiler", icon: "🏠", tipo: "💸Gasto" },
  { label: "Suministros", icon: "⚡", tipo: "💸Gasto" },
  { label: "Gasolina", icon: "⛽", tipo: "💸Gasto" },
  { label: "Alimentación", icon: "🍔", tipo: "💸Gasto" },
  { label: "Suscripciones", icon: "🔁", tipo: "💸Gasto" },
  { label: "Otros", icon: "📦", tipo: "💸Gasto" },
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
  boton: { background: "#222", border: "1px solid #333", borderRadius: 10, padding: "12px 10px", color: "#f2f2f2", fontSize: 14, display: "flex", alignItems: "center", gap: 8 },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50 },
  modal: { background: "#181818", width: "100%", maxWidth: 480, borderRadius: "16px 16px 0 0", padding: 20, border: "1px solid #262626", maxHeight: "85vh", overflowY: "auto" },
  input: { width: "100%", padding: 10, borderRadius: 8, border: "1px solid #333", background: "#111", color: "#fff", marginBottom: 12, fontSize: 15 },
  label: { fontSize: 13, color: "#9a9a9a", marginBottom: 4, display: "block" },
  submitBtn: { width: "100%", padding: 12, borderRadius: 10, background: "#3b82f6", color: "#fff", border: "none", fontSize: 15, fontWeight: 600 },
  cancelBtn: { width: "100%", padding: 12, borderRadius: 10, background: "transparent", color: "#9a9a9a", border: "1px solid #333", fontSize: 15, marginTop: 8 },
  placeholderBox: { background: "#111", borderRadius: 10, padding: 16, color: "#777", fontSize: 13, textAlign: "center" },
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [modalAccion, setModalAccion] = useState(null);
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

  const abrirModal = (accion) => {
    setModalAccion(accion);
    setForm({
      concepto: accion.label,
      importe: "",
      cuentaOrigen: "",
      cuentaDestino: "",
      categoria: "",
      t
