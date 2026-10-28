import { useEffect, useState } from "react";
import { Award, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";

export default function Certificados() {
  const { user } = useAuth();
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("certificates")
      .select("*")
      .eq("user_id", user.id)
      .order("issued_at", { ascending: false })
      .then(({ data }) => {
        setCerts(data ?? []);
        setLoading(false);
      });
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Certificados</h1>
        <p className="text-muted-foreground">Os teus certificados obtidos.</p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => <Skeleton key={i} className="h-36 w-full rounded-lg" />)}
        </div>
      ) : certs.length === 0 ? (
        <EmptyState icon={Award} title="Sem certificados" description="Completa cursos para obter certificados." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {certs.map((cert) => (
            <Card key={cert.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">{cert.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {cert.description && (
                  <p className="text-sm text-muted-foreground mb-3">{cert.description}</p>
                )}
                <p className="text-xs text-muted-foreground mb-3">
                  Emitido a {new Date(cert.issued_at).toLocaleDateString("pt-PT")}
                </p>
                {cert.file_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={cert.file_url} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-4 w-4" />
                      Descarregar
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
