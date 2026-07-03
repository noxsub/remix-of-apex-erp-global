import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/rh/colaboradores')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/rh/colaboradores"!</div>
}
