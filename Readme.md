# Aplicativo de Monitoramento e Conexão - Projeto React Faculdade

## Descrição Geral

Este projeto é uma aplicação web desenvolvida em **React.js** para monitoramento de dados, conexão e gerenciamento de dispositivos, interação via chat inteligente e suporte ao usuário. O objetivo é oferecer uma interface moderna, responsiva e intuitiva, agregando funcionalidades inovadoras para facilitar o controle e análise em tempo real.

---

## Funcionalidades

### 1. Home

- **Gráficos Interativos:**
  - Gráfico de linha
  - Gráfico de barra
  - Gráfico de pizza
  Permitem visualização dinâmica dos dados para fácil análise.

- **Clima em Tempo Real:**
  Atualização constante das condições meteorológicas, oferecendo informações relevantes diretamente na aplicação.

---

### 2. Dispositivos e Conexões

- **Conexão via Bluetooth:**
  Busca automática e conexão com dispositivos Bluetooth disponíveis.

- **Conexão Manual:**
  Permite ao usuário adicionar dispositivos informando:
  - Nome
  - Ícone personalizado
  - Cor identificadora

- **Gerenciamento de Dispositivos:**
  - Remover, editar ou desconectar aparelhos
  - Exibir QR Code para conexão rápida
  - Visualizar detalhes como status, data e tempo conectado

---

### 3. Chat Interativo com IA

- Chat que responde perguntas gerais e comandos específicos.
- Utiliza uma API de Inteligência Artificial para respostas contextuais e naturais, auxiliando o usuário.

---

### 4. Contato e Suporte

- Envio de mensagens e arquivos (PDF, imagens) para suporte.
- Acesso rápido às Perguntas Frequentes (FAQ) para esclarecimento de dúvidas comuns.

---

### 5. Configurações

- Botões principais:
  1. **Comandos:** Lista de comandos especiais para uso no chat e outras funcionalidades.
  2. **Suporte e Ajuda:** Canal para assistência ao usuário.
  3. **Leitor de Tela:** Recurso de acessibilidade para leitura das páginas.
  4. **Tema Claro/Escuro:** Alternância entre temas para melhor experiência visual.
  5. **Login/Logout:** Autenticação de usuário para acesso seguro.

---

## Tecnologias Utilizadas

- **React.js** — Construção da interface e gerenciamento do estado.
- **Bluetooth Web API** — Conexão e comunicação via Bluetooth.
- **QR Code** — Geração para facilitar conexões rápidas.
- **CSS** — Estilização, incluindo suporte a temas claro e escuro.
- **APIs REST** — Comunicação com backend para dados e IA.
- **React Hooks** — Controle reativo do estado da aplicação.

---

## APIs Integradas

- **API de Inteligência Artificial:**
  Responsável por gerar respostas inteligentes e contextuais para o chat, melhorando a interação.

---

## Como Usar

1. **Home:** Navegue pelos gráficos e confira o clima em tempo real.
2. **Conexão:** Adicione dispositivos via Bluetooth ou manualmente.
3. **Chat:** Faça perguntas ou envie comandos para respostas rápidas.
4. **Contato:** Envie mensagens e arquivos para suporte e consulte FAQ.
5. **Configurações:** Personalize o app, gerencie login e acessibilidade.

---

## Instalação e Execução Local

### Pré-requisitos

- [Node.js](https://nodejs.org/) (incluindo npm) instalado
- Navegador moderno com suporte à Web Bluetooth (para testar conexão Bluetooth)

### Passos

```bash
# Clone o repositório
git clone <URL_DO_REPOSITORIO>

# Entre na pasta do projeto
cd nome-do-projeto

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm start
