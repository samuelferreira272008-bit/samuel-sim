/**
 * Publicações e Conteúdos Curados da Marca Pessoal Samuel Simão
 * 
 * Conteúdo público profissional, focado em produtos, engenharia de software,
 * robótica prática e visão de negócio.
 */

export interface CuratedPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: "Negócios" | "Tecnologia" | "Educação" | "Espiritualidade" | "Vida Pessoal";
  published: boolean;
  accessLevel: "public" | "authenticated" | "premium";
  createdAt: string;
  readTime: string;
  authorName: string;
}

export interface CuratedContentItem {
  id: string;
  type: "project" | "app" | "content" | "tool" | "lab";
  title: string;
  description: string;
  body?: string;
  thumbnail_url?: string;
  content_url?: string;
  status: "published" | "beta" | "alpha" | "wip";
  version?: string;
  price?: number;
  currency?: string;
  created_at: string;
  is_premium?: boolean;
  category_name?: string;
}

export const CURATED_POSTS: CuratedPost[] = [
  {
    id: "post-unificar-samuel-simao",
    slug: "por-que-decidi-unificar-tudo-sob-meu-nome-samuel-simao",
    title: "Por que decidi unificar tudo sob o meu nome: Samuel Simão",
    excerpt: "Durante muito tempo criei marcas dispersas como D9, Seven, theNuvem e MiniStral. Em outubro de 2026, tomei a decisão estratégica de unificar todo o meu ecossistema.",
    category: "Negócios",
    published: true,
    accessLevel: "public",
    createdAt: "2026-10-15T10:00:00Z",
    readTime: "5 min de leitura",
    authorName: "Samuel Simão",
    coverImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
    content: `
# Por que decidi unificar tudo sob o meu nome: Samuel Simão

Se acompanhas o meu percurso desde o início, provavelmente já viste nomes diferentes associados às coisas que construo: **D9**, **Seven**, **Demonicast**, **Caracol**, **MiniStral**, **theNuvem**...

Durante bastante tempo, acreditei que precisava de criar uma marca diferente para cada ideia. Parecia o caminho natural: uma marca para software, um nome para conteúdos educativos, outro para ferramentas experimentais. Falava muitas vezes no plural — *"nós"*, *"a nossa equipa"* —, como se fosse necessário aparentar uma estrutura empresarial tradicional para ter credibilidade.

Em outubro de 2026, tomei uma decisão estratégica: **parar de fragmentar os meus esforços e unir tudo sob a minha própria marca pessoal.**

> **Tudo será Samuel Simão, sobre Samuel Simão, para Samuel Simão.**

---

## O valor de uma Marca Pessoal Unificada

No ecossistema digital contemporâneo, a clareza é o ativo mais valioso. Gerir múltiplas marcas secundárias dispersa energia, fragmenta a atenção dos utilizadores e dilui a confiança.

Compreendi três fatores essenciais:

1. **Transparência e Autoria Direta:** As pessoas conectam-se com criadores autênticos. Assumir a autoria direta de cada produto, artigo ou software cria uma relação de confiança imediata com a comunidade e com os clientes.
2. **Consolidação de Reputação:** Cada ferramenta bem construída e cada solução entregue reforça diretamente uma única assinatura: **Samuel Simão**.
3. **Comunicação em Primeira Pessoa:** Falar na primeira pessoa (*"eu construí"*, *"eu testei"*, *"este é o meu produto"*) é direto, profissional e elimina barreiras desnecessárias.

---

## A Plataforma como Produto Integrado

A minha plataforma foi arquitetada como um ecossistema digital completo:

* **Portfólio de Engenharia:** Apresentação de projetos de hardware, sistemas de automação e protótipos funcionais como o **REPI Rover** e o **Pafiworky**.
* **Repositório de Software & Aplicações:** Ambiente onde os utilizadores podem rodar ferramentas web úteis diretamente no navegador, sem atritos ou barreiras de instalação.
* **Publicações & Blog:** Artigos práticos, objetivos e fundamentados, orientados a desmistificar a tecnologia e capacitar profissionais e entusiastas.
* **Produtos Digitais:** Soluções desenhadas para resolver problemas reais de produtividade e presença digital.

---

## Princípios de Atuação

Tudo o que construo orienta-se por valores sólidos:

* **Integridade e Ética:** Compromisso absoluto com a verdade, transparência nos produtos e entrega rigorosa do que é prometido.
* **Excelência com Simplicidade:** Tecnologia só tem valor quando simplifica a vida das pessoas. Foco em experiência limpa e alta utilidade.
* **Criação de Valor Sustentável:** Construir produtos que resolvem dores reais e geram impacto positivo no mercado.

Esta plataforma é o reflexo da minha assinatura e da minha visão de produto.
    `,
  },
  {
    id: "post-como-a-internet-funciona",
    slug: "como-a-internet-realmente-funciona-explicacao-pratica",
    title: "Como a Internet realmente funciona: Uma explicação prática sem rodeios",
    excerpt: "Sem manuais chatos nem teoria desnecessária. Como é que os dados saem do teu dispositivo em Luanda e chegam aos servidores globais em milissegundos?",
    category: "Educação",
    published: true,
    accessLevel: "public",
    createdAt: "2026-10-18T14:30:00Z",
    readTime: "4 min de leitura",
    authorName: "Samuel Simão",
    coverImage: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80",
    content: `
# Como a Internet realmente funciona: Uma explicação prática e sem rodeios

Quase toda a gente usa a Internet todos os dias: enviamos mensagens instantâneas, consumimos streaming, realizamos pagamentos digitais e operamos serviços na nuvem. Contudo, quando se pergunta como tudo isso opera por baixo da superfície, a resposta comum costuma ser vaga: *"está na nuvem"*.

A infraestrutura real da Internet é física, fascinante e baseada em princípios de engenharia de telecomunicações extremamente práticos.

---

## 1. A Espinha Dorsal: Cabos Submarinos e Fibra Ótica

A primeira constatação importante: **mais de 95% do tráfego internacional de dados viaja por cabos de fibra ótica submarinos**, não por satélites.

Em Luanda, conectamo-nos a grandes rotas globais através de cabos de alta capacidade como o **SACS** (South Atlantic Cable System, conectando Angola diretamente ao continente americano) e o **WACS** (que percorre a costa ocidental africana até à Europa).

Quando acedes a um serviço sediado noutro continente, os teus pacotes de dados percorrem oceanos sob o leito marinho através de pulsos de luz laser a velocidades próximas da velocidade da luz.

---

## 2. A Estrutura de Endereçamento

Para que a informação chegue com precisão de um ponto A a um ponto B, a rede utiliza dois conceitos fundamentais:

### O Endereço IP (O Identificador Lógico)
Cada servidor, computador e telemóvel conectado à rede possui um **Endereço IP** exclusivo. Funciona como a coordenada exata de entrega de qualquer pacote digital.

### O DNS (A Tabela de Tradução)
Seria inviável memorizar endereços IP numéricos para cada serviço. O **DNS (Domain Name System)** atua como uma tabela de alta velocidade que traduz nomes legíveis por humanos (como \`google.com\`) para os endereços IP das máquinas onde as aplicações residem.

---

## 3. A Viagem de um Pacote de Dados em 4 Etapas:

1. **Fragmentação em Pacotes:** A tua requisição é dividida em fragmentos padronizados de dados (pacotes IP).
2. **Transmissão Rádio Local:** O dispositivo emite o sinal por radiofrequência até à torre de telecomunicações ou ao router local.
3. **Roteamento em Fibra Ótica:** Os pacotes entram na infraestrutura de fibra terrestre e submarina, sendo comutados por routers de alta performance em milissegundos.
4. **Reconstrução e Resposta:** O servidor de destino valida os pacotes, processa o pedido e envia os dados de retorno para o teu ecrã.

Todo este ciclo completa-se habitualmente em menos de 100 a 150 milissegundos.

---

## Engenharia Aplicada ao Utilizador

Compreender a infraestrutura que sustenta o mundo digital é o primeiro passo para criar aplicações robustas, otimizadas para redes com latências variadas e prontas para o mercado real.
    `,
  },
  {
    id: "post-repi-rover-robotica",
    slug: "projeto-repi-rover-robotica-em-angola",
    title: "O Projeto REPI Rover: Robótica e automação local com poucos recursos",
    excerpt: "Como desenhei e implementei um sistema de robótica com microcontrolador Arduino, shield L293D e estação meteorológica operando em rede local offline.",
    category: "Tecnologia",
    published: true,
    accessLevel: "public",
    createdAt: "2026-10-22T09:15:00Z",
    readTime: "6 min de leitura",
    authorName: "Samuel Simão",
    coverImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
    content: `
# O Projeto REPI Rover: Robótica e automação local com poucos recursos

No desenvolvimento de hardware e telecomunicações em Luanda, a teoria só se consolida quando enfrentamos os desafios práticos de prototipagem: limites de componentes, restrições energéticas e a necessidade de sistemas confiáveis que não dependam obrigatoriamente de conexão externa à Internet.

O **REPI Rover** nasceu dessa filosofia como um projeto de robótica e monitorização ambiental para desafios de inovação técnica.

---

## A Filosofia de Engenharia: Autonomia e Eficiência Local

Muitos sistemas modernos de robótica pecam por depender excessivamente de servidores remotos na nuvem para operações básicas. Num contexto prático, isso introduz pontos de falha e custos de largura de banda desnecessários.

A diretriz que estabeleci para o REPI Rover foi clara: **operação 100% autônoma e em tempo real sobre rede local descentralizada.**

---

## Arquitetura em Dois Nós

O ecossistema foi estruturado em dois nós de telemetria e controle:

### 1. Nó Móvel: Rover de Exploração (Endereço \`0x08\`)
* **Unidade de Processamento:** Microcontrolador dedicado com temporização precisa.
* **Sistema de Tração:** Shield de potência de motores L293D com 4 motores DC de engrenagem.
* **Sensorização de Prevenção de Obstáculos:** Sensor ultrassónico acoplado a servo motor para varredura angular (esquerda, centro, direita) antes da tomada de decisão de curso.
* **Gestão Energética:** Baterias com circuito de proteção e balanceamento.

### 2. Nó Fixo: Estação Meteorológica e de Alerta (Endereço \`0x09\`)
* **Telemetria Climática:** Sensor digital de temperatura e humidade ambiente (DHT11) e sensor fotossensível de luminosidade (LDR).
* **Deteção e Segurança:** Sensor de presença infravermelho passivo (PIR).
* **Atuadores:** Sinalizador acústico (buzzer), indicador ótico RGB e relé de potência para controle de iluminação física.

---

## Comunicação por Pacotes JSON em Rede Local

Para o controle e a telemetria, evitei fluxos pesados de dados. O sistema utiliza um **dicionário de comandos JSON otimizado**:

* O controlo é exercido através de interface web/móvel via Wi-Fi local ou conexão OTG direta;
* Mensagens leves de estado e comando garantem resposta instantânea sem latência perceptível;
* Modelos de inteligência artificial de alta velocidade (como **Groq** ou **Cerebras**) são consultados apenas para análises preditivas opcionais, preservando a estabilidade total das operações mecânicas locais.

---

## Conclusão

O REPI Rover exemplifica como princípios rigorosos de arquitetura de software e eletrónica permitem criar soluções de engenharia avançadas e plenamente funcionais com recursos controlados.
    `,
  },
  {
    id: "post-como-uso-ia-para-construir",
    slug: "como-uso-ia-para-construir-ferramentas-reais",
    title: "Como uso Inteligência Artificial para construir produtos e ferramentas reais",
    excerpt: "A tecnologia como alavanca produtiva. A filosofia do Pafiworky: complexidade para a máquina, simplicidade para o utilizador.",
    category: "Tecnologia",
    published: true,
    accessLevel: "public",
    createdAt: "2026-10-25T11:00:00Z",
    readTime: "5 min de leitura",
    authorName: "Samuel Simão",
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    content: `
# Como uso IA para construir produtos e ferramentas reais

Existe um mito no meio tecnológico de que o valor de um produto reside na quantidade de linhas de código escritas manualmente ou na complexidade artificial de uma solução.

A minha abordagem sempre foi diametralmente oposta: **o que define o sucesso de uma ferramenta é a velocidade e a eficácia com que ela resolve o problema do utilizador.**

---

## A Filosofia do Pafiworky

O projeto **Pafiworky** foi desenhado em torno de uma máxima fundamental:

> *"Complexidade para a máquina. Simplicidade para o utilizador."*

Quem utiliza uma ferramenta digital quer resultados rápidos, estabilidade e uma interface intuitiva. Toda a engenharia de backend, APIs e integrações deve existir para facilitar a vida do cliente, nunca para criar fricção.

No meu fluxo de trabalho, utilizo ferramentas de ponta de Inteligência Artificial — como **Claude**, **Lovable**, **Groq** e **Cerebras** — como aceleradores de arquitetura e prototipagem:

1. **Engenharia de Requisitos:** Definição rigorosa da dor do utilizador e da jornada de experiência.
2. **Modelagem de Dados & Arquitetura:** Especificação de contratos de API, schemas de banco de dados e regras de segurança.
3. **Execução Acelerada:** Utilização de modelos de linguagem para geração precisa de boilerplate e testes de validação.
4. **Refinamento e Garantia de Qualidade:** Testes exaustivos de UX, performance e acessibilidade em dispositivos reais.

---

## Acessibilidade e Eficiência

A proliferação de modelos de inferência rápida permite que criadores independentes entreguem soluções com o mesmo nível de polimento e robustez de grandes equipes de tecnologia.

O segredo não é delegar o pensamento à máquina, mas sim ter clareza de visão, critério de design e foco constante em gerar valor real para o cliente final.
    `,
  },
  {
    id: "post-valores-e-visao-de-negocio",
    slug: "valores-solidos-e-visao-de-negocio",
    title: "Valores sólidos e visão de negócio: Os princípios que guiam os meus projetos",
    excerpt: "Construir produtos sustentáveis, gerar rendimentos honestos e capacitar a comunidade. A integridade e o trabalho diligente como pilares inegociáveis.",
    category: "Vida Pessoal",
    published: true,
    accessLevel: "public",
    createdAt: "2026-10-28T16:00:00Z",
    readTime: "4 min de leitura",
    authorName: "Samuel Simão",
    coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    content: `
# Valores sólidos e visão de negócio: Os princípios que guiam os meus projetos

Tenho objetivos empresariais claros e ambiciosos: construir um negócio de tecnologia sustentável, diversificar fontes de receita online em moeda forte e em kwanzas, e desenvolver produtos com alcance global.

No entanto, o crescimento financeiro desprovido de princípios éticos é insustentável. Em todos os projetos que assino, mantenho diretrizes claras:

---

## 1. Fé Cristã e Integridade Ética

A fé em Deus e a ética cristã são os alicerces das minhas decisões profissionais. O trabalho diligente, a honestidade absoluta com clientes e parceiros e a transparência em cada transação são regras fundamentais.

Construir com base sólida significa entregar sempre o que é prometido, sem exageros comerciais ou atalhos duvidosos.

---

## 2. Disciplina e Aprendizado Contínuo

O conhecimento técnico não é um destino estático, mas uma busca diária. Cada linha de código, teste de circuito ou arquitetura de software é fruto de disciplina rigorosa, estudo constante e foco em domínio prático.

---

## 3. Criar Valor e Capacitar Pessoas

Um dos princípios que levo comigo em todas as iniciativas:

> *"O sucesso genuíno mede-se pelo valor que criamos para a vida dos outros."*

A tecnologia é uma ferramenta formidável de democratização de oportunidades. Quando construo uma aplicação acessível, escrevo um guia prático ou desenho um produto digital eficiente, o objetivo central é sempre empoderar utilizadores e empreendedores para que prosperem.

A marca **Samuel Simão** continuará a expandir-se com base nesta visão.
    `,
  },
];

