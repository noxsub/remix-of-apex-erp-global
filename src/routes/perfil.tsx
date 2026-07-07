import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, KeyRound, Fingerprint, Eye, EyeOff, Mail, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { useUsuarioAtual, PAPEL_LABEL } from "@/lib/usuario-store";

export const Route = createFileRoute("/perfil")({
  head: () => ({ meta: [{ title: "Meu Perfil — Syntera ERP" }] }),
  component: PerfilPage,
});

function PerfilPage() {
  const [usuario, setUsuario] = useUsuarioAtual();

  return (
    <AppShell title="Meu Perfil" subtitle="Dados pessoais, senha de acesso e PIN de ponto.">
      <div className="mx-auto max-w-2xl space-y-4">
        <Card className="flex items-center gap-4 p-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-soft text-xl font-semibold text-primary-foreground">
            {usuario.avatarIniciais}
          </div>
          <div>
            <p className="text-lg font-semibold">{usuario.nome}</p>
            <p className="text-sm text-muted-foreground">{usuario.cargo}</p>
            <Badge variant="secondary" className="mt-1 text-[10px]">
              {PAPEL_LABEL[usuario.papel]}
            </Badge>
          </div>
        </Card>

        <Tabs defaultValue="dados">
          <TabsList>
            <TabsTrigger value="dados" className="gap-1.5">
              <User className="h-3.5 w-3.5" /> Dados
            </TabsTrigger>
            <TabsTrigger value="senha" className="gap-1.5">
              <KeyRound className="h-3.5 w-3.5" /> Senha
            </TabsTrigger>
            <TabsTrigger value="ponto" className="gap-1.5">
              <Fingerprint className="h-3.5 w-3.5" /> PIN de Ponto
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dados" className="mt-4">
            <DadosTab usuario={usuario} onSave={setUsuario} />
          </TabsContent>

          <TabsContent value="senha" className="mt-4">
            <SenhaTab usuario={usuario} onSave={setUsuario} />
          </TabsContent>

          <TabsContent value="ponto" className="mt-4">
            <PinTab usuario={usuario} onSave={setUsuario} />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}

function DadosTab({
  usuario,
  onSave,
}: {
  usuario: ReturnType<typeof useUsuarioAtual>[0];
  onSave: ReturnType<typeof useUsuarioAtual>[1];
}) {
  const [nome, setNome] = useState(usuario.nome);
  const [email, setEmail] = useState(usuario.email);
  const [cargo, setCargo] = useState(usuario.cargo);

  const salvar = () => {
    onSave({ ...usuario, nome, email, cargo, avatarIniciais: nome.trim().slice(0, 2).toUpperCase() });
    toast.success("Perfil atualizado!");
  };

  return (
    <Card className="space-y-4 p-5">
      <div className="space-y-1.5">
        <Label className="text-xs">Nome completo</Label>
        <Input value={nome} onChange={(e) => setNome(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs flex items-center gap-1.5"><Mail className="h-3 w-3" /> E-mail</Label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs flex items-center gap-1.5"><Briefcase className="h-3 w-3" /> Cargo</Label>
        <Input value={cargo} onChange={(e) => setCargo(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Matrícula (vinculada ao RH / Ponto)</Label>
        <Input value={usuario.matricula} disabled className="opacity-60" />
      </div>
      <div className="flex justify-end">
        <Button size="sm" onClick={salvar}>Salvar alterações</Button>
      </div>
    </Card>
  );
}

function SenhaTab({
  usuario,
  onSave,
}: {
  usuario: ReturnType<typeof useUsuarioAtual>[0];
  onSave: ReturnType<typeof useUsuarioAtual>[1];
}) {
  const [atual, setAtual] = useState("");
  const [nova, setNova] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mostrar, setMostrar] = useState(false);

  const alterar = () => {
    if (atual !== usuario.senha) {
      toast.error("Senha atual incorreta.");
      return;
    }
    if (nova.length < 3) {
      toast.error("A nova senha deve ter pelo menos 3 caracteres.");
      return;
    }
    if (nova !== confirmar) {
      toast.error("A confirmação não confere com a nova senha.");
      return;
    }
    onSave({ ...usuario, senha: nova });
    setAtual("");
    setNova("");
    setConfirmar("");
    toast.success("Senha alterada com sucesso!");
  };

  return (
    <Card className="space-y-4 p-5">
      <div className="space-y-1.5">
        <Label className="text-xs">Senha atual</Label>
        <div className="relative">
          <Input type={mostrar ? "text" : "password"} value={atual} onChange={(e) => setAtual(e.target.value)} />
          <button
            type="button"
            onClick={() => setMostrar((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {mostrar ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Nova senha</Label>
        <Input type={mostrar ? "text" : "password"} value={nova} onChange={(e) => setNova(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Confirmar nova senha</Label>
        <Input type={mostrar ? "text" : "password"} value={confirmar} onChange={(e) => setConfirmar(e.target.value)} />
      </div>
      <div className="flex justify-end">
        <Button size="sm" onClick={alterar}>Alterar senha</Button>
      </div>
    </Card>
  );
}

function PinTab({
  usuario,
  onSave,
}: {
  usuario: ReturnType<typeof useUsuarioAtual>[0];
  onSave: ReturnType<typeof useUsuarioAtual>[1];
}) {
  const [revelado, setRevelado] = useState(false);
  const [novoPin, setNovoPin] = useState("");

  const alterarPin = () => {
    if (!/^\d{4}$/.test(novoPin)) {
      toast.error("O PIN deve ter exatamente 4 dígitos.");
      return;
    }
    onSave({ ...usuario, pinPonto: novoPin });
    setNovoPin("");
    toast.success("PIN de ponto atualizado! Use-o no Syntera Ponto a partir de agora.");
  };

  return (
    <Card className="space-y-4 p-5">
      <div>
        <Label className="text-xs">Seu PIN atual no Syntera Ponto</Label>
        <div className="mt-1.5 flex items-center gap-3">
          <div className="rounded-lg border border-gold/30 bg-gold/5 px-6 py-3 text-center font-mono text-2xl tracking-[0.4em]">
            {revelado ? usuario.pinPonto : "••••"}
          </div>
          <Button size="sm" variant="outline" onClick={() => setRevelado((v) => !v)}>
            {revelado ? <EyeOff className="mr-1.5 h-3.5 w-3.5" /> : <Eye className="mr-1.5 h-3.5 w-3.5" />}
            {revelado ? "Ocultar" : "Revelar"}
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Use este PIN junto com sua matrícula ({usuario.matricula}) para registrar entrada, pausas
          e saída no aplicativo Syntera Ponto.
        </p>
      </div>

      <div className="border-t border-border pt-4">
        <Label className="text-xs">Definir novo PIN (4 dígitos)</Label>
        <div className="mt-1.5 flex gap-2">
          <Input
            inputMode="numeric"
            maxLength={4}
            value={novoPin}
            onChange={(e) => setNovoPin(e.target.value.replace(/\D/g, ""))}
            placeholder="0000"
            className="max-w-[140px] text-center font-mono tracking-widest"
          />
          <Button size="sm" onClick={alterarPin}>Atualizar PIN</Button>
        </div>
      </div>
    </Card>
  );
}
