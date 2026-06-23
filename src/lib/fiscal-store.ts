import { useEffect, useState } from "react";

// ─── Empresa emissora ───────────────────────────────────────────────────────

export type RegimeTributario =
  | "Simples Nacional"
  | "Lucro Presumido"
  | "Lucro Real"
  | "MEI";

export type RegimeApuracao = "caixa" | "competencia";

export type EmpresaFiscal = {
  razaoSocial: string;
  fantasia: string;
  cnpj: string;
  ie: string;
  im: string;
  regime: RegimeTributario;
  crt: "1" | "2" | "3" | "4"; // 1 SN, 2 SN excesso sublimite, 3 Regime Normal, 4 SN MEI
  cnaePrincipal: string;
  cnaesSecundarios: string[];
  regimeApuracao: RegimeApuracao;
  uf: string;
  municipio: string;
};

export const empresaFiscalDefault: EmpresaFiscal = {
  razaoSocial: "",
  fantasia: "",
  cnpj: "",
  ie: "",
  im: "",
  regime: "Lucro Presumido",
  crt: "3",
  cnaePrincipal: "",
  cnaesSecundarios: [],
  regimeApuracao: "competencia",
  uf: "SP",
  municipio: "São Paulo",
};

// ─── Perfil fiscal de cliente (biblioteca reutilizável) ─────────────────────

export type ContribuinteIcms = "sim" | "nao" | "isento";

export type PerfilFiscalCliente = {
  id: string;
  nome: string; // ex.: "Revendedor SP - Contribuinte ICMS"
  contribuinteIcms: ContribuinteIcms;
  indicadorIe: "contribuinte" | "isento" | "nao_contribuinte";
  suframa: boolean;
  cfopDentroUF: string; // ex.: "5102"
  cfopForaUF: string; // ex.: "6102"
  retencoes: {
    irrf: boolean;
    csll: boolean;
    pis: boolean;
    cofins: boolean;
    iss: boolean;
    inss: boolean;
  };
  observacoesNF: string;
};

export const perfilFiscalPadrao: PerfilFiscalCliente[] = [
  {
    id: "pf-consumidor",
    nome: "Consumidor Final",
    contribuinteIcms: "nao",
    indicadorIe: "nao_contribuinte",
    suframa: false,
    cfopDentroUF: "5102",
    cfopForaUF: "6108",
    retencoes: { irrf: false, csll: false, pis: false, cofins: false, iss: false, inss: false },
    observacoesNF: "",
  },
  {
    id: "pf-revendedor",
    nome: "Revendedor Contribuinte ICMS",
    contribuinteIcms: "sim",
    indicadorIe: "contribuinte",
    suframa: false,
    cfopDentroUF: "5102",
    cfopForaUF: "6102",
    retencoes: { irrf: false, csll: false, pis: false, cofins: false, iss: false, inss: false },
    observacoesNF: "",
  },
  {
    id: "pf-pj-servico",
    nome: "PJ Tomadora de Serviço (com retenções)",
    contribuinteIcms: "nao",
    indicadorIe: "isento",
    suframa: false,
    cfopDentroUF: "5933",
    cfopForaUF: "6933",
    retencoes: { irrf: true, csll: true, pis: true, cofins: true, iss: true, inss: false },
    observacoesNF: "Retenções conforme legislação vigente.",
  },
];

// ─── Item / serviço fiscal ──────────────────────────────────────────────────

export type TipoItem = "produto" | "servico";

export type ItemFiscal = {
  id: string;
  tipo: TipoItem;
  sku: string;
  nome: string;
  unidade: string; // un, kg, m, hr...
  preco: number;
  // Tributário
  ncm?: string; // produto
  cest?: string; // produto
  codigoServicoLC116?: string; // serviço
  origem: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8"; // origem mercadoria
  cstCsosn: string; // ex: "102", "00", "60"
  aliquotas: {
    icms: number;
    ipi: number;
    pis: number;
    cofins: number;
    iss: number;
    cbs: number;
    ibs: number;
    is: number;
  };
  beneficioFiscal?: string;
  peso?: number; // kg
  volume?: number; // m³
};

