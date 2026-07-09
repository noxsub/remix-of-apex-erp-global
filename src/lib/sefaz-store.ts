import { useEffect, useState } from "react";

/* ═══════════════════════════════════════════════════════════════
   SEFAZ — Documentos Fiscais identificados contra o CNPJ
   Simula a consulta de Distribuição de DF-e / Manifestação do
   Destinatário. Em produção, este store será alimentado por um
   backend com certificado digital (A1/A3) consultando o webservice
   da SEFAZ — a interface e o fluxo de importação já ficam prontos.
   ═══════════════════════════════════════════════════════════════ */

export type ItemDocumentoSefaz = {
  codigo: string;
  descricao: string;
  ncm: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  /* cadastro fiscal de ENTRADA */
  cfopEntrada: string;
  cstEntrada: string;
  aliqIcmsEntrada: number;
  aliqIpiEntrada: number;
  aliqPisEntrada: number;
  aliqCofinsEntrada: number;
  /* cadastro fiscal de SAÍDA (pré-configuração para revenda) */
  cfopSaida: string;
  cstSaida: string;
  aliqIcmsSaida: number;
  aliqPisSaida: number;
  aliqCofinsSaida: number;
  precoVendaSugerido: number;
  /* Centro de Custo */
  centroCustoId?: string;
  /* Informações financeiras */
  contaContabil?: string;
  formaPagamento?: "boleto" | "pix" | "ted" | "debito" | "cartao";
  condicaoPagamento?: string;
  /* Anexo do item */
  anexoNome?: string;
};

export type DocumentoSefaz = {
  id: string;
  chave: string;
  numero: string;
  serie: string;
  modelo: "55" | "57";
  emitenteCnpj: string;
  emitenteRazao: string;
  emitenteUf: string;
  dataEmissao: string;
  natureza: string;
  valorTotal: number;
  situacao: "pendente" | "importada" | "manifestada";
  itens: ItemDocumentoSefaz[];
};

const SEED: DocumentoSefaz[] = [
  {
    id: "sf-001",
    chave: "35260655444333000100550010000078121000078120",
    numero: "007812",
    serie: "1",
    modelo: "55",
    emitenteCnpj: "55.444.333/0001-22",
    emitenteRazao: "TechParts Distribuidora Ltda",
    emitenteUf: "SP",
    dataEmissao: "2026-06-29",
    natureza: "Venda de mercadoria",
    valorTotal: 18740,
    situacao: "pendente",
    itens: [
      {
        codigo: "TP-SSD-1TB",
        descricao: "SSD NVMe 1TB Gen4",
        ncm: "8471.70.19",
        unidade: "UN",
        quantidade: 20,
        valorUnitario: 520,
        cfopEntrada: "1102",
        cstEntrada: "00",
        aliqIcmsEntrada: 18,
        aliqIpiEntrada: 0,
        aliqPisEntrada: 1.65,
        aliqCofinsEntrada: 7.6,
        cfopSaida: "5102",
        cstSaida: "00",
        aliqIcmsSaida: 18,
        aliqPisSaida: 1.65,
        aliqCofinsSaida: 7.6,
        precoVendaSugerido: 899,
      },
      {
        codigo: "TP-MEM-32GB",
        descricao: "Memória DDR5 32GB 6000MHz",
        ncm: "8473.30.42",
        unidade: "UN",
        quantidade: 30,
        valorUnitario: 278,
        cfopEntrada: "1102",
        cstEntrada: "00",
        aliqIcmsEntrada: 18,
        aliqIpiEntrada: 0,
        aliqPisEntrada: 1.65,
        aliqCofinsEntrada: 7.6,
        cfopSaida: "5102",
        cstSaida: "00",
        aliqIcmsSaida: 18,
        aliqPisSaida: 1.65,
        aliqCofinsSaida: 7.6,
        precoVendaSugerido: 489,
      },
    ],
  },
  {
    id: "sf-002",
    chave: "35260677888999000181550020000045451000045451",
    numero: "004545",
    serie: "2",
    modelo: "55",
    emitenteCnpj: "77.888.999/0001-55",
    emitenteRazao: "Global Embalagens S.A.",
    emitenteUf: "SP",
    dataEmissao: "2026-06-30",
    natureza: "Venda de produção do estabelecimento",
    valorTotal: 6420,
    situacao: "pendente",
    itens: [
      {
        codigo: "GE-CX-M",
        descricao: "Caixa de papelão M (40x30x25)",
        ncm: "4819.10.00",
        unidade: "MIL",
        quantidade: 3,
        valorUnitario: 2140,
        cfopEntrada: "1101",
        cstEntrada: "00",
        aliqIcmsEntrada: 12,
        aliqIpiEntrada: 5,
        aliqPisEntrada: 1.65,
        aliqCofinsEntrada: 7.6,
        cfopSaida: "5101",
        cstSaida: "00",
        aliqIcmsSaida: 18,
        aliqPisSaida: 1.65,
        aliqCofinsSaida: 7.6,
        precoVendaSugerido: 3200,
      },
    ],
  },
  {
    id: "sf-003",
    chave: "31260722111000000100570010000009911000009917",
    numero: "000991",
    serie: "1",
    modelo: "57",
    emitenteCnpj: "22.111.000/0001-88",
    emitenteRazao: "RápidoLog Transportes ME",
    emitenteUf: "MG",
    dataEmissao: "2026-07-01",
    natureza: "Prestação de serviço de transporte",
    valorTotal: 890,
    situacao: "pendente",
    itens: [
      {
        codigo: "FRETE-CTE",
        descricao: "Frete rodoviário — CT-e 991",
        ncm: "—",
        unidade: "SV",
        quantidade: 1,
        valorUnitario: 890,
        cfopEntrada: "1353",
        cstEntrada: "00",
        aliqIcmsEntrada: 12,
        aliqIpiEntrada: 0,
        aliqPisEntrada: 1.65,
        aliqCofinsEntrada: 7.6,
        cfopSaida: "—",
        cstSaida: "—",
        aliqIcmsSaida: 0,
        aliqPisSaida: 0,
        aliqCofinsSaida: 0,
        precoVendaSugerido: 0,
      },
    ],
  },
];

const KEY = "erp:sefaz:documentos";

function read<T>(k: string, f: T): T {
  if (typeof window === "undefined") return f;
  try {
    const raw = window.localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : f;
  } catch {
    return f;
  }
}
function write<T>(k: string, v: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(k, JSON.stringify(v));
  window.dispatchEvent(new CustomEvent("erp:store", { detail: { key: k } }));
}

export function useDocumentosSefaz() {
  const [state, setState] = useState<DocumentoSefaz[]>(() => read(KEY, SEED));
  useEffect(() => {
    const onChange = (e: Event) => {
      const d = (e as CustomEvent).detail as { key?: string } | undefined;
      if (d?.key === KEY) setState(read<DocumentoSefaz[]>(KEY, SEED));
    };
    window.addEventListener("erp:store", onChange);
    return () => window.removeEventListener("erp:store", onChange);
  }, []);
  const update = (next: DocumentoSefaz[] | ((prev: DocumentoSefaz[]) => DocumentoSefaz[])) => {
    setState((prev) => {
      const v = typeof next === "function" ? next(prev) : next;
      write(KEY, v);
      return v;
    });
  };
  return [state, update] as const;
}
