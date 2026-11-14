-- Migration: Seed curated articles into public.posts, populate starter digital products/services,
-- clean duplicate 'Opencut' app entry, normalize OpenCut URL, and enable authenticated checkout inserts.

-- 1. Clean duplicate 'Opencut' beta entry and fix 'OpenCut' URL missing https://
UPDATE public.content_items
SET content_url = 'https://opencut.app/',
    description = COALESCE(NULLIF(description, ''), 'Editor de vídeo moderno e direto no navegador, sem complicações de instalação.')
WHERE id = '76891cf7-7eb8-4007-bcc0-5fd06096ca79'
   OR (lower(trim(title)) = 'opencut' AND status = 'published');

DELETE FROM public.content_items
WHERE id = '9bc18ef1-eda3-4dd9-b28f-7f68f65a7488'
   OR (lower(trim(title)) = 'opencut' AND status = 'beta' AND id <> '76891cf7-7eb8-4007-bcc0-5fd06096ca79');

-- 2. Migrate the 5 curated posts into public.posts with real UUIDs
DO $$
DECLARE
  _author_id uuid;
  _cat_negocios uuid;
  _cat_educacao uuid;
  _cat_tecnologia uuid;
  _cat_vida uuid;
BEGIN
  SELECT COALESCE(
    (SELECT user_id FROM public.user_roles WHERE role = 'admin' LIMIT 1),
    (SELECT author_id FROM public.posts LIMIT 1),
    '00000000-0000-0000-0000-000000000000'::uuid
  ) INTO _author_id;

  SELECT id INTO _cat_negocios FROM public.categories WHERE slug = 'negocios' OR lower(name) = 'negócios' LIMIT 1;
  SELECT id INTO _cat_educacao FROM public.categories WHERE slug = 'educacao' OR lower(name) = 'educação' LIMIT 1;
  SELECT id INTO _cat_tecnologia FROM public.categories WHERE slug = 'tecnologia' OR lower(name) = 'tecnologia' LIMIT 1;
  SELECT id INTO _cat_vida FROM public.categories WHERE slug = 'vida-pessoal' OR lower(name) = 'vida pessoal' LIMIT 1;

  INSERT INTO public.posts (title, slug, excerpt, content, cover_image, category_id, access_level, content_type, published, author_id, created_at)
  VALUES
    (
      'Por que decidi unificar tudo sob o meu nome: Samuel Simão',
      'por-que-decidi-unificar-tudo-sob-meu-nome-samuel-simao',
      'Durante muito tempo criei marcas dispersas como D9, Seven, theNuvem e MiniStral. Em outubro de 2026, tomei a decisão estratégica de unificar todo o meu ecossistema.',
      E'# Por que decidi unificar tudo sob o meu nome: Samuel Simão\n\nSe acompanhas o meu percurso desde o início, provavelmente já viste nomes diferentes associados às coisas que construo: **D9**, **Seven**, **Demonicast**, **Caracol**, **MiniStral**, **theNuvem**...\n\nDurante bastante tempo, acreditei que precisava de criar uma marca diferente para cada ideia. Em outubro de 2026, tomei uma decisão estratégica: **parar de fragmentar os meus esforços e unir tudo sob a minha própria marca pessoal.**\n\n> **Tudo será Samuel Simão, sobre Samuel Simão, para Samuel Simão.**\n\n## O valor de uma Marca Pessoal Unificada\n\n1. **Transparência e Autoria Direta:** As pessoas conectam-se com criadores autênticos.\n2. **Consolidação de Reputação:** Cada ferramenta bem construída reforça diretamente uma única assinatura: **Samuel Simão**.\n3. **Comunicação em Primeira Pessoa:** Falar na primeira pessoa (*"eu construí"*, *"eu testei"*, *"este é o meu produto"*) é direto e elimina barreiras desnecessárias.',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
      _cat_negocios,
      'public',
      'blog',
      true,
      _author_id,
      '2026-10-15T10:00:00Z'
    ),
    (
      'Como a Internet realmente funciona: Uma explicação prática sem rodeios',
      'como-a-internet-realmente-funciona-explicacao-pratica',
      'Sem manuais chatos nem teoria desnecessária. Como é que os dados saem do teu dispositivo em Luanda e chegam aos servidores globais em milissegundos?',
      E'# Como a Internet realmente funciona: Uma explicação prática e sem rodeios\n\nMais de **95% do tráfego internacional de dados viaja por cabos de fibra ótica submarinos**, como o **SACS** e o **WACS**, conectando Angola ao mundo através de pulsos de luz laser.\n\n## Endereçamento IP e DNS\n* **Endereço IP:** A coordenada exata de cada dispositivo conectado.\n* **DNS:** A tabela de tradução rápida que converte nomes legíveis em endereços IP.\n\n## A Viagem de um Pacote em 4 Etapas\n1. Fragmentação em pacotes\n2. Transmissão rádio local\n3. Roteamento em fibra ótica\n4. Reconstrução e resposta no teu ecrã.',
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80',
      _cat_educacao,
      'public',
      'blog',
      true,
      _author_id,
      '2026-10-18T14:30:00Z'
    ),
    (
      'O Projeto REPI Rover: Robótica e automação local com poucos recursos',
      'projeto-repi-rover-robotica-em-angola',
      'Como desenhei e implementei um sistema de robótica com microcontrolador Arduino, shield L293D e estação meteorológica operando em rede local offline.',
      E'# O Projeto REPI Rover: Robótica e automação local com poucos recursos\n\nO **REPI Rover** nasceu para operar de forma **100% autónoma e em tempo real sobre rede local descentralizada**, sem depender de servidores externos.\n\n## Arquitetura em Dois Nós\n* **Nó Móvel (0x08):** Tração integral de 4 motores DC via shield L293D e sensor ultrassónico montado sobre servomotor.\n* **Nó Fixo (0x09):** Estação meteorológica e alerta com temperatura/humidade (DHT11), luminosidade (LDR), presença (PIR) e relé de potência.\n* **Protocolo:** Mensagens JSON leves sobre Wi-Fi local.',
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
      _cat_tecnologia,
      'public',
      'blog',
      true,
      _author_id,
      '2026-10-22T09:15:00Z'
    ),
    (
      'Como uso Inteligência Artificial para construir produtos e ferramentas reais',
      'como-uso-ia-para-construir-ferramentas-reais',
      'A tecnologia como alavanca produtiva. A filosofia do Pafiworky: complexidade para a máquina, simplicidade para o utilizador.',
      E'# Como uso IA para construir produtos e ferramentas reais\n\nO que define o sucesso de uma ferramenta é a velocidade e a eficácia com que resolve o problema do utilizador.\n\n> *"Complexidade para a máquina. Simplicidade para o utilizador."*\n\nNo meu fluxo de trabalho aplico rigor em requisitos, modelagem de dados, aceleração com IA e validação exaustiva em dispositivos reais.',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      _cat_tecnologia,
      'public',
      'blog',
      true,
      _author_id,
      '2026-10-25T11:00:00Z'
    ),
    (
      'Valores sólidos e visão de negócio: Os princípios que guiam os meus projetos',
      'valores-solidos-e-visao-de-negocio',
      'Construir produtos sustentáveis, gerar rendimentos honestos e capacitar a comunidade. A integridade e o trabalho diligente como pilares inegociáveis.',
      E'# Valores sólidos e visão de negócio: Os princípios que guiam os meus projetos\n\nCrescimento financeiro sem princípios éticos é insustentável. Em tudo o que construo mantenho três diretrizes:\n\n1. **Fé Cristã e Integridade Ética**\n2. **Disciplina e Aprendizado Contínuo**\n3. **Criar Valor e Capacitar Pessoas**',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      _cat_vida,
      'public',
      'blog',
      true,
      _author_id,
      '2026-10-28T16:00:00Z'
    )
  ON CONFLICT (slug) DO NOTHING;
