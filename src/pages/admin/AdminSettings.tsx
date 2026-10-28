import { useEffect, useState } from "react";
import { Save, Settings, UserCircle, FileText, Share2, Users } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GalleryEditor } from "@/components/repo/GalleryEditor";

const db = supabase as any;

const defaultSettings = {
  id: "",
  platform_name: "Samuel Simão",
  email_from: "",
  resend_enabled: false,
  payment_iban: "",
  payment_account_name: "",
  enable_ai: true,
  enable_payments: true,
  enable_blog: true,
  community_whatsapp: "",
  community_telegram: "",
  community_discord: "",
  sponsorship_message: "",
};

interface SocialLinks {
  github?: string;
  linkedin?: string;
  youtube?: string;
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  facebook?: string;
  website?: string;
}

interface SiteProfileState {
  id: string;
  full_name: string;
  headline: string;
  bio: string;
  photos: string[];
  contact_email: string;
  contact_phone: string;
  whatsapp: string;
  location: string;
  social_links: SocialLinks;
  terms_text: string;
  privacy_text: string;
}

const defaultProfile: SiteProfileState = {
  id: "",
  full_name: "Samuel Simão",
  headline: "Criador digital, developer e educador",
  bio: "",
  photos: [],
  contact_email: "",
  contact_phone: "",
  whatsapp: "",
  location: "",
  social_links: {},
  terms_text: "",
  privacy_text: "",
};

const socialFields: { key: keyof SocialLinks; label: string; placeholder: string }[] = [
  { key: "github", label: "GitHub", placeholder: "https://github.com/..." },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/..." },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@..." },
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/..." },
  { key: "twitter", label: "X / Twitter", placeholder: "https://x.com/..." },
  { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@..." },
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/..." },
  { key: "website", label: "Website / Outro Link", placeholder: "https://..." },
];

