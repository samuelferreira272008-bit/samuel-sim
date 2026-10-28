import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Skeleton } from "@/components/ui/skeleton";
import { useSEO } from "@/lib/seo";
import { db } from "@/lib/repo";

const defaultTerms = `## 1. Aceitação dos Termos

Ao aceder e utilizar a plataforma **Samuel Simão**, concordas com os presentes Termos de Uso. Caso não concordes com algum dos termos, recomendamos que não utilizes a plataforma.

## 2. Uso da Plataforma e Conteúdos

Todo o conteúdo disponibilizado (artigos, projetos, ferramentas, aplicações, cursos e materiais) destina-se a fins educativos, informativos e profissionais. Não é permitida a redistribuição comercial não autorizada de conteúdos protegidos.

## 3. Produtos, Aplicações e Links Externos

As compras de produtos físicos ou digitais e transferências de aplicações podem redirecionar para plataformas externas de checkout ou contacto direto via WhatsApp. As condições específicas de entrega, licenciamento ou suporte são apresentadas na página de cada produto ou aplicação.

## 4. Conta de Utilizador

És responsável por manter a confidencialidade das tuas credenciais de acesso e por todas as atividades realizadas na tua conta.

## 5. Alterações

Reservamo-nos o direito de atualizar estes Termos de Uso a qualquer momento, sendo a versão atualizada publicada nesta página.`;

const defaultPrivacy = `## 1. Dados Recolhidos

Recolhemos apenas as informações essenciais para o funcionamento da plataforma, como nome, endereço de email e dados de perfil fornecidos voluntariamente no registo, subscrição de newsletter ou formulário de contacto.

## 2. Finalidade dos Dados

Os dados recolhidos são utilizados exclusivamente para:
- Autenticação e gestão da tua conta na plataforma;
- Envio de comunicações, novidades e newsletters (quando subscritas);
- Resposta a pedidos de contacto, suporte ou encomendas.

## 3. Partilha e Segurança

Não vendemos nem partilhamos os teus dados pessoais com terceiros para fins publicitários. Os dados são armazenados de forma segura com controlo de acesso.

## 4. Direitos do Utilizador

Podes solicitar a atualização ou eliminação da tua conta e dos teus dados pessoais a qualquer momento através da página de Contacto ou nas definições do teu painel.`;

export default function Legal({ kind }: { kind: "terms" | "privacy" }) {
  const isTerms = kind === "terms";
  const title = isTerms ? "Termos de Uso" : "Política de Privacidade";

  useSEO({
    title: `${title} — Samuel Simão`,
    description: `${title} da plataforma Samuel Simão.`,
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ["site-profile"],
    queryFn: async () => (await db.from("site_profile").select("*").limit(1).maybeSingle()).data,
  });

  const content = isTerms
    ? profile?.terms_text?.trim() || defaultTerms
    : profile?.privacy_text?.trim() || defaultPrivacy;

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">Legal</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-foreground">{title}</h1>
      {profile?.updated_at && (
        <p className="mt-2 text-sm text-muted-foreground">
          Última atualização: {new Date(profile.updated_at).toLocaleDateString("pt-PT")}
        </p>
      )}

      {isLoading ? (
        <div className="mt-8 space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : (
        <article className="prose prose-neutral mt-8 max-w-none dark:prose-invert rounded-2xl border border-border/60 bg-card p-6 sm:p-10">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </article>
      )}
    </div>
  );
}