END $$;

-- 3. Populate starter digital products & services in public.products
INSERT INTO public.products (name, description, price, currency, type, image_url, whatsapp_url, is_active, payment_metadata)
SELECT
  v.name,
  v.description,
  v.price,
  v.currency,
  v.type,
  v.image_url,
  '+244955142515',
  true,
  v.payment_metadata::jsonb
FROM (
  VALUES
    (
      'Kit LinkDuo — Micro-Site Profissional & Catálogo WhatsApp',
      'Template web completo e código-fonte pronto a publicar para criadores, freelancers e negócios angolanos apresentarem os seus serviços e receberem encomendas diretas no WhatsApp.',
      15000,
      'AOA',
      'template',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80',
      '{"methods":["multicaixa","bai_direto","paypal"],"usd_price":18,"delivery":"Acesso imediato ao código e guia passo a passo após confirmação"}'
    ),
    (
      'Consultoria Técnica & Arquitetura de Projeto (1:1 — 60 min)',
      'Sessão privada comigo por videochamada para estruturar o teu produto digital, escolher as ferramentas certas, integrar IA ou desbloquear o desenvolvimento do teu projeto.',
      25000,
      'AOA',
      'digital',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1000&q=80',
      '{"methods":["multicaixa","bai_direto","paypal"],"usd_price":30,"delivery":"Agendamento direto nas próximas 24h após confirmação"}'
    ),
    (
      'Guia Prático: Construir e Lançar Ferramentas Digitais com IA',
      'Manual objetivo em português acessível sobre como transformo ideias em ferramentas web reais combinando arquitetura simples, automação e modelos de IA rápidos.',
      8500,
      'AOA',
      'ebook',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
      '{"methods":["multicaixa","bai_direto","paypal"],"usd_price":10,"delivery":"Download em PDF + checklists editáveis após confirmação"}'
    ),
    (
      'Desenvolvimento de Website & Sistema Web Sob Medida',
      'Construo o teu website ou plataforma digital completa com design moderno, painel de gestão, SEO configurado e integração direta para vendas em Angola e no exterior.',
      95000,
      'AOA',
      'digital',
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1000&q=80',
      '{"methods":["multicaixa","bai_direto","paypal"],"usd_price":110,"delivery":"Kickoff em 48h e entrega faseada com acompanhamento direto"}'
    )
) AS v(name, description, price, currency, type, image_url, payment_metadata)
WHERE NOT EXISTS (
  SELECT 1 FROM public.products p WHERE lower(p.name) = lower(v.name)
);

-- 4. Expose public checkout details safely via RPC and allow authenticated users to submit pending orders
CREATE OR REPLACE FUNCTION public.get_public_checkout_info()
RETURNS TABLE (
  platform_name text,
  payment_iban text,
  payment_account_name text,
  enable_payments boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT platform_name, payment_iban, payment_account_name, enable_payments
  FROM public.platform_settings
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_checkout_info() TO anon, authenticated;

DROP POLICY IF EXISTS "Users can create their own pending purchases" ON public.purchases;
CREATE POLICY "Users can create their own pending purchases"
  ON public.purchases FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

DROP POLICY IF EXISTS "Users can create their own manual payment reviews" ON public.manual_payment_reviews;
CREATE POLICY "Users can create their own manual payment reviews"
  ON public.manual_payment_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- 5. Keep site_profile location defaulting cleanly
UPDATE public.site_profile
SET location = COALESCE(NULLIF(trim(location), ''), 'Luanda, Angola')
WHERE location IS NULL OR trim(location) = '';
