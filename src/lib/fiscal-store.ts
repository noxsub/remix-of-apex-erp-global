import { useEffect, useState } from "react";

// ─── Empresa emissora ───────────────────────────────────────────────────────

export type RegimeTributario =
  | "Simples Nacional"
  | "Lucro Presumido"
  | "Lucro Real"
  | "MEI";

export type RegimeApuracao = "caixa" | "competencia";

export type AtividadePreponderante = "produto" | "servico" | "ambos";

export type CnaeRecord = {
  codigo: string;
  descricao: string;
  principal: boolean;
  atividade: AtividadePreponderante;
  presuncaoIRPJ: number; // %
  presuncaoCSLL: number; // %
};

export type EmpresaFiscal = {
  razaoSocial: string;
  fantasia: string;
  cnpj: string;
  ie: string;
  im: string;
  regime: RegimeTributario;
  crt: "1" | "2" | "3" | "4";
  cnaePrincipal: string; // legado — código do CNAE principal
  cnaesSecundarios: string[]; // legado — códigos
  cnaes: CnaeRecord[]; // novo cadastro completo
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
  cnaes: [],
  regimeApuracao: "competencia",
  uf: "SP",
  municipio: "São Paulo",
};

// ─── Perfil fiscal de cliente ───────────────────────────────────────────────

export type ContribuinteIcms = "sim" | "nao" | "isento";

