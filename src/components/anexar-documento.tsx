import { useRef, useState } from "react";
import { Paperclip, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface AnexoArquivo {
  nome: string;
  tamanho: number;
}

interface AnexarDocumentoProps {
  label?: string;
  value?: AnexoArquivo | null;
  onChange?: (file: AnexoArquivo | null) => void;
}

/**
 * Campo padrão de anexo de documento (PDF) para formulários de lançamento.
 * Usa apenas o nome/tamanho do arquivo em memória — sem upload real,
 * seguindo o padrão frontend-only do restante do protótipo.
 */
export function AnexarDocumento({ label = "Anexar comprovante (PDF)", value, onChange }: AnexarDocumentoProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arquivo, setArquivo] = useState<AnexoArquivo | null>(value ?? null);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const anexo: AnexoArquivo = { nome: file.name, tamanho: file.size };
    setArquivo(anexo);
    onChange?.(anexo);
    e.target.value = "";
  };

  const handleRemove = () => {
    setArquivo(null);
    onChange?.(null);
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleSelect}
      />
      {!arquivo ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground"
          onClick={() => inputRef.current?.click()}
        >
          <Paperclip className="h-3.5 w-3.5" />
          Selecionar arquivo PDF
        </Button>
      ) : (
        <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-secondary/40 px-3 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <FileText className="h-3.5 w-3.5 shrink-0 text-gold" />
            <span className="truncate text-xs">{arquivo.nome}</span>
            <span className="shrink-0 text-[10px] text-muted-foreground">
              ({(arquivo.tamanho / 1024).toFixed(0)} KB)
            </span>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Remover anexo"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
