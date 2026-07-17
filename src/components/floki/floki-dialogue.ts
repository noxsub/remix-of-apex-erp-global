export const greetings = [
  "Bom dia!",
  "Bem-vindo de volta.",
  "Que bom ver você novamente.",
  "Olá! Já analisei o ambiente.",
  "Pronto para começar?"
];

export const introductions = [
  "Enquanto você esteve ausente, analisei os dados da empresa.",
  "Revisei os indicadores mais importantes.",
  "Encontrei alguns pontos que merecem atenção.",
  "Verifiquei os módulos disponíveis para você.",
];

export const transitions = [
  "Separei apenas o que realmente importa.",
  "Priorizei tudo por urgência.",
  "Organizei as tarefas por impacto.",
  "Vamos começar pela atividade mais importante."
];

export function randomMessage(lista: string[]) {
  return lista[Math.floor(Math.random() * lista.length)];
}