import { useEffect, useState } from "react";

import { obterSessaoFn } from "@/functions/auth.functions";

type UsuarioSessao = {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  empresaId: string;
};

type EmpresaSessao = {
  id: string;
  razaoSocial: string;
  nomeFantasia: string | null;
};

type EstadoSessao = {
  carregando: boolean;
  autenticado: boolean;
  usuario: UsuarioSessao | null;
  empresa: EmpresaSessao | null;
};

const estadoInicial: EstadoSessao = {
  carregando: true,
  autenticado: false,
  usuario: null,
  empresa: null,
};

export function useSessionUser() {
  const [sessao, setSessao] =
    useState<EstadoSessao>(estadoInicial);

  useEffect(() => {
    let ativo = true;

    async function carregarSessao() {
      try {
        const resultado = await obterSessaoFn();

        if (!ativo) {
          return;
        }

        setSessao({
          carregando: false,
          autenticado: resultado.autenticado,
          usuario: resultado.usuario,
          empresa: resultado.empresa,
        });
      } catch (error) {
        console.error(
          "Não foi possível carregar o usuário autenticado.",
          error,
        );

        if (!ativo) {
          return;
        }

        setSessao({
          carregando: false,
          autenticado: false,
          usuario: null,
          empresa: null,
        });
      }
    }

    void carregarSessao();

    return () => {
      ativo = false;
    };
  }, []);

  return sessao;
}