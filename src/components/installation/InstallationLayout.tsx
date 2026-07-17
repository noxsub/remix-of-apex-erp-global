import type { ReactNode } from "react";

type InstallationLayoutProps = {
  children: ReactNode;
  title: string;
  description: string;
};

export function InstallationLayout({
  children,
  title,
  description,
}: InstallationLayoutProps) {
  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Syntera ERP
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h1>

          <p className="mt-3 max-w-2xl text-muted-foreground">
            {description}
          </p>
        </header>

        {children}
      </div>
    </main>
  );
}