import { useMemo, useState, type ReactNode } from "react";
import { Download, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { exportToExcel } from "@/lib/export-excel";

export interface Column<T> {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  render?: (row: T) => ReactNode;
  /** Desabilita a ordenação clicável nesta coluna (padrão: ordenável). */
  sortable?: boolean;
}

interface DataTableProps<T> {
  title?: string;
  description?: string;
  columns: Column<T>[];
  data: T[];
  filename?: string;
  toolbar?: ReactNode;
  rowClassName?: (row: T, index: number) => string | undefined;
}

type SortDir = "asc" | "desc" | null;

/**
 * Ordenação padrão do sistema — clique no cabeçalho da coluna alterna
 * asc → desc → sem ordenação. Como o DataTable é usado por praticamente
 * todos os módulos, essa regra fica automaticamente disponível em
 * qualquer tabela do ERP.
 */
export function DataTable<T>({
  title,
  description,
  columns,
  data,
  filename = "export",
  toolbar,
  rowClassName,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  const toggleSort = (key: string) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else if (sortDir === "desc") {
      setSortKey(null);
      setSortDir(null);
    } else {
      setSortDir("asc");
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDir) return data;
    const copy = [...data];
    copy.sort((a, b) => {
      const va = (a as Record<string, unknown>)[sortKey];
      const vb = (b as Record<string, unknown>)[sortKey];
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === "number" && typeof vb === "number") {
        return sortDir === "asc" ? va - vb : vb - va;
      }
      const sa = String(va).toLowerCase();
      const sb = String(vb).toLowerCase();
      return sortDir === "asc" ? sa.localeCompare(sb, "pt-BR") : sb.localeCompare(sa, "pt-BR");
    });
    return copy;
  }, [data, sortKey, sortDir]);

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          {title ? (
            <h3 className="text-sm font-semibold tracking-tight text-foreground">
              {title}
            </h3>
          ) : null}
          {description ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {toolbar}
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 border-border text-xs font-medium hover:border-gold hover:text-foreground"
            onClick={() =>
              exportToExcel(
                sortedData.map((r) =>
                  Object.fromEntries(
                    columns.map((c) => [c.header, (r as Record<string, unknown>)[c.key]]),
                  ) as Record<string, unknown>,
                ),
                filename,
                title ?? "Dados",
              )
            }
          >
            <Download className="h-3.5 w-3.5" />
            Exportar para Excel
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              {columns.map((c) => {
                const sortable = c.sortable !== false;
                const isActive = sortKey === c.key;
                return (
                  <TableHead
                    key={c.key}
                    onClick={sortable ? () => toggleSort(c.key) : undefined}
                    className={`text-[11px] uppercase tracking-wider text-muted-foreground select-none ${
                      sortable ? "cursor-pointer hover:text-foreground" : ""
                    } ${
                      c.align === "right"
                        ? "text-right"
                        : c.align === "center"
                          ? "text-center"
                          : ""
                    }`}
                  >
                    <span className={`inline-flex items-center gap-1 ${c.align === "right" ? "flex-row-reverse" : ""}`}>
                      {c.header}
                      {sortable &&
                        (isActive && sortDir === "asc" ? (
                          <ArrowUp className="h-3 w-3 text-gold" />
                        ) : isActive && sortDir === "desc" ? (
                          <ArrowDown className="h-3 w-3 text-gold" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-30" />
                        ))}
                    </span>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((row, i) => (
              <TableRow
                key={i}
                className={`border-border hover:bg-secondary/40 ${rowClassName?.(row, i) ?? ""}`}
              >
                {columns.map((c) => (
                  <TableCell
                    key={c.key}
                    className={`text-sm ${
                      c.align === "right"
                        ? "text-right tabular-nums"
                        : c.align === "center"
                          ? "text-center"
                          : ""
                    }`}
                  >
                    {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? "")}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {sortedData.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  Sem registros
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
