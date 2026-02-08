# 🌞 Projeto GoodWe - Aplicação React para Gerenciamento de Energia Solar

## 📌 Visão Geral

Realizei um projeto acadêmico baseado em uma proposta apresentada por uma empresa durante uma visita à faculdade. O objetivo da atividade era compreender as dificuldades que a empresa vem enfrentando e, a partir disso, os alunos deveriam desenvolver soluções tecnológicas que pudessem colaborar com a melhoria de seus processos.

O objetivo era identificar os principais desafios enfrentados pela empresa e, a partir disso, desenvolver soluções tecnológicas criativas e funcionais. A aplicação simula um **app mobile** para o **gerenciamento inteligente de energia solar residencial**, com funcionalidades modernas e acessíveis. Todo o sistema foi construído utilizando **React**, com simulações via APIs fake e integração com inteligência artificial.

> 🔗 O projeto está publicado na web e pode ser acessado publicamente por meio de um link: [https://challenge-fiap-nine.vercel.app/](https://challenge-fiap-sooty.vercel.app/)


---

## Proposta do Sistema

A aplicação simula um aplicativo para celular voltado para o gerenciamento e automação de recursos relacionados à energia solar.

---

## 🧠 Tecnologias Utilizadas

- **React** (Framework principal)
- **React Router DOM**
- **CSS Modules** e animações
- **Chart.js** (Gráficos)
- **APIs Fake (JSON Server ou simuladas)**
- **Text-to-Speech API** (para acessibilidade)
- **Integração com API de IA (como OpenAI)**

---

## Estrutura da Aplicação

A aplicação conta com uma estrutura básica composta por um cabeçalho fixo, que direciona o usuário para diferentes seções:

- **Home**
- **Conexões de Aparelhos**
- **Chatbot**
- **Contato**
- **Configurações**

---

## 📱 Funcionalidades Principais

### 1. 🏠 Home

- Alternância entre **3 tipos de gráficos**:
  - Linha
  - Barras
  - Pizza
- Dados gerados por uma API simulada.
- Exibição de **clima atual e previsão do tempo**.
- **Imagem dinâmica** de fundo do gráfico muda conforme o período do dia (manhã, tarde ou noite).
- Destaque para **impactos positivos da energia solar**, com foco ambiental e econômico.


<img width="603" height="906" alt="Image" src="https://github.com/user-attachments/assets/f9349b78-6c72-4765-8bd3-08da1ae31f83" />

---


### 2. 🔌 Conexões de Aparelhos

- Dispositivos podem ser adicionados de duas formas:
  - **Conexão Bluetooth simulada**
  - **Cadastro manual personalizado** (nome, ícone e cor de fundo)
- Recursos disponíveis após o cadastro:
  - **Geração de QR Code**
  - **Edição, exclusão e desativação**
  - **Ativação/desativação dos aparelhos**
  - **Organização dos dispositivos em listas de "conectados" e "desconectados"**
  - **Drag and drop** para reordenação dos dispositivos
- Caso não haja dispositivos, é exibida uma **ilustração indicativa**, evitando deixar a tela em branco.


<img width="495" height="705" alt="Image" src="https://github.com/user-attachments/assets/9cea78ca-e2e4-4927-8ff0-c63747908c67" />

---

### 3. 🤖 Chatbot

- Chat com envio e recebimento de mensagens em tempo real.
- Integração com:
  - **API personalizada** (respostas específicas)
  - **API real de IA** (respostas gerais e simulação de assistente virtual)
- Reconhecimento de comandos inteligentes, como:
  - "conectar aparelho"
  - "mudar de página"
  - "comandos"
- Animação de transição ao mudar de página, com efeito de "apagando e acendendo".

<img width="522" height="1127" alt="Image" src="https://github.com/user-attachments/assets/86881f2a-2358-47df-86e1-4abe4f64773e" />

---

### 4. 📬 Contato

- Formulário com os seguintes campos:
  - Nome
  - E-mail
  - Mensagem
- Funcionalidades adicionais:
  - **Envio de arquivos**
  - Acesso à seção de **perguntas frequentes (FAQ)**


<img width="379" height="810" alt="Image" src="https://github.com/user-attachments/assets/95bb6624-4944-4b55-a8a8-61cd43e4fb58" />

---

### 5. ⚙️ Configurações

Conjunto de ferramentas essenciais para o usuário:

1. **Lista de Comandos Reconhecidos**
2. **Central de Ajuda**
3. **Acessibilidade com leitura em voz alta** (textos clicáveis)
4. **Alternância entre modo Claro e Escuro**
5. **Sistema de autenticação (fake)**:
   - E-mail e senha
   - Login via Google ou Facebook
6. **Página de recuperação de senha** (em desenvolvimento)

<img width="364" height="803" alt="Image" src="https://github.com/user-attachments/assets/a4a531b8-4db4-46af-adee-38e963501152" />

---

## 💡 Diferenciais

- ✅ **Responsividade total**: funciona em dispositivos móveis e desktops.
- 🌐 **Publicação Web** com acesso facilitado.
- 🎨 **Animações suaves** em trocas de página, enriquecendo a experiência do usuário.
- 📊 **Gráficos interativos** e informativos.
- 🎤 **Comandos de voz e acessibilidade inclusa**
- 🔐 **Simulação de login realista** com autenticação via múltiplas opções.
- 🧠 **Chat com IA**, incluindo comandos inteligentes e contexto dinâmico.

---

## 📁 Estrutura de Pastas (Exemplo)

```
/src
│
├── /components
│   ├── Header
│   ├── Charts
│   ├── Chatbot
│   ├── DeviceManager
│   └── ...
│
├── /pages
│   ├── Home
│   ├── Conexoes
│   ├── Chatbot
│   ├── Contato
│   └── Configuracoes
│
├── /api
├── /utils
├── /assets
├── /styles
└── App.js
```

---

## ⚠️ Limitações

- APIs utilizadas são **fictícias**, pois os dados reais da empresa não foram disponibilizados.
- Algumas funcionalidades são **apenas estética**, como recuperação de senha.

---


## Há mais
- O chat terá um prompt ja explicando oque el vai fazer

## 👨‍🎓 Conclusão

Este projeto foi desenvolvido com o intuito de aplicar na prática conceitos de **desenvolvimento web, acessibilidade, automação, usabilidade, e integração com IA**, tudo isso dentro de um cenário realista e desafiador proposto por uma empresa do mercado.
