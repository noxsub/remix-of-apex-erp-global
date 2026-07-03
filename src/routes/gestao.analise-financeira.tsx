import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/gestao/analise-financeira')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/gestao/analise-financeira"!</div>
}
