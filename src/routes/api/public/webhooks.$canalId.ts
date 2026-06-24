import { createFileRoute } from "@tanstack/react-router";

// Stub público: em produção, o adapter correspondente ao canalId traduz o JSON
// nativo do marketplace (ML/Shopee/Amazon) em PedidoMarketplace padrão e
// enfileira o evento. Aqui apenas registra e ecoa o payload para depuração.
export const Route = createFileRoute("/api/public/webhooks/$canalId")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        let body: unknown = null;
        try {
          body = await request.json();
        } catch {
          body = await request.text();
        }
        console.log("[omnilink:webhook]", params.canalId, body);
        return Response.json({ ok: true, canalId: params.canalId, received: true });
      },
      GET: async ({ params }) =>
        Response.json({ ok: true, canalId: params.canalId, hint: "POST com payload do marketplace" }),
    },
  },
});
