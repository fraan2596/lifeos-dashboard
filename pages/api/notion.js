import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const DATABASES = {
  cuentas: "39269496-804b-8036-9e2d-c8b25134ee2d",
  categorias: "38c69496-804b-80ca-b88b-c8a1759f4529",
  movimientos: "38c69496-804b-80f1-a428-e506fc346c7c",
  presupuestos: "38f69496-804b-80a6-8a42-f34225e8acf9",
};

/* =========================
   FETCH PAGINADO
========================= */
async function obtenerTodos(databaseId) {
  let resultados = [];
  let cursor = undefined;

  do {
    const res = await notion.databases.query({
      database_id: databaseId,
      page_size: 100,
      start_cursor: cursor,
    });

    resultados.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);

  return resultados;
}

/* =========================
   HELPERS
========================= */
const titulo = (p) => p?.title?.[0]?.plain_text ?? "";
const texto = (p) => p?.rich_text?.[0]?.plain_text ?? "";
const numero = (p) => p?.number ?? 0;
const formulaNumero = (p) => p?.formula?.number ?? 0;
const seleccion = (p) => p?.select?.name ?? "";
const fecha = (p) => p?.date?.start ?? null;

/* =========================
   CORE
========================= */
async function cargarLifeOS() {
  const [
    cuentasRaw,
    categoriasRaw,
    movimientosRaw,
    presupuestosRaw,
  ] = await Promise.all([
    obtenerTodos(DATABASES.cuentas),
    obtenerTodos(DATABASES.categorias),
    obtenerTodos(DATABASES.movimientos),
    obtenerTodos(DATABASES.presupuestos),
  ]);

  /* =========================
     CUENTAS BASE
  ========================= */
  const cuentas = cuentasRaw.map((c) => ({
    id: c.id,
    nombre: titulo(c.properties["Nombre"]),
    entidad: texto(c.properties["Entidad"]),
    tipo: seleccion(c.properties["Tipo"]),
    saldoInicial: numero(c.properties["Saldo inicial"]),
    saldoActual: formulaNumero(c.properties["Saldo Actual"]),
    bancoPrincipal: c.properties["Banco principal"]?.checkbox ?? false,
  }));

  /* =========================
     CATEGORÍAS
  ========================= */
  const categorias = categoriasRaw.map((cat) => ({
    id: cat.id,
    categoria: titulo(cat.properties["Categoría"]),
  }));

  /* =========================
     MOVIMIENTOS (TU MODELO)
  ========================= */
  const movimientos = movimientosRaw.map((mov) => ({
    id: mov.id,

    concepto: titulo(mov.properties["Concepto"]),

    importe: numero(mov.properties["Importe"]),

    tipo: seleccion(mov.properties["Tipo"]),

    fecha: fecha(mov.properties["Fecha"]),

    cuentaOrigen:
      mov.properties["Cuenta origen"]?.relation?.[0]?.id ?? null,

    cuentaDestino:
      mov.properties["Cuenta destino"]?.relation?.[0]?.id ?? null,

    categoria:
      mov.properties["Categoría"]?.relation?.[0]?.id ?? null,

    grupo:
      mov.properties["Grupos"]?.rollup?.array ?? [],

    esRecurrente:
      mov.properties["Recurrente"]?.checkbox ?? false,
  }));

  /* =========================
     PRESUPUESTOS
  ========================= */
  const presupuestos = presupuestosRaw.map((pre) => ({
    id: pre.id,
    nombre: titulo(pre.properties["Nombre"]),
    categoria:
      pre.properties["Categoria"]?.relation?.[0]?.id ?? null,
    limite: numero(pre.properties["Límite"]),
    gastado: formulaNumero(pre.properties["Gastado"]) ?? 0,
    periodo: seleccion(pre.properties["Periodo"]),
  }));

  /* =========================
     KPIs GLOBALS
  ========================= */
  const ingresos = movimientos
    .filter((m) => m.tipo === "💰Ingreso")
    .reduce((acc, m) => acc + m.importe, 0);

  const gastos = movimientos
    .filter((m) => m.tipo === "💸Gasto")
    .reduce((acc, m) => acc + m.importe, 0);

  const ahorro = movimientos
    .filter((m) => m.tipo === "🎯Ahorro")
    .reduce((acc, m) => acc + m.importe, 0);

  const inversiones = movimientos
    .filter((m) => m.tipo === "📈Inversión")
    .reduce((acc, m) => acc + m.importe, 0);

  const transfers = movimientos
    .filter((m) => m.tipo === "🔁Transferencia")
    .reduce((acc, m) => acc + m.importe, 0);

  const patrimonioGlobal = cuentas.reduce(
    (acc, c) => acc + (c.saldoActual || 0),
    0
  );

  /* =========================
     💳 SISTEMA POR CUENTAS (CASH + PATRIMONIO)
  ========================= */
  const cuentasMap = {};

  cuentas.forEach((c) => {
    cuentasMap[c.id] = {
      id: c.id,
      nombre: c.nombre,
      entidad: c.entidad,
      tipo: c.tipo,
      saldoInicial: c.saldoInicial,
      cash: c.saldoInicial,
      patrimonio: c.saldoInicial,
    };
  });

  for (const m of movimientos) {
    const o = m.cuentaOrigen;
    const d = m.cuentaDestino;

    // INGRESOS
    if (m.tipo === "💰Ingreso") {
      if (o && cuentasMap[o]) {
        cuentasMap[o].cash += m.importe;
        cuentasMap[o].patrimonio += m.importe;
      }
    }

    // GASTOS
    if (m.tipo === "💸Gasto") {
      if (o && cuentasMap[o]) {
        cuentasMap[o].cash -= m.importe;
        cuentasMap[o].patrimonio -= m.importe;
      }
    }

    // TRANSFERENCIAS
    if (m.tipo === "🔁Transferencia") {
      if (o && cuentasMap[o]) {
        cuentasMap[o].cash -= m.importe;
      }
      if (d && cuentasMap[d]) {
        cuentasMap[d].cash += m.importe;
      }
    }

    // AHORRO
    if (m.tipo === "🎯Ahorro") {
      if (o && cuentasMap[o]) {
        cuentasMap[o].cash -= m.importe;
        cuentasMap[o].patrimonio += m.importe;
      }
      if (d && cuentasMap[d]) {
        cuentasMap[d].patrimonio += m.importe;
      }
    }

    // INVERSION
    if (m.tipo === "📈Inversión") {
      if (o && cuentasMap[o]) {
        cuentasMap[o].cash -= m.importe;
      }
      if (d && cuentasMap[d]) {
        cuentasMap[d].patrimonio += m.importe;
      }
    }
  }

  const cuentasFinal = Object.values(cuentasMap);

  /* =========================
     RETURN FINAL
  ========================= */
  return {
    cuentas: cuentasFinal,
    categorias,
    movimientos,
    presupuestos,

    kpis: {
      ingresos,
      gastos,
      ahorro,
      inversiones,
      transfers,
      patrimonio: patrimonioGlobal,
    },
  };
}

/* =========================
   API HANDLER (VERCEL)
========================= */
export default async function handler(req, res) {
  try {
    const data = await cargarLifeOS();

    return res.status(200).json({
      ok: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message,
      stack: error.stack,
    });
  }
}
