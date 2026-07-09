import { createFileRoute, redirect } from "@tanstack/react-router";

/* O cadastro de fornecedores agora vive exclusivamente em Cadastros.
   Esta rota permanece apenas como redirecionamento, para não quebrar
   links/atalhos antigos. */
export const Route = createFileRoute("/entradas/fornecedores")({
  beforeLoad: () => {
    throw redirect({ to: "/cadastros" });
  },
});
