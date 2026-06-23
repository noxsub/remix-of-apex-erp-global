import * as XLSX from "xlsx";
import type { ItemFiscal } from "./fiscal-store";
import { entradaDefault, saidaDefault } from "./fiscal-store";

// Colunas do modelo padrão de importação de estoque do ERP.
// Mantenha em sincronia com o leitor `parseItensXlsx`.
export const TEMPLATE_COLUMNS = [
  "sku",
  "nome",
  "tipo", // produto | servico
  "unidade",
  "preco",
  "ncm",
  "cest",
  "codigoServicoLC116",
  "origem",
  "cstCsosn",
  "icms",
  "ipi",
  "pis",
  "cofins",
  "cbs",
  "ibs",
  "is",
  "iss",
  "beneficioFiscal",
  "peso",
  "volume",
  "custoMedio",
  "estoqueAtual",
  "estoqueMinimo",
  "cfopSaidaDentroUF",
  "cfopSaidaForaUF",
  "cstSaida",
  "cfopEntrada",
  "cstEntrada",
  "creditoIcms",
  "creditoPis",
  "creditoCofins",
] as const;

type ColKey = (typeof TEMPLATE_COLUMNS)[number];

export function downloadTemplateXlsx() {
  const exemplo: Record<ColKey, string | number> = {
    sku: "SKU-EXEMPLO-001",
    nome: "Produto Exemplo",
    tipo: "produto",
    unidade: "un",
    preco: 100,
    ncm: "84713012",
    cest: "",
    codigoServicoLC116: "",
    origem: "0",
    cstCsosn: "102",
    icms: 18,
    ipi: 0,
    pis: 0.65,
    cofins: 3,
    cbs: 0.9,
    ibs: 0.1,
    is: 0,
    iss: 0,
    beneficioFiscal: "",
    peso: 0.5,
    volume: 0.001,
    custoMedio: 60,
    estoqueAtual: 0,
    estoqueMinimo: 0,
    cfopSaidaDentroUF: "5102",
    cfopSaidaForaUF: "6102",
    cstSaida: "00",
    cfopEntrada: "1102",
    cstEntrada: "00",
    creditoIcms: 18,
    creditoPis: 1.65,
    creditoCofins: 7.6,
  };
  const ws = XLSX.utils.json_to_sheet([exemplo], { header: [...TEMPLATE_COLUMNS] });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Itens");
  XLSX.writeFile(wb, "modelo-estoque-erp.xlsx");
}

export type ParseResult = {
  itens: ItemFiscal[];
  erros: { linha: number; mensagem: string }[];
};

const num = (v: unknown, fallback = 0): number => {
  if (v === null || v === undefined || v === "") return fallback;
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
};
const str = (v: unknown): string => (v === null || v === undefined ? "" : String(v).trim());

export async function parseItensXlsx(file: File): Promise<ParseResult> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  if (!ws) return { itens: [], erros: [{ linha: 0, mensagem: "Planilha vazia" }] };
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });

  const itens: ItemFiscal[] = [];
  const erros: { linha: number; mensagem: string }[] = [];

  rows.forEach((r, idx) => {
    const linha = idx + 2; // +1 cabeçalho, +1 1-indexed
    const sku = str(r.sku);
    const nome = str(r.nome);
    if (!sku || !nome) {
      erros.push({ linha, mensagem: "SKU e nome são obrigatórios" });
      return;
    }
    const tipo = (str(r.tipo).toLowerCase() === "servico" ? "servico" : "produto") as ItemFiscal["tipo"];
    const item: ItemFiscal = {
      id: `if-imp-${sku}-${Date.now()}-${idx}`,
      tipo,
      sku,
      nome,
      unidade: str(r.unidade) || "un",
      preco: num(r.preco),
      ncm: tipo === "produto" ? str(r.ncm) : undefined,
      cest: tipo === "produto" ? str(r.cest) || undefined : undefined,
      codigoServicoLC116: tipo === "servico" ? str(r.codigoServicoLC116) || undefined : undefined,
      origem: (str(r.origem) || "0") as ItemFiscal["origem"],
      cstCsosn: str(r.cstCsosn) || "00",
      aliquotas: {
        icms: num(r.icms),
        ipi: num(r.ipi),
        pis: num(r.pis, 0.65),
        cofins: num(r.cofins, 3),
        iss: num(r.iss),
        cbs: num(r.cbs, 0.9),
        ibs: num(r.ibs, 0.1),
        is: num(r.is),
      },
      beneficioFiscal: str(r.beneficioFiscal) || undefined,
      peso: num(r.peso),
      volume: num(r.volume),
      custoMedio: num(r.custoMedio),
      estoqueAtual: num(r.estoqueAtual),
      estoqueMinimo: num(r.estoqueMinimo),
      entrada: {
        ...entradaDefault,
        cfopEntrada: str(r.cfopEntrada) || entradaDefault.cfopEntrada,
        cstEntrada: str(r.cstEntrada) || entradaDefault.cstEntrada,
        creditoIcms: num(r.creditoIcms, entradaDefault.creditoIcms),
        creditoPis: num(r.creditoPis, entradaDefault.creditoPis),
        creditoCofins: num(r.creditoCofins, entradaDefault.creditoCofins),
      },
      saida: {
        ...saidaDefault,
        cfopDentroUF: str(r.cfopSaidaDentroUF) || saidaDefault.cfopDentroUF,
        cfopForaUF: str(r.cfopSaidaForaUF) || saidaDefault.cfopForaUF,
        cstSaida: str(r.cstSaida) || saidaDefault.cstSaida,
      },
    };
    itens.push(item);
  });

  return { itens, erros };
}