export const itensFiscaisIniciais: ItemFiscal[] = [
  {
    id: "if-10042",
    tipo: "produto",
    sku: "SKU-10042",
    nome: 'Notebook Pro 14" M3',
    unidade: "un",
    preco: 7299,
    ncm: "84713012",
    cest: "2104700",
    origem: "0",
    cstCsosn: "102",
    aliquotas: { icms: 18, ipi: 0, pis: 0.65, cofins: 3, iss: 0, cbs: 0.9, ibs: 0.1, is: 0 },
  },
  {
    id: "if-10045",
    tipo: "produto",
    sku: "SKU-10045",
    nome: "Mouse Ergonômico Vertical",
    unidade: "un",
    preco: 289,
    ncm: "84716053",
    origem: "0",
    cstCsosn: "102",
    aliquotas: { icms: 18, ipi: 0, pis: 0.65, cofins: 3, iss: 0, cbs: 0.9, ibs: 0.1, is: 0 },
  },
  {
    id: "if-srv-consult",
    tipo: "servico",
    sku: "SRV-001",
    nome: "Consultoria de TI",
    unidade: "hr",
    preco: 320,
    codigoServicoLC116: "1.07",
    origem: "0",
    cstCsosn: "00",
    aliquotas: { icms: 0, ipi: 0, pis: 0.65, cofins: 3, iss: 5, cbs: 0.9, ibs: 0.1, is: 0 },
  },
];

// ─── Alíquotas padrão (CBS/IBS/IS + retenções) ──────────────────────────────

export type TipoOperacao = "produto" | "servico";

export type AliquotasPadraoOperacao = {
  cbs: number;
  ibs: number;
  is: number;
  irrf: number;
  csll: number;
  pis: number;
  cofins: number;
  iss: number;
};

export type AliquotasPadrao = Record<TipoOperacao, AliquotasPadraoOperacao>;

export const aliquotasPadraoDefault: AliquotasPadrao = {
  produto: { cbs: 0.9, ibs: 0.1, is: 0, irrf: 0, csll: 0, pis: 0.65, cofins: 3, iss: 0 },
  servico: { cbs: 0.9, ibs: 0.1, is: 0, irrf: 1.5, csll: 1, pis: 0.65, cofins: 3, iss: 5 },
};

// ─── Configuração NF (numeração + ambiente) ─────────────────────────────────

export type Ambiente = "homologacao" | "producao";
export type ModeloNF = "55" | "65" | "NFS-e";

export type NFConfig = {
  modelo: ModeloNF;
  ambiente: Ambiente;
  serie: number;
  proximoNumero: number;
  cscId?: string;
  csc?: string;
};

export const nfConfigDefault: NFConfig = {
  modelo: "55",
  ambiente: "homologacao",
  serie: 1,
  proximoNumero: 1,
};

// ─── Persistência genérica ──────────────────────────────────────────────────

const KEYS = {
  empresa: "erp:fiscal:empresa",
  perfis: "erp:fiscal:perfis-cliente",
  itens: "erp:fiscal:itens",
  aliquotas: "erp:fiscal:aliquotas",
  nf: "erp:fiscal:nf-config",
} as const;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("erp:store", { detail: { key } }));
}

function usePersisted<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => read<T>(key, initial));
  useEffect(() => {
    const onChange = (e: Event) => {
      const d = (e as CustomEvent).detail as { key?: string } | undefined;
      if (d?.key === key) setState(read<T>(key, initial));
    };
    window.addEventListener("erp:store", onChange);
    return () => window.removeEventListener("erp:store", onChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const update = (next: T | ((prev: T) => T)) => {
    setState((prev) => {
      const v = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      write(key, v);
      return v;
    });
  };
  return [state, update] as const;
}

export function useEmpresaFiscal() {
  return usePersisted<EmpresaFiscal>(KEYS.empresa, empresaFiscalDefault);
}
export function usePerfisFiscaisCliente() {
  return usePersisted<PerfilFiscalCliente[]>(KEYS.perfis, perfilFiscalPadrao);
}
export function useItensFiscais() {
  return usePersisted<ItemFiscal[]>(KEYS.itens, itensFiscaisIniciais);
}
export function useAliquotasPadrao() {
  return usePersisted<AliquotasPadrao>(KEYS.aliquotas, aliquotasPadraoDefault);
}
export function useNFConfig() {
  return usePersisted<NFConfig>(KEYS.nf, nfConfigDefault);
}

// Consome o próximo número e incrementa. Retorna a string formatada.
export function consumirProximoNumeroNF(): { numero: number; formatado: string; serie: number; modelo: ModeloNF } {
  const atual = read<NFConfig>(KEYS.nf, nfConfigDefault);
  const numero = atual.proximoNumero;
  const proximo: NFConfig = { ...atual, proximoNumero: numero + 1 };
  write(KEYS.nf, proximo);
  const prefix = atual.modelo === "NFS-e" ? "NFS-e" : `NF-${atual.modelo}`;
  const formatado = `${prefix}-${String(atual.serie).padStart(3, "0")}-${String(numero).padStart(6, "0")}`;
  return { numero, formatado, serie: atual.serie, modelo: atual.modelo };
}
