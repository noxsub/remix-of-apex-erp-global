import { redirect } from "@tanstack/react-router";

import { obterSessaoFn } from "../functions/auth.functions";

export async function requireAuthenticatedRoute() {
  const sessao = await obterSessaoFn();

  if (!sessao.autenticado) {
    throw redirect({
      to: "/",
    });
  }

  return sessao;
}