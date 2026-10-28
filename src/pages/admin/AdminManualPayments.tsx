import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Eye, FileSearch, XCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const db = supabase as any;

type Review = {
  id: string;
  user_id: string;
  purchase_id: string | null;
  expected_amount: number | null;
  detected_amount: number | null;
  expected_reference: string | null;
  detected_reference: string | null;
  extracted_data: Record<string, unknown>;
  confidence: number | null;
  status: string;
  notes: string | null;
  created_at: string;
};

export default function AdminManualPayments() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Review | null>(null);
  const [notes, setNotes] = useState("");
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["admin-manual-payment-reviews"],
    queryFn: async () => {
      const { data, error } = await db.from("manual_payment_reviews").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Review[];
    },
  });

  const decide = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "rejected" | "overridden" }) => {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await db.from("manual_payment_reviews").update({ status, notes: notes || null, reviewer_id: userData.user?.id, reviewed_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
      const review = reviews.find((item) => item.id === id);
      if (review?.purchase_id) {
        await db.from("purchases").update({ status: status === "approved" || status === "overridden" ? "completed" : "rejected" }).eq("id", review.purchase_id);
      }
    },
    onSuccess: () => { toast.success("Revisão atualizada."); setSelected(null); setNotes(""); queryClient.invalidateQueries({ queryKey: ["admin-manual-payment-reviews"] }); },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Pagamentos Manuais</h1><p className="text-sm text-muted-foreground">Revisão de comprovativos, extração AI e comparação de valores.</p></div>
      <Card><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Utilizador</TableHead><TableHead>Esperado</TableHead><TableHead>Detetado</TableHead><TableHead>Confiança</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader><TableBody>
        {isLoading ? <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">A carregar revisões...</TableCell></TableRow> : reviews.length === 0 ? <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">Sem comprovativos pendentes.</TableCell></TableRow> : reviews.map((review) => (
          <TableRow key={review.id}><TableCell>{new Date(review.created_at).toLocaleDateString("pt-PT")}</TableCell><TableCell className="font-mono text-xs">{review.user_id.slice(0, 8)}...</TableCell><TableCell>{Number(review.expected_amount ?? 0).toLocaleString("pt-PT")} Kz</TableCell><TableCell>{Number(review.detected_amount ?? 0).toLocaleString("pt-PT")} Kz</TableCell><TableCell>{review.confidence ? `${Math.round(review.confidence * 100)}%` : "—"}</TableCell><TableCell><Badge variant={review.status === "pending" ? "outline" : review.status === "rejected" ? "destructive" : "default"}>{review.status}</Badge></TableCell><TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => { setSelected(review); setNotes(review.notes ?? ""); }}><Eye className="mr-2 h-4 w-4" />Rever</Button></TableCell></TableRow>
        ))}
      </TableBody></Table></CardContent></Card>
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle className="flex items-center gap-2"><FileSearch className="h-5 w-5" />Detalhes do comprovativo</DialogTitle></DialogHeader>{selected && <div className="space-y-4"><div className="grid gap-3 sm:grid-cols-2"><Info label="Valor esperado" value={`${Number(selected.expected_amount ?? 0).toLocaleString("pt-PT")} Kz`} /><Info label="Valor detetado" value={`${Number(selected.detected_amount ?? 0).toLocaleString("pt-PT")} Kz`} /><Info label="Referência esperada" value={selected.expected_reference ?? "—"} /><Info label="Referência detetada" value={selected.detected_reference ?? "—"} /></div><div><p className="mb-2 text-sm font-medium">Dados extraídos pela AI</p><pre className="max-h-56 overflow-auto rounded-md bg-muted p-3 text-xs text-foreground">{JSON.stringify(selected.extracted_data, null, 2)}</pre></div><div><p className="mb-2 text-sm font-medium">Notas de revisão</p><Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Justificação ou observações internas" /></div><div className="flex flex-wrap justify-end gap-2"><Button variant="outline" onClick={() => decide.mutate({ id: selected.id, status: "overridden" })}>Override</Button><Button variant="destructive" onClick={() => decide.mutate({ id: selected.id, status: "rejected" })}><XCircle className="mr-2 h-4 w-4" />Rejeitar</Button><Button onClick={() => decide.mutate({ id: selected.id, status: "approved" })}><CheckCircle2 className="mr-2 h-4 w-4" />Aprovar</Button></div></div>}</DialogContent></Dialog>
    </div>
  );
}
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-md border border-border p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="text-sm font-medium text-foreground">{value}</p></div>; }
