import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const MOVIMIENTOS_DB = "38c69496-804b-80f1-a428-e506fc346c7c";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Método no permitido" });
  }

  try {
    const { concepto, importe, tipo, fecha, cuentaOrigen, cuentaDestino } = req.body;

    if (!concepto || !importe || !tipo || !cuentaOrigen) {
      return res.status(400).json({ ok: false, error: "Faltan campos obligatorios" });
    }

    const properties = {
      Concepto: { title: [{ text: { content: concepto } }] },
      Importe: { number: parseFloat(importe) },
      Tipo: { select: { name: tipo } },
      Fecha: { date: { start: fecha || new Date().toISOString().split("T")[0] } },
      "Cuenta origen": { relation: [{ id: cuentaOrigen }] },
    };

    if (cuentaDestino) {
      properties["Cuenta destino"] = { relation: [{ id: cuentaDestino }] };
    }

    const response = await notion.pages.create({
      parent: { database_id: MOVIMIENTOS_DB },
      properties,
    });

    return res.status(200).json({ ok: true, id: response.id });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}