export type PerfilFiscalCliente = {
  id: string;
  nome: string;
  contribuinteIcms: ContribuinteIcms;
  indicadorIe: "contribuinte" | "isento" | "nao_contribuinte";
  suframa: boolean;
  cfopDentroUF: string;
  cfopForaUF: string;
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

export type ConfigEntradaItem = {
  cfopEntrada: string; // 1102 / 2102
  cstEntrada: string;
  creditoIcms: number; // %
  creditoPis: number;
  creditoCofins: number;
  creditoIpi: number;
  origemCusto: "media" | "ultima";
};

export type ConfigSaidaItem = {
  cfopDentroUF: string;
  cfopForaUF: string;
  cstSaida: string;
  margemPadrao: number; // %
};

export type ItemFiscal = {
  id: string;
  tipo: TipoItem;
  sku: string;
  nome: string;
  unidade: string;
  preco: number;
  ncm?: string;
  cest?: string;
  codigoServicoLC116?: string;
  origem: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8";
  cstCsosn: string;
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
  peso?: number;
  volume?: number;
  custoMedio?: number;
  estoqueAtual?: number;
  estoqueMinimo?: number;
  entrada?: ConfigEntradaItem;
  saida?: ConfigSaidaItem;
};

export const entradaDefault: ConfigEntradaItem = {
  cfopEntrada: "1102",
  cstEntrada: "00",
  creditoIcms: 18,
  creditoPis: 1.65,
  creditoCofins: 7.6,
  creditoIpi: 0,
  origemCusto: "media",
};

export const saidaDefault: ConfigSaidaItem = {
  cfopDentroUF: "5102",
  cfopForaUF: "6102",
  cstSaida: "00",
  margemPadrao: 30,
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
    estoqueAtual: 184,
    entrada: entradaDefault,
    saida: saidaDefault,
  },
  {
    id: "if-10043",
    tipo: "produto",
    sku: "SKU-10043",
    nome: 'Monitor UltraWide 34"',
    unidade: "un",
    preco: 3499,
    ncm: "85285200",
    origem: "0",
    cstCsosn: "102",
    aliquotas: { icms: 18, ipi: 0, pis: 0.65, cofins: 3, iss: 0, cbs: 0.9, ibs: 0.1, is: 0 },
    estoqueAtual: 42,
    entrada: entradaDefault,
    saida: saidaDefault,
  },
  {
    id: "if-10044",
    tipo: "produto",
    sku: "SKU-10044",
    nome: "Teclado Mecânico RGB",
    unidade: "un",
    preco: 599,
    ncm: "84716052",
    origem: "0",
    cstCsosn: "102",
    aliquotas: { icms: 18, ipi: 0, pis: 0.65, cofins: 3, iss: 0, cbs: 0.9, ibs: 0.1, is: 0 },
    estoqueAtual: 8,
    entrada: entradaDefault,
    saida: saidaDefault,
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
    estoqueAtual: 312,
    entrada: entradaDefault,
    saida: saidaDefault,
  },
  {
    id: "if-10046",
    tipo: "produto",
    sku: "SKU-10046",
    nome: "Headset Wireless ANC",
    unidade: "un",
    preco: 1199,
    ncm: "85183000",
    origem: "0",
    cstCsosn: "102",
    aliquotas: { icms: 18, ipi: 0, pis: 0.65, cofins: 3, iss: 0, cbs: 0.9, ibs: 0.1, is: 0 },
    estoqueAtual: 64,
    entrada: entradaDefault,
    saida: saidaDefault,
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

// ─── Alíquotas padrão ───────────────────────────────────────────────────────

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

// ─── Apuração IRPJ / CSLL ───────────────────────────────────────────────────

export type ApuracaoConfig = {
  regime: RegimeTributario;
  periodicidade: "trimestral" | "anual";
  presuncaoIRPJ: { produto: number; servico: number }; // %
  presuncaoCSLL: { produto: number; servico: number }; // %
  aliquotaIRPJ: number; // 15
  adicionalIRPJ: number; // 10
  limiteAdicionalMensal: number; // 20000
  aliquotaCSLL: number; // 9
};

export const apuracaoConfigDefault: ApuracaoConfig = {
  regime: "Lucro Presumido",
  periodicidade: "trimestral",
  presuncaoIRPJ: { produto: 8, servico: 32 },
  presuncaoCSLL: { produto: 12, servico: 32 },
  aliquotaIRPJ: 15,
  adicionalIRPJ: 10,
  limiteAdicionalMensal: 20000,
  aliquotaCSLL: 9,
};

// ─── Códigos de serviço (LC 116) — biblioteca sugerida via IA ───────────────

export type CodigoServico = {
  codigo: string;
  descricao: string;
  cnaeRelacionado?: string;
  issSugerido: number;
};

// Mapeamento determinístico CNAE → LC 116 (substitui IA real até backend ser ativado)
// Cobre os CNAEs mais comuns; expandir conforme necessário.
const MAPA_CNAE_LC116: Record<string, CodigoServico[]> = {
  "6201": [
    { codigo: "1.04", descricao: "Elaboração de programas de computador", issSugerido: 2 },
    { codigo: "1.05", descricao: "Licenciamento ou cessão de direito de uso de software", issSugerido: 2 },
  ],
  "6202": [
    { codigo: "1.05", descricao: "Licenciamento ou cessão de direito de uso de software", issSugerido: 2 },
    { codigo: "1.07", descricao: "Suporte técnico em informática", issSugerido: 2.9 },
  ],
  "6203": [{ codigo: "1.07", descricao: "Suporte técnico em informática", issSugerido: 2.9 }],
  "6204": [{ codigo: "1.07", descricao: "Suporte técnico em informática", issSugerido: 2.9 }],
  "6209": [{ codigo: "1.07", descricao: "Suporte técnico em informática", issSugerido: 2.9 }],
  "6311": [{ codigo: "1.03", descricao: "Processamento, armazenamento e hospedagem de dados", issSugerido: 2 }],
  "7020": [{ codigo: "17.01", descricao: "Assessoria/consultoria de qualquer natureza", issSugerido: 5 }],
  "7319": [{ codigo: "17.06", descricao: "Propaganda e publicidade", issSugerido: 2.9 }],
  "7410": [{ codigo: "23.01", descricao: "Design e composição gráfica", issSugerido: 2.9 }],
  "8211": [{ codigo: "17.02", descricao: "Datilografia, digitação, secretaria virtual", issSugerido: 5 }],
  "6920": [
    { codigo: "17.19", descricao: "Contabilidade, inclusive serviços técnicos e auxiliares", issSugerido: 2 },
    { codigo: "17.20", descricao: "Auditoria", issSugerido: 5 },
  ],
  "6911": [{ codigo: "17.13", descricao: "Advocacia", issSugerido: 5 }],
  "8599": [{ codigo: "8.02", descricao: "Instrução, treinamento, avaliação de conhecimentos", issSugerido: 2 }],
  "9602": [{ codigo: "6.01", descricao: "Barbearia, cabeleireiros, manicuros, pedicuros", issSugerido: 3 }],
  "4321": [{ codigo: "7.06", descricao: "Instalação elétrica em geral", issSugerido: 5 }],
  "4329": [{ codigo: "7.02", descricao: "Execução de obra por empreitada ou subempreitada", issSugerido: 5 }],
};

export function sugerirCodigosServicoPorCNAEs(cnaes: string[]): CodigoServico[] {
  const seen = new Map<string, CodigoServico>();
  for (const c of cnaes) {
    const prefix = c.replace(/[^0-9]/g, "").slice(0, 4);
    const sugest = MAPA_CNAE_LC116[prefix] ?? [];
    for (const s of sugest) {
      if (!seen.has(s.codigo)) seen.set(s.codigo, { ...s, cnaeRelacionado: c });
    }
  }
  return Array.from(seen.values());
}

// ─── NF Config ──────────────────────────────────────────────────────────────

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

// ─── Persistência ───────────────────────────────────────────────────────────

const KEYS = {
  empresa: "erp:fiscal:empresa",
  perfis: "erp:fiscal:perfis-cliente",
  itens: "erp:fiscal:itens",
  aliquotas: "erp:fiscal:aliquotas",
  nf: "erp:fiscal:nf-config",
  apuracao: "erp:fiscal:apuracao",
  codigosServ: "erp:fiscal:codigos-servico",
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
export function useApuracaoConfig() {
  return usePersisted<ApuracaoConfig>(KEYS.apuracao, apuracaoConfigDefault);
}
export function useCodigosServico() {
  return usePersisted<CodigoServico[]>(KEYS.codigosServ, []);
}

export function consumirProximoNumeroNF(): { numero: number; formatado: string; serie: number; modelo: ModeloNF } {
  const atual = read<NFConfig>(KEYS.nf, nfConfigDefault);
  const numero = atual.proximoNumero;
  const proximo: NFConfig = { ...atual, proximoNumero: numero + 1 };
  write(KEYS.nf, proximo);
  const prefix = atual.modelo === "NFS-e" ? "NFS-e" : `NF-${atual.modelo}`;
  const formatado = `${prefix}-${String(atual.serie).padStart(3, "0")}-${String(numero).padStart(6, "0")}`;
  return { numero, formatado, serie: atual.serie, modelo: atual.modelo };
}
