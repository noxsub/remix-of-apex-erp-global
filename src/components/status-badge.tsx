export function StatusBadge({ value }: { value: string }) {
  const map: Record<string, string> = {
    Conciliado: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Pendente: "bg-gold-soft/30 text-foreground border-gold-soft",
    Divergente: "bg-red-50 text-red-700 border-red-200",
    Pago: "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Em aberto": "bg-secondary text-foreground border-border",
    Vencido: "bg-red-50 text-red-700 border-red-200",
    Faturado: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Rascunho: "bg-secondary text-muted-foreground border-border",
    Enviado: "bg-gold-soft/30 text-foreground border-gold-soft",
    Ativo: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Baixo: "bg-red-50 text-red-700 border-red-200",
  };
  const cls = map[value] ?? "bg-secondary text-foreground border-border";
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${cls}`}>
      {value}
    </span>
  );
}