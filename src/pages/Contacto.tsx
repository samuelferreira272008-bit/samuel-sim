import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Mail, MessageCircle, Phone, Building2, CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useSEO } from "@/lib/seo";
import { db, whatsappHref } from "@/lib/repo";
import { dispatchEvent } from "@/lib/events";
import { toast } from "sonner";

export default function Contacto() {
  const { data: profile } = useQuery({
    queryKey: ["site-profile"],
    queryFn: async () => (await db.from("site_profile").select("*").limit(1).maybeSingle()).data,
  });

  useSEO({
    title: "Contacto — Samuel Simão",
    description: "Entra em contacto com Samuel Simão para projetos, parcerias, dúvidas ou suporte.",
  });

  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const contactEmail = profile?.contact_email?.trim() || "ola@samuelsimao.com";
  const waHref = whatsappHref(profile?.whatsapp, "Olá Samuel! Gostaria de falar contigo.");
  const contactPhone = profile?.contact_phone?.trim();

  const channels = [
    {
      icon: Mail,
      name: "Email",
      value: contactEmail,
      href: `mailto:${contactEmail}`,
      external: false,
    },
    {
      icon: MessageCircle,
      name: "WhatsApp",
      value: profile?.whatsapp ? profile.whatsapp : "Mensagem direta",
      href: waHref || `mailto:${contactEmail}`,
      external: !!waHref,
    },
    ...(contactPhone
      ? [
          {
            icon: Phone,
            name: "Telefone",
            value: contactPhone,
            href: `tel:${contactPhone}`,
            external: false,
          },
        ]
      : []),
    {
      icon: Building2,
      name: "Empresas",
      value: "Parcerias e B2B",
      href: "/empresas",
      isRoute: true,
    },
  ];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Preenche o nome, email e mensagem.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim() || "Contacto via Plataforma",
        message: form.message.trim(),
      };

      const { error } = await db.from("contact_messages").insert(payload);
      await dispatchEvent("contact_submitted", payload);

      if (error) {
        // Fallback if contact_messages table migration hasn't run yet on external DB
        const body = encodeURIComponent(`${payload.message}\n\n— ${payload.name} (${payload.email})`);
        window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent(payload.subject)}&body=${body}`;
      }

      setSubmitted(true);
      toast.success("Mensagem enviada com sucesso!");
    } catch {
      toast.error("Não foi possível enviar a mensagem.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative overflow-hidden bg-mesh">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">Contacto</p>
          <h1 className="mt-3 text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
            Vamos falar
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Para colaborações, dúvidas, parcerias ou apoio — envia uma mensagem ou escolhe o canal que preferires.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-start justify-center space-y-4 rounded-2xl border border-border/60 bg-background p-8"
            >
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Mensagem recebida!</h2>
              <p className="text-muted-foreground">
                Obrigado pelo teu contacto, <span className="font-medium text-foreground">{form.name}</span>. Responderei o mais brevemente possível para <span className="font-medium text-foreground">{form.email}</span>.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setForm({ name: "", email: "", subject: "", message: "" });
                    setSubmitted(false);
                  }}
                >
                  Enviar outra mensagem
                </Button>
                {waHref && (
                  <Button asChild>
                    <a href={waHref} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="mr-2 h-4 w-4" /> Falar no WhatsApp
                    </a>
                  </Button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              onSubmit={submit}
              className="space-y-4 rounded-2xl border border-border/60 bg-background p-6 sm:p-8"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Nome</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="O teu nome"
                    required
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="teu@email.com"
                    required
                  />
                </div>
              </div>
              <div>
                <Label>Assunto</Label>
                <Input
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  placeholder="Parceria, projeto, dúvida..."
                />
              </div>
              <div>
                <Label>Mensagem</Label>
                <Textarea
                  rows={6}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder="Escreve aqui a tua mensagem..."
                  required
                />
              </div>
              <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {submitting ? "A enviar..." : "Enviar mensagem"}
              </Button>
            </motion.form>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {channels.map((c: any, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Card className="group h-full border-border/60 transition-all hover:-translate-y-1 hover:shadow-elegant">
                  <CardContent className="p-6">
                    <div className="mb-4 inline-flex rounded-xl bg-secondary p-3">
                      <c.icon className="h-5 w-5 text-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground">{c.name}</h3>
                    <p className="mt-1 truncate text-sm text-muted-foreground">{c.value}</p>
                    <Button variant="outline" size="sm" className="mt-4" asChild>
                      {c.isRoute ? (
                        <Link to={c.href}>Abrir</Link>
                      ) : (
                        <a
                          href={c.href}
                          target={c.external ? "_blank" : undefined}
                          rel="noopener noreferrer"
                        >
                          Abrir
                        </a>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
