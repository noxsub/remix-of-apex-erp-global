/// <reference types="node" />

import { useSession } from "@tanstack/react-start/server";

export type SynteraSessionData = {
  usuarioId?: string;
  empresaId?: string;
  perfil?: string;
};

export function useSynteraSession() {
  const sessionSecret = process.env.SESSION_SECRET;

  if (!sessionSecret || sessionSecret.length < 32) {
    throw new Error(
      "SESSION_SECRET deve existir no arquivo .env e possuir pelo menos 32 caracteres.",
    );
  }

  return useSession<SynteraSessionData>({
    name: "syntera-session",
    password: sessionSecret,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    },
  });
}