export default function AdminSettings() {
  const qc = useQueryClient();
  const [settings, setSettings] = useState(defaultSettings);
  const [profile, setProfile] = useState<SiteProfileState>(defaultProfile);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    db.from("platform_settings")
      .select("*")
      .limit(1)
      .maybeSingle()
      .then(({ data }: any) => {
        if (data) {
          setSettings({
            ...defaultSettings,
            ...data,
            email_from: data.email_from ?? "",
            payment_iban: data.payment_iban ?? "",
            payment_account_name: data.payment_account_name ?? "",
            community_whatsapp: data.community_whatsapp ?? "",
            community_telegram: data.community_telegram ?? "",
            community_discord: data.community_discord ?? "",
            sponsorship_message: data.sponsorship_message ?? "",
          });
        }
      });

    db.from("site_profile")
      .select("*")
      .limit(1)
      .maybeSingle()
      .then(({ data }: any) => {
        if (data) {
          setProfile({
            id: data.id ?? "",
            full_name: data.full_name ?? "Samuel Simão",
            headline: data.headline ?? "",
            bio: data.bio ?? "",
            photos: Array.isArray(data.photos) ? data.photos : [],
            contact_email: data.contact_email ?? "",
            contact_phone: data.contact_phone ?? "",
            whatsapp: data.whatsapp ?? "",
            location: data.location ?? "",
            social_links: data.social_links && typeof data.social_links === "object" ? data.social_links : {},
            terms_text: data.terms_text ?? "",
            privacy_text: data.privacy_text ?? "",
          });
        }
      });
  }, []);

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const payload = {
        full_name: profile.full_name || "Samuel Simão",
        headline: profile.headline || null,
        bio: profile.bio || null,
        photos: profile.photos,
        contact_email: profile.contact_email || null,
        contact_phone: profile.contact_phone || null,
        whatsapp: profile.whatsapp || null,
        location: profile.location || null,
        social_links: profile.social_links,
        terms_text: profile.terms_text || null,
        privacy_text: profile.privacy_text || null,
      };

      if (profile.id) {
        const { error } = await db.from("site_profile").update(payload).eq("id", profile.id);
        if (error) throw error;
      } else {
        const { data, error } = await db.from("site_profile").insert(payload).select("*").single();
        if (error) throw error;
        if (data?.id) setProfile((p) => ({ ...p, id: data.id }));
      }

      qc.invalidateQueries({ queryKey: ["site-profile"] });
      toast.success("Perfil público, contactos e textos legais guardados!");
    } catch (error: any) {
      toast.error(error.message ?? "Erro ao guardar perfil.");
    } finally {
      setSavingProfile(false);
    }
  };

  const saveSystemSettings = async () => {
    setSavingSettings(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const payload: any = {
        platform_name: settings.platform_name,
        email_from: settings.email_from || null,
        resend_enabled: settings.resend_enabled,
        payment_iban: settings.payment_iban || null,
        payment_account_name: settings.payment_account_name || null,
        enable_ai: settings.enable_ai,
        enable_payments: settings.enable_payments,
        enable_blog: settings.enable_blog,
        community_whatsapp: settings.community_whatsapp || null,
        community_telegram: settings.community_telegram || null,
        community_discord: settings.community_discord || null,
        sponsorship_message: settings.sponsorship_message || null,
        updated_by: userData.user?.id ?? null,
      };
      const { data, error } = settings.id
        ? await db.from("platform_settings").update(payload).eq("id", settings.id).select("*").single()
        : await db.from("platform_settings").insert(payload).select("*").single();
      if (error) throw error;
      if (data?.id) setSettings((s) => ({ ...s, id: data.id }));
      qc.invalidateQueries({ queryKey: ["platform_settings_public"] });
      qc.invalidateQueries({ queryKey: ["sponsorship_message"] });
      toast.success("Definições do sistema guardadas.");
    } catch (error: any) {
      toast.error(error.message ?? "Erro ao guardar.");
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Perfil Público, Legal & Definições</h1>
        <p className="text-sm text-muted-foreground">
          Gere as tuas fotos, biografia, redes sociais, contactos da página Sobre, textos legais, canais da comunidade e configurações da plataforma.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="profile" className="gap-2">
            <UserCircle className="h-4 w-4" /> Sobre, Fotos & Contactos
          </TabsTrigger>
          <TabsTrigger value="legal" className="gap-2">
            <FileText className="h-4 w-4" /> Termos & Privacidade
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2">
            <Settings className="h-4 w-4" /> Sistema, Comunidade & Pagamentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <UserCircle className="h-4 w-4" /> Identidade & Biografia
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Field
                  label="Nome completo"
                  value={profile.full_name}
                  onChange={(v) => setProfile({ ...profile, full_name: v })}
                />
                <Field
                  label="Título / Headline"
                  value={profile.headline}
                  onChange={(v) => setProfile({ ...profile, headline: v })}
                  placeholder="Criador digital, developer e educador"
                />
                <div className="space-y-2">
                  <Label>Biografia (suporta vários parágrafos ou Markdown)</Label>
                  <Textarea
                    rows={6}
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Escreve a tua apresentação para a página Sobre e Hero..."
                  />
                </div>
                <GalleryEditor
                  label="As tuas fotos (sincronizadas automaticamente com o Hero e a página Sobre)"
                  value={profile.photos}
                  onChange={(photos) => setProfile({ ...profile, photos })}
                  folder="profile"
                />
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Contactos Públicos</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Email de contacto"
                    value={profile.contact_email}
                    onChange={(v) => setProfile({ ...profile, contact_email: v })}
                    placeholder="contacto@..."
                  />
                  <Field
                    label="Telefone"
                    value={profile.contact_phone}
                    onChange={(v) => setProfile({ ...profile, contact_phone: v })}
                    placeholder="+244 9..."
                  />
                  <Field
                    label="WhatsApp (número ou link)"
                    value={profile.whatsapp}
                    onChange={(v) => setProfile({ ...profile, whatsapp: v })}
                    placeholder="+244923000000"
                  />
                  <Field
                    label="Localização"
                    value={profile.location}
                    onChange={(v) => setProfile({ ...profile, location: v })}
                    placeholder="Luanda, Angola"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Share2 className="h-4 w-4" /> Redes Sociais
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  {socialFields.map((sf) => (
                    <Field
                      key={sf.key}
                      label={sf.label}
                      value={profile.social_links[sf.key] ?? ""}
                      placeholder={sf.placeholder}
                      onChange={(v) =>
                        setProfile({
                          ...profile,
                          social_links: { ...profile.social_links, [sf.key]: v },
                        })
                      }
                    />
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={saveProfile} disabled={savingProfile}>
              <Save className="mr-2 h-4 w-4" />
              {savingProfile ? "A guardar..." : "Guardar Perfil & Contactos"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="legal" className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Termos de Uso (Markdown)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Textarea
                  rows={14}
                  value={profile.terms_text}
                  onChange={(e) => setProfile({ ...profile, terms_text: e.target.value })}
                  placeholder="Escreve os Termos de Uso (se vazio, será mostrado o texto padrão)..."
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Política de Privacidade (Markdown)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Textarea
                  rows={14}
                  value={profile.privacy_text}
                  onChange={(e) => setProfile({ ...profile, privacy_text: e.target.value })}
                  placeholder="Escreve a Política de Privacidade (se vazio, será mostrado o texto padrão)..."
                />
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button onClick={saveProfile} disabled={savingProfile}>
              <Save className="mr-2 h-4 w-4" />
              {savingProfile ? "A guardar..." : "Guardar Textos Legais"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Settings className="h-4 w-4" /> Plataforma & Email
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Field
                  label="Nome da plataforma"
                  value={settings.platform_name}
                  onChange={(value) => setSettings({ ...settings, platform_name: value })}
                />
                <Field
                  label="Email de envio (Resend)"
                  value={settings.email_from}
                  onChange={(value) => setSettings({ ...settings, email_from: value })}
                  placeholder="noreply@..."
                />
                <Toggle
                  label="Envio de emails (Resend) ativo"
                  checked={settings.resend_enabled}
                  onChange={(value) => setSettings({ ...settings, resend_enabled: value })}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Pagamentos manuais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Field
                  label="IBAN / Conta"
                  value={settings.payment_iban}
                  onChange={(value) => setSettings({ ...settings, payment_iban: value })}
                />
                <Field
                  label="Titular da conta"
                  value={settings.payment_account_name}
                  onChange={(value) => setSettings({ ...settings, payment_account_name: value })}
                />
              </CardContent>
            </Card>

            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-4 w-4" /> Canais da Comunidade & Patrocínio
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                <Field
                  label="Grupo WhatsApp (URL)"
                  value={settings.community_whatsapp}
                  onChange={(value) => setSettings({ ...settings, community_whatsapp: value })}
                  placeholder="https://chat.whatsapp.com/..."
                />
                <Field
                  label="Canal Telegram (URL)"
                  value={settings.community_telegram}
                  onChange={(value) => setSettings({ ...settings, community_telegram: value })}
                  placeholder="https://t.me/..."
                />
                <Field
                  label="Servidor Discord (URL)"
                  value={settings.community_discord}
                  onChange={(value) => setSettings({ ...settings, community_discord: value })}
                  placeholder="https://discord.gg/..."
                />
                <div className="sm:col-span-3 space-y-2">
                  <Label>Mensagem de Patrocínio (/patrocinar)</Label>
                  <Textarea
                    rows={2}
                    value={settings.sponsorship_message}
                    onChange={(e) => setSettings({ ...settings, sponsorship_message: e.target.value })}
                    placeholder="O teu apoio permite-me continuar a criar conteúdo livre, ferramentas e experiências..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Feature toggles</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                <Toggle
                  label="AI Assistant"
                  checked={settings.enable_ai}
                  onChange={(value) => setSettings({ ...settings, enable_ai: value })}
                />
                <Toggle
                  label="Pagamentos"
                  checked={settings.enable_payments}
                  onChange={(value) => setSettings({ ...settings, enable_payments: value })}
                />
                <Toggle
                  label="Blog"
                  checked={settings.enable_blog}
                  onChange={(value) => setSettings({ ...settings, enable_blog: value })}
                />
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button onClick={saveSystemSettings} disabled={savingSettings}>
              <Save className="mr-2 h-4 w-4" />
              {savingSettings ? "A guardar..." : "Guardar definições"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border p-3">
      <Label>{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
