## Objetivo

1. **Corrigir o bloqueio de criação de projetos / ferramentas / lab** — atualmente o admin só consegue criar *posts* (blog), não consegue criar entradas em `content_items` (Projetos, Ferramentas, Lab).
2. **Elevar a UI** com animações, hero 3D, efeitos visuais ao estilo Google Labs e suporte a fotos pessoais.

---

## Parte 1 — Gestão de Projetos / Ferramentas / Lab (bug fix + feature)

**Causa do bug:** o painel `/admin/conteudo` só faz CRUD da tabela `posts`. As páginas públicas `/projetos`, `/ferramentas` e `/lab` leem de `content_items` — uma tabela sem qualquer interface de criação. Por isso o utilizador "não consegue criar projetos".

**Solução — nova página `/admin/projetos`** (ou tab adicional), com CRUD completo sobre `content_items`:

- Campos: `title`, `description`, `type` (project | tool | lab), `category_id`, `status` (active | wip | beta | alpha), `is_premium`, `content_url`, `thumbnail_url` (com upload para bucket `post-resources`).
- Listagem filtrável por tipo (Projetos / Ferramentas / Lab) com badges de status e categoria.
- Ações: criar, editar, eliminar, alternar premium/status.
- Item no sidebar do `AdminLayout`: "Projetos & Ferramentas" (ícone `Boxes`).
- Rota nova `src/pages/admin/AdminProjetos.tsx` registada em `App.tsx`.

Resultado: o admin passa a poder criar e gerir as entradas que aparecem em `/projetos`, `/ferramentas` e `/lab`.

---

## Parte 2 — Renovação visual (animações, 3D, fotos)

### Bibliotecas a adicionar
- `framer-motion` — animações de entrada, hover, scroll, stagger.
- `three`, `@react-three/fiber@^8.18`, `@react-three/drei@^9.122` — cena 3D no hero (versões compatíveis com React 18).
- Tailwind: keyframes adicionais (`fade-in`, `scale-in`, `float`, `gradient-shift`, `blob`) + utilitárias (`hover-scale`, `glass`, `shimmer`).

### Tokens de design (`index.css`)
- Adicionar variáveis: `--accent-glow`, `--gradient-hero`, `--gradient-mesh`, `--shadow-glow`, `--transition-smooth`.
- Manter tema atual mas introduzir gradientes suaves e glass-morphism para superfícies destacadas.

### Hero 3D / 2D (`Home.tsx`)
- Cena `react-three-fiber` à direita do hero: esfera distorcida (`MeshDistortMaterial` do drei) + partículas a flutuar, reativa ao movimento do rato. Com `Suspense` + fallback gradiente animado.
- Foto pessoal à esquerda num cartão "glass" com leve parallax e efeito de brilho que segue o cursor.
- Título com animação de entrada (palavra a palavra via framer-motion) e gradient shift.
- CTAs com `hover-scale` + ícones animados.
- Secção seguinte: faixa de "logos/projetos" em marquee infinito.
- Secção de features estilo Google Labs: cartões com tilt 3D no hover, gradiente animado no fundo, ícones em movimento subtil.

### Componentes reutilizáveis novos
- `src/components/visuals/HeroScene.tsx` — cena three.js.
- `src/components/visuals/AnimatedText.tsx` — texto com stagger.
- `src/components/visuals/GlowCard.tsx` — cartão com glow que segue o cursor.
- `src/components/visuals/Marquee.tsx` — faixa contínua.
- `src/components/visuals/PhotoFrame.tsx` — moldura para fotos pessoais com parallax.

### Aplicar à plataforma
- `MainLayout`: transições de página (`AnimatePresence` + fade/slide).
- `Navbar`: efeito glass ao fazer scroll.
- `Projetos`, `Ferramentas`, `Lab`: cards com `GlowCard`, entrada em stagger, skeleton com shimmer.
- `Sobre`: usa `PhotoFrame` para a foto do Samuel + timeline animada.
- `Footer`: gradiente animado subtil.

### Performance / acessibilidade
- Respeitar `prefers-reduced-motion` (desativa animações pesadas).
- 3D em lazy-load (`React.lazy`) para não pesar o bundle inicial.
- Fallback estático quando WebGL não estiver disponível.

### Fotos pessoais
- O utilizador deve fazer upload das fotos via chat (não há ainda no projeto). Enquanto não chegam, uso um placeholder `/placeholder.svg` no `PhotoFrame`, fácil de trocar depois.

---

## Ficheiros a criar / editar

**Criar**
- `src/pages/admin/AdminProjetos.tsx`
- `src/components/visuals/HeroScene.tsx`
- `src/components/visuals/AnimatedText.tsx`
- `src/components/visuals/GlowCard.tsx`
- `src/components/visuals/Marquee.tsx`
- `src/components/visuals/PhotoFrame.tsx`

**Editar**
- `src/App.tsx` (rota admin nova)
- `src/components/layout/AdminLayout.tsx` (sidebar item)
- `src/components/layout/MainLayout.tsx` (transições)
- `src/components/layout/Navbar.tsx` (glass on scroll)
- `src/pages/Home.tsx` (hero renovado)
- `src/pages/Sobre.tsx` (foto + animações)
- `src/pages/Projetos.tsx`, `Ferramentas.tsx`, `Lab.tsx` (cards animados)
- `src/index.css` + `tailwind.config.ts` (tokens, keyframes, utilitárias)
- `package.json` (deps novas)

---

## Notas

- Não toco em pagamentos.
- Para colocar a tua foto real, envia-a pelo chat após aprovar o plano e troco o placeholder.
