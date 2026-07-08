import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Download,
  Lock,
  CheckCircle2,
  Users,
  Wallet,
  ClipboardList,
  Building2,
  ArrowDownToLine,
  ArrowUpFromLine,
  Play,
  Clock,
} from "lucide-react";

export const Route = createFileRoute("/academy")({
  head: () => ({ meta: [{ title: "SynteraAcademy — Portal de Conhecimento" }] }),
  component: SynteraAcademyPage,
});

/* ═══════════════════════════════════════════════════════════════
   SYNTERAACADEMY — portal de conhecimento
   Biblioteca gratuita (e-books) para todos os usuários + cursos
   premium com paywall. Solicitação de compra registra um lead
   comercial (simulado).
   ═══════════════════════════════════════════════════════════════ */

const EBOOKS = [
  { id: "cad", titulo: "Módulo Cadastros", sub: "Clientes, Fornecedores & Produtos", icon: Users, cor: "#C9A84C", desc: "Guia completo de gestão de cadastros, segmentação de clientes e controle de fornecedores no Syntera." },
  { id: "fin", titulo: "Módulo Financeiro", sub: "Contas a Pagar & Receber", icon: Wallet, cor: "#22C55E", desc: "Do fluxo de caixa à conciliação bancária: domine o módulo financeiro do ERP em profundidade." },
  { id: "fis", titulo: "Módulo Fiscal", sub: "NF-e, SPED & Obrigações", icon: ClipboardList, cor: "#3B82F6", desc: "Entenda a escrituração fiscal, emissão de NF-e e o cumprimento de todas as obrigações acessórias." },
  { id: "rh", titulo: "Módulo RH", sub: "Folha, Ponto & Benefícios", icon: Building2, cor: "#A855F7", desc: "Gestão completa de pessoas: folha de pagamento, banco de horas e controle de benefícios." },
  { id: "ent", titulo: "Módulo Entradas", sub: "Compras & Créditos Fiscais", icon: ArrowDownToLine, cor: "#06B6D4", desc: "Da nota de entrada ao aproveitamento de créditos: maximize seu resultado fiscal nas compras." },
  { id: "sai", titulo: "Módulo Saídas", sub: "Faturamento & NFs Emitidas", icon: ArrowUpFromLine, cor: "#F59E0B", desc: "Ciclo completo de vendas: orçamento, pedido, faturamento e emissão de NF-e integrada." },
];

const CURSOS = [
  { id: "c1", titulo: "Tributação no Simples Nacional", cat: "Fiscal", catColor: "#3B82F6", nivel: "Básico", aulas: 12, horas: "4h30" },
  { id: "c2", titulo: "Reforma Tributária na Prática", cat: "Fiscal", catColor: "#3B82F6", nivel: "Avançado", aulas: 18, horas: "7h00" },
  { id: "c3", titulo: "Conciliação e Fluxo de Caixa", cat: "Financeiro", catColor: "#22C55E", nivel: "Intermediário", aulas: 10, horas: "3h45" },
  { id: "c4", titulo: "Folha de Pagamento e eSocial", cat: "RH", catColor: "#A855F7", nivel: "Intermediário", aulas: 15, horas: "5h30" },
  { id: "c5", titulo: "Gestão de Contas a Receber", cat: "Financeiro", catColor: "#22C55E", nivel: "Básico", aulas: 8, horas: "3h00" },
  { id: "c6", titulo: "NF-e e DANFE Descomplicados", cat: "Fiscal", catColor: "#3B82F6", nivel: "Básico", aulas: 9, horas: "2h45" },
];

const GOLD = "#C9A84C";

