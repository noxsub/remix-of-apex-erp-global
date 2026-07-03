import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/rh')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/rh"!</div>
}