export const CURATED_PROJECTS: CuratedContentItem[] = [
  {
    id: "proj-repi-rover",
    type: "project",
    title: "REPI Rover & Estação de Telemetria Ambiental",
    description: "Sistema avançado de robótica móvel e monitorização climática local. Integração de microcontroladores, shield de tração L293D, sensores ambientais (temperatura, luminosidade e presença) com operação 100% autônoma em rede local.",
    status: "published",
    created_at: "2026-10-22T00:00:00Z",
    thumbnail_url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
    category_name: "Robótica & Hardware",
    body: `
# REPI Rover & Estação de Telemetria Ambiental

Projeto de engenharia de hardware e automação desenvolvido para demonstrações de telemetria autônoma e robótica móvel em Luanda.

### Especificações Técnicas:
* **Nó Móvel (0x08):** Unidade de controlo com tração integral de 4 motores DC via shield L293D, sensor ultrassónico HC-SR04 montado sobre servomotor para varredura angular e algoritmo de evasão de colisões.
* **Nó Fixo (0x09):** Telemetria climática de temperatura e humidade (DHT11), sensor crepuscular (LDR), deteção volumétrica de presença (PIR) e acionamento por relé de potência.
* **Comunicação:** Protocolo baseado em pacotes JSON ultraleves sobre rede Wi-Fi local sem dependência de acesso à Internet pública.
    `,
  },
  {
    id: "proj-pafiworky-assistant",
    type: "project",
    title: "Pafiworky — Automação & Assistente Inteligente",
    description: "Plataforma de automação e assistência desenhada sob o princípio: 'Complexidade para a máquina. Simplicidade para o utilizador.' Otimização de fluxos de trabalho e simplificação de rotinas digitais.",
    status: "published",
    created_at: "2026-10-10T00:00:00Z",
    thumbnail_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    category_name: "Inteligência Artificial",
    body: `
# Pafiworky — Automação & Assistente Inteligente

Solução orientada a acelerar processos e eliminar tarefas repetitivas para profissionais e empreendedores digitais.

### Destaques:
* Orquestração fluida de tarefas digitais.
* Interface tátil e intuitiva com mínima curva de aprendizado.
* Conexão com motores de processamento e modelos de linguagem de resposta rápida.
    `,
  },
  {
    id: "proj-samuka-play",
    type: "project",
    title: "Samuka Play — Plataforma de Mídia & Streaming",
    description: "Arquitetura de distribuição de conteúdo multimédia otimizada para alto desempenho, baixa latência e consumo eficiente de dados móveis em redes angolanas.",
    status: "published",
    created_at: "2026-09-15T00:00:00Z",
    thumbnail_url: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=800&q=80",
    category_name: "Aplicações Web",
  },
  {
    id: "proj-linkduo",
    type: "project",
    title: "LinkDuo — Micro-Websites & Conversão Rápida",
    description: "Ferramenta para criação instantânea de páginas de links profissionais e micro-sites de alta conversão para empreendedores e prestadores de serviços.",
    status: "published",
    created_at: "2026-08-20T00:00:00Z",
    thumbnail_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    category_name: "Produtos Digitais",
  },
];