function SynteraAcademyPage() {
  const [tab, setTab] = useState<"library" | "courses">("library");
  const [temPlano] = useState(false); // simulação: empresa ainda não comprou o módulo
  const [solicitado, setSolicitado] = useState(false);

  const solicitarCompra = () => {
    // Em produção: registraria um lead no CRM (Engenharia de Vendas)
    setSolicitado(true);
    setTimeout(() => setSolicitado(false), 5000);
  };

  return (
    <div className="min-h-screen" style={{ background: "#080a0e", color: "#e8e8e8", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* TOP NAV */}
      <header
        className="sticky top-0 z-10 flex h-14 items-center justify-between px-6 md:px-10"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(8,10,14,0.92)", backdropFilter: "blur(16px)" }}
      >
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            <ArrowLeft className="h-3.5 w-3.5" /> Syntera ERP
          </Link>
          <div className="h-4 w-px" style={{ background: "rgba(255,255,255,0.1)" }} />
          <span className="text-lg font-extrabold tracking-tight">
            <span style={{ color: GOLD }}>SYNTERA</span>
            <span style={{ color: "#fff" }}>ACADEMY</span>
          </span>
        </div>
        <span
          className="rounded-full px-2.5 py-1 text-[10px] uppercase tracking-widest"
          style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.3)", color: GOLD }}
        >
          Portal de Conhecimento
        </span>
      </header>

      {/* HERO */}
      <div className="mx-auto max-w-5xl px-6 pb-9 pt-12 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-2 text-[11px] uppercase tracking-[0.2em]" style={{ color: "rgba(201,168,76,0.7)" }}>
              Aprenda. Domine. Cresça.
            </div>
            <h1 className="mb-2 max-w-lg text-3xl font-extrabold leading-tight">
              Toda a inteligência do Syntera ERP em um só lugar.
            </h1>
            <p className="max-w-md text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
              E-books gratuitos para todos os usuários. Cursos premium para quem quer dominar cada módulo com profundidade.
            </p>
          </div>
          <div
            className="min-w-[200px] rounded-xl px-5 py-3.5 text-center"
            style={{
              background: temPlano ? "rgba(201,168,76,0.07)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${temPlano ? "rgba(201,168,76,0.25)" : "rgba(255,255,255,0.08)"}`,
            }}
          >
            <div className="mb-1.5 text-[10px] uppercase tracking-wider" style={{ color: temPlano ? "rgba(201,168,76,0.65)" : "rgba(255,255,255,0.28)" }}>
              Seu plano
            </div>
            <div className="text-base font-bold" style={{ color: temPlano ? GOLD : "#e8e8e8" }}>
              {temPlano ? "SynteraAcademy ✓" : "ERP Padrão"}
            </div>
            <div className="mt-0.5 text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>
              {temPlano ? "Todos os cursos liberados" : "E-books incluídos · Cursos bloqueados"}
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="mt-9 flex gap-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <button
            onClick={() => setTab("library")}
            className="px-5 py-2.5 text-sm font-semibold transition-colors"
            style={{ borderBottom: `2px solid ${tab === "library" ? GOLD : "transparent"}`, color: tab === "library" ? GOLD : "rgba(255,255,255,0.38)" }}
          >
            📚 Biblioteca Gratuita
          </button>
          <button
            onClick={() => setTab("courses")}
            className="px-5 py-2.5 text-sm font-semibold transition-colors"
            style={{ borderBottom: `2px solid ${tab === "courses" ? GOLD : "transparent"}`, color: tab === "courses" ? GOLD : "rgba(255,255,255,0.38)" }}
          >
            🎓 Cursos Premium
          </button>
        </div>
      </div>

      {/* LIBRARY TAB */}
      {tab === "library" && (
        <div className="mx-auto max-w-5xl px-6 pb-12 md:px-10">
          <div className="mb-4 text-[11px] uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.28)" }}>
            E-books explicativos · Acesso livre para todos os usuários do ERP
          </div>
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
            {EBOOKS.map((book) => (
              <div
                key={book.id}
                className="flex flex-col gap-3.5 rounded-xl p-5 transition-colors"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-[10px]"
                    style={{ background: `${book.cor}1f` }}
                  >
                    <book.icon className="h-5 w-5" style={{ color: book.cor }} />
                  </div>
                  <span
                    className="whitespace-nowrap rounded px-2 py-0.5 text-[9px] uppercase tracking-wider"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}
                  >
                    Gratuito
                  </span>
                </div>
                <div>
                  <div className="mb-1 text-[15px] font-bold">{book.titulo}</div>
                  <div className="mb-2 text-[11px] font-medium" style={{ color: book.cor }}>{book.sub}</div>
                  <div className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.42)" }}>{book.desc}</div>
                </div>
                <button
                  className="mt-auto flex items-center justify-center gap-1.5 rounded-md py-2 text-xs font-semibold transition-colors"
                  style={{ border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)" }}
                >
                  <Download className="h-3.5 w-3.5" /> Download PDF
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COURSES TAB */}
      {tab === "courses" && (
        <div className="mx-auto max-w-5xl px-6 pb-12 md:px-10">
          {!temPlano && !solicitado && (
            <div
              className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl px-6 py-5"
              style={{ border: "1px solid rgba(201,168,76,0.25)", background: "rgba(201,168,76,0.06)" }}
            >
              <div>
                <div className="mb-1 text-sm font-bold" style={{ color: GOLD }}>🔒 Conteúdo Premium — Módulo SynteraAcademy</div>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>Desbloqueie todos os cursos e treinamentos aprofundados para sua equipe.</div>
              </div>
              <button
                onClick={solicitarCompra}
                className="whitespace-nowrap rounded-lg px-5 py-2.5 text-[13px] font-bold transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#C9A84C,#E8C96A)", color: "#07070a" }}
              >
                Solicitar Compra do Módulo SynteraAcademy
              </button>
            </div>
          )}
          {solicitado && (
            <div
              className="mb-6 flex items-center gap-3 rounded-xl px-5 py-4"
              style={{ border: "1px solid rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.06)" }}
            >
              <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: "#22C55E" }} />
              <span className="text-sm font-medium" style={{ color: "rgba(34,197,94,0.9)" }}>
                Solicitação enviada com sucesso! Nossa equipe comercial entrará em contato em breve.
              </span>
            </div>
          )}

          <div className="mb-4 text-[11px] uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.28)" }}>
            Vídeo-aulas e treinamentos aprofundados por área
          </div>
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))" }}>
            {CURSOS.map((curso) => (
              <div
                key={curso.id}
                className="overflow-hidden rounded-xl"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div
                  className="relative flex h-32 items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#141c33,#0a0f1f)" }}
                >
                  <Play className="h-8 w-8" style={{ color: "rgba(255,255,255,0.25)" }} />
                  {!temPlano && (
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ background: "rgba(7,7,14,0.72)", backdropFilter: "blur(3px)" }}
                    >
                      <Lock className="h-7 w-7" style={{ color: "rgba(255,255,255,0.4)" }} />
                    </div>
                  )}
                </div>
                <div className="p-4" style={{ opacity: temPlano ? 1 : 0.6 }}>
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className="rounded px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
                      style={{ background: `${curso.catColor}26`, color: curso.catColor }}
                    >
                      {curso.cat}
                    </span>
                    <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.3)" }}>{curso.nivel}</span>
                  </div>
                  <div className="mb-1.5 text-sm font-bold leading-snug">{curso.titulo}</div>
                  <div className="flex items-center gap-3.5 text-[11px]" style={{ color: "rgba(255,255,255,0.38)" }}>
                    <span className="flex items-center gap-1"><Play className="h-2.5 w-2.5" /> {curso.aulas} aulas</span>
                    <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> {curso.horas}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
