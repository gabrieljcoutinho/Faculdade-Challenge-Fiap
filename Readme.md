# Projeto GoodWe - Aplicação React para Gerenciamento de Energia Solar

## Descrição do Projeto

Realizei um projeto acadêmico baseado em uma proposta apresentada por uma empresa durante uma visita à faculdade. O objetivo da atividade era compreender as dificuldades que a empresa vem enfrentando e, a partir disso, os alunos deveriam desenvolver soluções tecnológicas que pudessem colaborar com a melhoria de seus processos.

As soluções poderiam ser projetos completos ou mais simples, utilizando linguagens como React, Python ou até mesmo o uso de inteligência artificial. A empresa escolhida para esse projeto foi a **GoodWe**, que atua no setor de energia solar.

Diante do desafio, desenvolvi uma aplicação completa utilizando a tecnologia **React**. O projeto foi publicado na web, permitindo que qualquer pessoa com o link possa acessá-lo diretamente.

---

## Proposta do Sistema

A aplicação simula um aplicativo para celular voltado para o gerenciamento e automação de recursos relacionados à energia solar.

---

## Estrutura da Aplicação

A aplicação conta com uma estrutura básica composta por um cabeçalho fixo, que direciona o usuário para diferentes seções:

- **Home**
- **Conexões de Aparelhos**
- **Chatbot**
- **Contato**
- **Configurações**

---

### Seção Home

- Exibe um gráfico que pode ser alternado entre três tipos diferentes:
  - Gráfico de linha
  - Gráfico de barras
  - Gráfico de pizza

- Os dados apresentados são obtidos a partir de uma API simulada (fake API), que fornece as informações necessárias para gerar as visualizações.

- Abaixo do gráfico, há informações sobre o clima atual e a previsão do tempo.

- Mais abaixo, uma área destinada a mostrar o impacto positivo do uso de placas solares, destacando os benefícios econômicos e ambientais, como a economia gerada ao adotar essa energia.

---

### Seção Conexões de Aparelhos

- O usuário pode adicionar dispositivos de duas formas:
  - Por meio de conexão Bluetooth real (busca dispositivos próximos)
  - De forma manual

- Na forma manual, o usuário pode inserir um nome para o aparelho, escolher um ícone representativo e selecionar uma cor de fundo personalizada.

- Após o cadastro, o aparelho aparece como conectado e oferece funcionalidades adicionais:
  - Geração de QR Code para facilitar a conexão por outros usuários
  - Opções para editar, excluir ou desativar o dispositivo

---

### Seção Chatbot

- Sistema de mensagens com funcionalidades básicas de um chat tradicional (envio e recebimento de mensagens).

- Integrado a uma API personalizada de perguntas e respostas específicas e a uma API real de IA para responder outras perguntas.

- Reconhece comandos como “conectar aparelho”, “mudar de página”, entre outros, respondendo automaticamente com instruções úteis, simulando um assistente virtual.

---

### Seção Contato

- Formulário simples para que o usuário informe nome, e-mail e mensagem.

- Recursos adicionais:
  - Botão de acesso às perguntas frequentes
  - Opção para envio de arquivos junto com a mensagem, facilitando a comunicação com a empresa

---

### Seção Configurações

Implementa seis funcionalidades principais:

1. Botão que leva o usuário para uma página com todos os comandos especiais reconhecidos pelo sistema.
2. Central de ajuda para suporte ao usuário.
3. Ativação de comandos de voz que permite que qualquer texto clicado na tela seja lido em voz alta, promovendo acessibilidade.
4. Opção de modo claro/escuro para alternar o tema conforme preferência.
5. Funcionalidade de login e logout, com suporte para autenticação via e-mail/senha, Google ou Facebook.
6. Opção “esqueci minha senha” que redireciona para uma página de recuperação (ainda não funcional).

---

## Detalhes Técnicos e Usabilidade

- Projeto responsivo para mobile e desktop, com preferência para dispositivos móveis, facilitando o acesso quando o usuário estiver fora de casa.

- As APIs utilizadas são simuladas, pois não temos acesso total às informações reais da empresa.

- O sistema possui pequenas animações para melhorar a experiência do usuário.
  Por exemplo, no chat, ao digitar comandos para mudar de página (como “Home”), o usuário é redirecionado com uma animação suave de apagar e acender a página.

---

## Como acessar

> [Link do projeto publicado] (insira aqui o link real do seu projeto)

---

Se precisar de ajuda para rodar localmente ou contribuir, entre em contato!