export const CURATED_LAB_ITEMS: CuratedContentItem[] = [
  {
    id: "lab-explainroo-pipeline",
    type: "lab",
    title: "Pipeline Explainroo (Motion & Vídeo Educativo)",
    description: "Pesquisa e automação de roteiros para geração de vídeos explicativos em formato paper motion de 3 a 5 minutos, orientados a simplificar a tecnologia para o público geral.",
    status: "beta",
    created_at: "2026-10-20T00:00:00Z",
    category_name: "Automação Multimédia",
  },
  {
    id: "lab-app-sandbox-iframe",
    type: "lab",
    title: "Motor Sandbox Web para Execução de Aplicações",
    description: "Mecanismo para carregar, isolar e executar aplicações e ferramentas web diretamente na plataforma sem necessidade de download ou configuração local.",
    status: "published",
    created_at: "2026-10-28T00:00:00Z",
    category_name: "Engenharia Web",
  },
  {
    id: "lab-groq-cerebras-node",
    type: "lab",
    title: "Motor de Inferência Ultrarrápida de IA",
    description: "Testes e benchmarks de inferência de altíssima velocidade (<150ms) com arquiteturas LPU e aceleradores para assistentes e análise documental.",
    status: "alpha",
    created_at: "2026-10-12T00:00:00Z",
    category_name: "Inteligência Artificial",
  },
];
