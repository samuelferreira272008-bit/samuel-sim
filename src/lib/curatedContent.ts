/**
 * Publicações e Conteúdos Curados da Marca Pessoal Samuel Simão
 * 
 * Informações autênticas baseadas na história, projetos escolares no IMPTEL,
 * projetos de software e visão de negócio de Samuel Simão.
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
    excerpt: "Durante muito tempo criei marcas dispersas como D9, Seven, theNuvem e MiniStral. Em outubro de 2026, tomei a decisão mais importante: tudo será Samuel Simão.",
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

Durante bastante tempo, acreditei que precisava de criar uma marca diferente para cada ideia. Parecia a coisa certa a fazer: uma "empresa" para software, um nome para tutoriais, outro para ferramentas experimentais. Falava muitas vezes no plural — *"nós"*, *"a nossa equipa"*, *"a nossa empresa"* —, como se precisasse de esconder que era apenas um jovem estudante em Luanda, com um computador, muita curiosidade e vontade de vencer.

Em outubro de 2026, parei para refletir e tomei uma decisão definitiva: **parar de fragmentar os meus esforços e unir tudo sob a minha própria identidade.**

> **Tudo será Samuel Simão, sobre Samuel Simão, para Samuel Simão.**

---

## O peso de manter várias marcas invisíveis

Quando tens recursos limitados e estás a aprender, tentar gerir cinco marcas diferentes não é estratégia — é dispersão de energia. Cada projeto exigia um logótipo novo, uma página nova, redes sociais novas e uma mensagem diferente. No final, as pessoas não sabiam onde me encontrar nem quem estava verdadeiramente por trás daquilo.

Percebi três verdades fundamentais:

1. **As pessoas conectam-se com pessoas reais:** Ninguém quer seguir mais uma agência fictícia sem rosto. As pessoas querem ver quem está a construir, as vitórias e as dificuldades reais.
2. **A minha reputação é o meu maior ativo:** Se eu construir uma boa ferramenta, quero que o meu nome esteja nela. Se eu errar, quero assumir a responsabilidade e aprender com isso.
3. **Falar na primeira pessoa é libertador:** Eu não sou uma multinacional. Sou o **Samuel Simão**, estudante de Eletrónica e Telecomunicações no IMPTEL, em Camama. Dizer *"eu construí"*, *"eu testei"* e *"este é o meu projeto"* é muito mais honesto e direto do que fingir um conselho de administração.

---

## O que é hoje o ecossistema Samuel Simão?

A minha plataforma não é apenas um portfólio para mostrar trabalhos passados. Ela é a minha base de operações digitais, desenhada para crescer comigo nos próximos anos. Aqui reuni:

* **O meu Portfólio & Projetos:** Onde mostro protótipos reais como o **REPI Rover**, o **Pafiworky** e as ferramentas que construo.
* **Repositório de Aplicações:** Onde qualquer pessoa pode testar e executar programas diretamente no navegador, sem complicações.
* **Conteúdos & Blog:** Onde partilho explicações práticas, sem rodeios e sem vocabulário técnico desnecessário, para quem quer aprender a usar a tecnologia no dia a dia.
* **Produtos Digitais & Físicos:** Soluções que crio para resolver problemas reais e gerar valor sustentável.
* **Comunidade:** Um espaço para trocar ideias com quem também quer crescer na área de tecnologia e negócios em Angola e pelo mundo fora.

---

## Os valores que não negoceio

Tudo o que construo apoia-se em quatro pilares simples:

* **Deus e a minha Fé Cristã:** É a base do meu caráter e das minhas decisões.
* **Família e Estudo:** O compromisso com o meu percurso escolar no IMPTEL e o respeito por quem me apoia.
* **Honestidade Absoluta:** Não invento testes que não fiz, não prometo resultados mágicos e não finjo ser o que ainda não sou.
* **Servir os outros:** Acredito verdadeiramente que ser feliz também é fazer os outros felizes transmitindo conhecimento útil.

Este site e as publicações que vais ver aqui são o reflexo direto de quem eu sou. Bem-vindo à minha jornada.
    `,
  },
  {
    id: "post-como-a-internet-funciona",
    slug: "como-a-internet-realmente-funciona-explicacao-pratica",
    title: "Como a Internet realmente funciona: Uma explicação sem rodeios nem termos complicados",
    excerpt: "Sem manuais chatos nem teoria desnecessária. Como é que uma mensagem tua sai do Camama em Luanda e chega aos servidores do WhatsApp do outro lado do mundo em milissegundos?",
    category: "Educação",
    published: true,
    accessLevel: "public",
    createdAt: "2026-10-18T14:30:00Z",
    readTime: "4 min de leitura",
    authorName: "Samuel Simão",
    coverImage: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80",
    content: `
# Como a Internet realmente funciona: Sem rodeios nem termos complicados

Quase toda a gente usa a Internet todos os dias em Angola: mandamos mensagens no WhatsApp, vemos vídeos no YouTube, fazemos transferências no BAI Direto ou Multicaixa Express. Mas se perguntares à maioria das pessoas como isso realmente acontece, a resposta costuma ser: *"está na nuvem"* ou *"vem dos satélites"*.

A verdade é muito mais prática, fascinante e física do que parece. Preparei esta explicação como parte do roteiro que desenhei para os meus vídeos explicativos no **Explainroo**.

---

## 1. A Internet não é mágica no ar: são cabos debaixo da terra e do mar

A primeira coisa que precisas de saber: **a maior parte da Internet é física**. 

Não são satélites a fazer o trabalho pesado. Mais de 95% do tráfego internacional viaja por cabos de fibra ótica submarinos que atravessam os oceanos. Aqui mesmo em Luanda, temos cabos como o **SACS** (South Atlantic Cable System, que liga Angola ao Brasil através do Atlântico Sul) e o **WACS** (que desce pela costa ocidental de África).

Quando abres um site hospedado nos Estados Unidos ou na Europa, o sinal luminoso viaja literalmente por baixo do mar a velocidades próximas da velocidade da luz.

---

## 2. A analogia simples: Moradas e Correios

Para entenderes o caminho de qualquer dado, pensa no sistema de encomendas:

### O Endereço IP (O número da tua casa)
Cada telemóvel, computador ou servidor ligado à rede recebe um número único chamado **Endereço IP** (por exemplo: \`192.168.1.1\` ou \`102.165.34.12\`). É a morada exata do teu dispositivo no mundo digital.

### O DNS (A tua lista de contactos telefónica)
Tu não decoras que o Google mora no número \`142.250.190.46\`. Tu só escreves \`google.com\`.
O **DNS (Domain Name System)** é como a lista de contactos do teu telefone: tu procuras pelo nome do amigo (*"Samuel Simão"*), e o telefone marca o número dele. O DNS converte o nome bonito do site no endereço IP do computador onde esse site está guardado.

---

## 3. Como uma mensagem tua viaja em 4 passos:

1. **A tua mensagem é dividida em pacotes:** Quando clicas em "Enviar", o teu telemóvel não manda o ficheiro inteiro de uma só vez. Ele divide o texto ou a foto em pedacinhos minúsculos chamados **pacotes de dados**.
2. **O teu router / antena direciona os pacotes:** Os pacotes saem do teu telemóvel por ondas de rádio (Wi-Fi ou dados móveis 4G/5G) até à antena da operadora em Luanda.
3. **A autoestrada da fibra:** A antena entrega os pacotes à rede de fibra ótica subterrânea e submarina, que os encaminha através de vários pontos chamados **routers**.
4. **Montagem no destino:** O servidor onde o site ou aplicação está alojado recebe todos os pacotes, verifica se falta algum, junta tudo na ordem correta e envia a resposta de volta para o teu ecrã.

Tudo isto acontece em **menos de 150 milissegundos**.

---

## Por que é que isto importa?

Quando compreendes o básico de como as coisas funcionam por baixo do capô, deixas de ter medo da tecnologia. Não precisas de saber programar em C ou configurar routers empresariais para tirar partido das ferramentas digitais.

É exatamente isso que procuro transmitir nos meus conteúdos: **desmistificar a tecnologia para que qualquer pessoa possa usar o conhecimento para construir os seus próprios negócios e projetos.**
    `,
  },
  {
    id: "post-repi-rover-imptel",
    slug: "projeto-repi-rover-imptel-robotica-em-angola",
    title: "O Projeto REPI Rover no IMPTEL: Robótica e automação local com poucos recursos",
    excerpt: "Como desenvolvemos no IMPTEL (Camama) um sistema de robótica com Arduino, shield L293D e estação meteorológica funcionando 100% em rede local sem precisar de gastar saldo de dados.",
    category: "Tecnologia",
    published: true,
    accessLevel: "public",
    createdAt: "2026-10-22T09:15:00Z",
    readTime: "6 min de leitura",
    authorName: "Samuel Simão",
    coverImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
    content: `
# O Projeto REPI Rover no IMPTEL: Robótica e automação com poucos recursos

No **IMPTEL** (Instituto Médio Politécnico de Telecomunicações), em Camama, Luanda, aprendemos todos os dias que a teoria de Eletrónica e Telecomunicações só ganha vida quando colocamos as mãos nos componentes, queimamos alguns fusíveis e resolvemos problemas práticos.

Para o **Curiosity Challenge 2026**, liderei e desenvolvi com os meus colegas um projeto que me orgulha bastante: o **REPI Rover**.

---

## O Desafio: Construir algo funcional numa realidade com restrições

Em muitas escolas pelo mundo, os alunos têm kits caros e conexões de Internet de alta velocidade dedicadas nos laboratórios. Na nossa realidade, tínhamos de lidar com:

* Orçamento restrito para aquisição de peças;
* Falta de internet estável no laboratório para telemetria pesada na nuvem;
* Necessidade de demonstrar o sistema em tempo real para um público de 30 a 50 pessoas sem falhas de conexão.

A nossa resposta foi engenharia inteligente: **desenvolver uma arquitetura descentralizada e 100% autônoma numa rede local.**

---

## A Arquitetura em Dois Nós

Dividimos o projeto em dois nós principais que comunicam de forma eficiente:

### 1. Nó Rover (Endereço I²C \`0x08\`)
O veículo móvel de exploração:
* **Cérebro:** Microcontrolador Arduino;
* **Tração:** Shield de motores L293D com 4 motores DC de engrenagem;
* **Navegação:** Sensor de distância ultrassónico HC-SR04 montado sobre um servo motor para mapear obstáculos à esquerda, ao centro e à direita antes de tomar decisões de manobra;
* **Alimentação:** Pack de baterias recarregáveis com balanceamento de carga.

### 2. Nó Estação Base / Ambiental (Endereço I²C \`0x09\`)
A estação fixa de monitorização e suporte:
* **Sensores ambientais:** DHT11 (temperatura e humidade do ar) e LDR (sensor de luminosidade);
* **Segurança e presença:** Sensor infravermelho passivo (PIR);
* **Atuadores:** Buzzer sonoro de alarme, LED RGB para indicação de estado e módulo relé para ligar e desligar iluminação física de apoio.

---

## A Escolha Técnica: Dicionário JSON em Rede Local Offline

Em vez de enviar fluxos contínuos de vídeo ou telemetria pesada que saturariam a rede, estruturámos a comunicação através de um **dicionário de comandos JSON simples e leves**.

* O controlo principal é feito via telemóvel ou computador local via **Wi-Fi local ou conexão OTG**;
* O dashboard no computador lê e envia pacotes JSON limpos (ex: \`{"cmd":"MOVE","dir":"FWD","speed":200}\`);
* A Internet só é ativada quando queremos solicitar análises inteligentes a modelos de IA rápidos (como **Groq** ou **Cerebras**), mantendo todo o funcionamento vital do robô totalmente operacional mesmo que a internet caia por completo.

---

## A Lição Mais Importante

Este projeto provou-me que não precisas de estar num laboratório milionário no estrangeiro para fazer robótica de verdade. Quando compreendes a eletrónica básica, a lógica de programação e sabes liderar uma equipa focada em soluções simples, consegues criar tecnologia impressionante com os componentes disponíveis aqui mesmo em Angola.

O REPI Rover é um dos projetos centrais do meu percurso e continuará a evoluir nesta plataforma.
    `,
  },
  {
    id: "post-como-uso-ia-para-construir",
    slug: "como-uso-ia-para-construir-ferramentas-reais",
    title: "Como uso Inteligência Artificial para construir ferramentas reais (sem ser um génio da programação)",
    excerpt: "Não sou um sénior com dez anos de código. Sou um estudante a aprender que usa a IA como extensão do cérebro. A filosofia do Pafiworky: complexidade para a máquina, simplicidade para o utilizador.",
    category: "Tecnologia",
    published: true,
    accessLevel: "public",
    createdAt: "2026-10-25T11:00:00Z",
    readTime: "5 min de leitura",
    authorName: "Samuel Simão",
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    content: `
# Como uso IA para construir ferramentas reais (sem ser um génio da programação)

Existe um mito muito comum na Internet de que para criar ferramentas úteis, plataformas e aplicações precisas de dominar cinco linguagens de programação, passar anos a estudar algoritmos complexos e decorar todas as linhas de código.

Eu quero ser muito honesto contigo: **eu não sou um programador profissional sénior**. 

Estou a estudar Eletrónica e Telecomunicações na 13ª classe. O que eu tenho é uma curiosidade gigante, clareza sobre o que quero construir e uma ferramenta poderosa nas mãos: a **Inteligência Artificial utilizada como extensão do meu cérebro.**

---

## A Filosofia do Pafiworky

Um dos projetos que explorei e que melhor resume o meu pensamento é o **Pafiworky**. A frase que guia esse projeto é simples:

> *"Complexidade para a máquina. Simplicidade para o utilizador."*

O utilizador comum não quer saber se o código foi feito em TypeScript, se corre num container Docker ou se usa algoritmos recursivos. Ele quer uma coisa só: **resolver o problema dele no menor tempo possível e sem dor de cabeça.**

Quando uso ferramentas como **Lovable**, **Claude**, **Groq** ou **Cerebras**, eu não peço à IA para fazer "mágica". Eu atuo como o arquiteto da solução:

1. **Defino o problema real:** Quem vai usar isto? Qual é a dor exata?
2. **Desenho a arquitetura:** Quais são as tabelas necessárias? Como é que o utilizador vai interagir?
3. **Uso a IA para a sintaxe e prototipagem rápida:** A IA escreve o código com base nas minhas orientações detalhadas;
4. **Eu testo, valido e refino:** Garanto que a experiência é fluida, que não há erros e que o resultado final serve o propósito prático.

---

## O que aprendi na prática construindo esta plataforma

Construir a plataforma **Samuel Simão** com React, Vite, Tailwind CSS e Supabase ensinou-me muito mais do que qualquer aula teórica:

* **Aprender fazendo:** É quando um botão não funciona, quando uma política RLS do banco de dados bloqueia um registo, ou quando o deploy no Vercel falha que realmente entendes como a web funciona.
* **Foco no que importa:** Não perco tempo a inventar a roda do zero quando existem bibliotecas excelentes. Se preciso de uma animação fluida, uso física de molas autêntica; se preciso de persistência segura, uso um backend confiável.
* **Autonomia com ferramentas acessíveis:** Uso planos gratuitos, modelos de inferência otimizados e evito custos pesados de servidores. É possível construir tecnologia de ponta com disciplina e economia inteligente.

A Inteligência Artificial nivelou o campo de jogo. Hoje, um jovem em Camama tem acesso às mesmas ferramentas de criação que um estudante em Silicon Valley. A única diferença é a vontade de sentar, aprender e executar.
    `,
  },
  {
    id: "post-fe-familia-e-negocios",
    slug: "fe-familia-e-codigo-os-meus-valores",
    title: "Fé, Família e Negócios: O que me guia na caminhada",
    excerpt: "Quero construir um negócio sustentável, ajudar pessoas e alcançar a independência financeira. Mas o sucesso sem valores sólidos é um castelo na areia.",
    category: "Espiritualidade",
    published: true,
    accessLevel: "public",
    createdAt: "2026-10-28T16:00:00Z",
    readTime: "4 min de leitura",
    authorName: "Samuel Simão",
    coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    content: `
# Fé, Família e Negócios: O que me guia na caminhada

Tenho metas grandes e não tenho vergonha de as assumir abertamente: quero ser financeiramente bem-sucedido, construir um negócio sólido, gerar receitas online em dólares e em kwanzas, e transformar a vida da minha família através do trabalho honesto.

Mas aprendi cedo que o sucesso sem princípios não vale nada. De nada adianta construir um império financeiro se perderes a tua integridade pelo caminho.

---

## 1. A minha Fé Cristã

Sou cristão e coloco Deus no centro de tudo o que planeio e executo. Quando os planos dão errado ou quando os desafios parecem grandes demais para a minha idade, é na oração e na fé que encontro clareza e serenidade. 

A Bíblia ensina que o trabalho honesto e a diligência trazem frutos. Para mim, a tecnologia e o conhecimento são dons que devem ser usados para abençoar outras pessoas e criar valor real no mundo.

---

## 2. A Família e o Estudo

A minha família é a minha base. Cada hora que passo a estudar no IMPTEL, cada linha de código que escrevo e cada projeto que desenvolvo tem como motivação honrar os meus pais e preparar um futuro seguro para os que amo. 

Estudar não é apenas uma obrigação para obter uma nota na pauta; é o caminho para ter autoridade e conhecimento real sobre o que faço.

---

## 3. O Verdadeiro Sentido de Prosperar

Gosto muito de uma frase que trago sempre comigo:

> *"Ser feliz também é fazer os outros felizes."*

Ganhar dinheiro é consequência de resolver problemas reais de pessoas reais. Quando crio um tutorial gratuito explicando como a Internet funciona, quando construo uma ferramenta que facilita o dia a dia de um empreendedor ou quando partilho o código do meu projeto de robótica, estou a retribuir o conhecimento que recebi.

A minha marca pessoal — **Samuel Simão** — está fundada nestes valores. Obrigado por fazeres parte desta jornada comigo.
    `,
  },
];

export const CURATED_PROJECTS: CuratedContentItem[] = [
  {
    id: "proj-repi-rover-imptel",
    type: "project",
    title: "REPI Rover & Estação Base (Curiosity Challenge 2026)",
    description: "Sistema de robótica e automação local desenvolvido no IMPTEL (Camama). Composto por um Rover explorador com Arduino e shield L293D, e uma Estação meteorológica com sensores DHT11, LDR, PIR e relé, operando 100% offline em rede local.",
    status: "published",
    created_at: "2026-10-22T00:00:00Z",
    thumbnail_url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
    category_name: "Robótica & Eletrónica",
    body: `
# REPI Rover & Estação Base — IMPTEL Camama

Desenvolvido para o **Curiosity Challenge 2026** no Instituto Médio Politécnico de Telecomunicações (IMPTEL), em Luanda.

### Especificações do Sistema:
* **Nó Rover (0x08):** Arduino Uno, Shield L293D com 4 motores DC, sensor ultrassónico HC-SR04 em servo motor para prevenção de colisões.
* **Nó Estação Base (0x09):** Leitura de temperatura e humidade (DHT11), sensor crepuscular (LDR), deteção de movimento infravermelho (PIR), alarme sonoro e iluminação controlada por relé.
* **Comunicação:** Protocolo baseado em pacotes JSON em rede Wi-Fi local sem necessidade de consumo de dados móveis.
    `,
  },
  {
    id: "proj-pafiworky-assistant",
    type: "project",
    title: "Pafiworky — Assistente Pessoal & Automação",
    description: "Assistente pessoal e plataforma de integrações concebida sob o lema: 'Complexidade para a máquina. Simplicidade para o utilizador.' Foco em simplificar rotinas digitais e acelerar tarefas do dia a dia.",
    status: "published",
    created_at: "2026-10-10T00:00:00Z",
    thumbnail_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    category_name: "Inteligência Artificial",
    body: `
# Pafiworky — Assistente Pessoal & Automação

Projeto orientado para simplificar o uso da tecnologia por pessoas comuns e pequenos empreendedores.

### Destaques:
* Orquestração de tarefas e rotinas repetitivas.
* Interfaces intuitivas sem complicação técnica.
* Integração com modelos de inteligência artificial de alta velocidade.
    `,
  },
  {
    id: "proj-samuka-play",
    type: "project",
    title: "Samuka Play Angola",
    description: "Protótipo de plataforma de streaming e distribuição de conteúdos multimédia desenhado com foco na estabilidade e baixo consumo de dados móveis para o público angolano.",
    status: "published",
    created_at: "2026-09-15T00:00:00Z",
    thumbnail_url: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=800&q=80",
    category_name: "Multimédia & Web",
  },
  {
    id: "proj-linkduo",
    type: "project",
    title: "LinkDuo — Micro-Websites de Alta Conversão",
    description: "Ferramenta e conceito para criação ultrarrápida de micro-sites, páginas de links e cartões de visita digitais interativos para profissionais e negócios em Angola.",
    status: "published",
    created_at: "2026-08-20T00:00:00Z",
    thumbnail_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    category_name: "Negócios & Ferramentas",
  },
];

export const CURATED_LAB_ITEMS: CuratedContentItem[] = [
  {
    id: "lab-explainroo-pipeline",
    type: "lab",
    title: "Pipeline de Vídeos Explainroo",
    description: "Ambiente de testes para geração automatizada de vídeos educativos em formato paper e motion graphics de 3 a 5 minutos, adaptados para o canal de YouTube Samuel Simão.",
    status: "beta",
    created_at: "2026-10-20T00:00:00Z",
    category_name: "Vídeo & Motion",
  },
  {
    id: "lab-app-sandbox-iframe",
    type: "lab",
    title: "Motor de Execução de Apps em Sandbox (Iframe)",
    description: "Arquitetura para abrir, isolar e rodar softwares web interativos diretamente na plataforma sem necessidade de download ou instalação por parte do visitante.",
    status: "published",
    created_at: "2026-10-28T00:00:00Z",
    category_name: "Engenharia Web",
  },
  {
    id: "lab-groq-cerebras-node",
    type: "lab",
    title: "Nó de Inferência Ultrarrápida (Groq & Cerebras)",
    description: "Experimentos de processamento de linguagem e automação com latência inferior a 150ms para assistentes pessoais e análise de documentos sem dependência de hardware pesado local.",
    status: "alpha",
    created_at: "2026-10-12T00:00:00Z",
    category_name: "Inteligência Artificial",
  },
];
