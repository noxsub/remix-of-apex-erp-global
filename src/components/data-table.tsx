import type { ReactNode } from "react";
import { Download } from "lucide-react";
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

export function DataTable<T>({
  title,
  description,
  columns,
  data,
  filename = "export",
  toolbar,
  rowClassName,
}: DataTableProps<T>) {
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
                data.map((r) =>
                  Object.fromEntries(
                    columns.map((c) => [c.header, r[c.key]]),
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
              {columns.map((c) => (
                <TableHead
                  key={c.key}
                  className={`text-[11px] uppercase tracking-wider text-muted-foreground ${
                    c.align === "right"
                      ? "text-right"
                      : c.align === "center"
                        ? "text-center"
                        : ""
                  }`}
                >
                  {c.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, i) => (
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
                    {c.render ? c.render(row) : String(row[c.key] ?? "")}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {data.length === 0 && (
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