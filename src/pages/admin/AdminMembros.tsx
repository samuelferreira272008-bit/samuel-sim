import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, Ban, CreditCard, Search, Shield, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { AdminUser, listAdminUsers, setAdminUserRole, setAdminUserStatus } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminMembros() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const { data: users = [], isLoading } = useQuery({ queryKey: ["admin-users", search], queryFn: () => listAdminUsers(search) });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: "admin" | "user" }) => setAdminUserRole(userId, role),
    onSuccess: () => { toast.success("Role atualizada."); queryClient.invalidateQueries({ queryKey: ["admin-users"] }); },
    onError: (error: Error) => toast.error(error.message),
  });
  const statusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: "active" | "deactivated" | "banned" }) => setAdminUserStatus(userId, status),
    onSuccess: () => { toast.success("Estado atualizado."); queryClient.invalidateQueries({ queryKey: ["admin-users"] }); },
    onError: (error: Error) => toast.error(error.message),
  });

  const totals = useMemo(() => ({
    users: users.length,
    admins: users.filter((user) => user.role === "admin").length,
    inactive: users.filter((user) => user.profile?.status !== "active").length,
  }), [users]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestão de Membros</h1>
          <p className="text-sm text-muted-foreground">Pesquisa, permissões, estado da conta, atividade e compras.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Pesquisar nome ou email" className="pl-9" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Summary label="Membros" value={totals.users} icon={<UserCheck className="h-4 w-4" />} />
        <Summary label="Admins" value={totals.admins} icon={<Shield className="h-4 w-4" />} />
        <Summary label="Bloqueados/inativos" value={totals.inactive} icon={<Ban className="h-4 w-4" />} />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow><TableHead>Utilizador</TableHead><TableHead>Role</TableHead><TableHead>Estado</TableHead><TableHead>Compras</TableHead><TableHead>Atividade</TableHead><TableHead className="text-right">Ações</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">A carregar membros...</TableCell></TableRow>
              ) : users.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">Nenhum membro encontrado.</TableCell></TableRow>
              ) : users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-medium text-foreground">{user.profile?.display_name ?? "Sem nome"}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </TableCell>
                  <TableCell><RoleBadge role={user.role} /></TableCell>
                  <TableCell><Badge variant={user.profile?.status === "active" ? "default" : "destructive"}>{user.profile?.status ?? "active"}</Badge></TableCell>
                  <TableCell>{user.purchases_count} · {user.total_spent.toLocaleString("pt-PT")} Kz</TableCell>
                  <TableCell>{user.activity_count}</TableCell>
                  <TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => setSelected(user)}>Ver perfil</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Perfil administrativo</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <Info label="Nome" value={selected.profile?.display_name ?? "—"} />
                <Info label="Email" value={selected.email} />
                <Info label="Criado em" value={new Date(selected.created_at).toLocaleString("pt-PT")} />
                <Info label="Último login" value={selected.last_sign_in_at ? new Date(selected.last_sign_in_at).toLocaleString("pt-PT") : "—"} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Select value={selected.role === "admin" ? "admin" : "user"} onValueChange={(role: "admin" | "user") => roleMutation.mutate({ userId: selected.id, role })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="user">user</SelectItem><SelectItem value="admin">admin</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Estado</label>
                  <Select value={(selected.profile?.status as any) ?? "active"} onValueChange={(status: "active" | "deactivated" | "banned") => statusMutation.mutate({ userId: selected.id, status })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="active">active</SelectItem><SelectItem value="deactivated">deactivated</SelectItem><SelectItem value="banned">banned</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Summary label="Compras" value={selected.purchases_count} icon={<CreditCard className="h-4 w-4" />} />
                <Summary label="Eventos de atividade" value={selected.activity_count} icon={<Activity className="h-4 w-4" />} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Summary({ label, value, icon }: { label: string; value: number; icon: ReactNode }) {
  return <Card><CardContent className="flex items-center gap-3 p-4"><div className="rounded-md bg-muted p-2 text-muted-foreground">{icon}</div><div><p className="text-xs text-muted-foreground">{label}</p><p className="text-xl font-bold text-foreground">{value}</p></div></CardContent></Card>;
}
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-md border border-border p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="break-words text-sm font-medium text-foreground">{value}</p></div>; }
function RoleBadge({ role }: { role: string }) { return <Badge variant={role === "admin" ? "default" : "secondary"}>{role}</Badge>; }
