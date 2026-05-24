# N-OS Frontend

Interface web do projeto **N-OS**, desenvolvida em **React** com foco em organização modular, escalabilidade e integração com a API backend em .NET.

O sistema foi estruturado utilizando separação por funcionalidades (**feature-based structure**), facilitando manutenção, evolução e reutilização de componentes.


## 🚀 Tecnologias Utilizadas

* React
* JavaScript
* Vite
* Tailwind CSS
* shadcn/ui
* Axios


## 📁 Estrutura do Projeto

```text
src/
├── assets/                # recursos visuais
├── components/
│   ├── shared/            # componentes compartilhados
│   └── ui/                # componentes visuais reutilizáveis
│
├── features/
│   ├── pecas/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   │
│   └── servicos/
│       ├── components/
│       ├── pages/
│       └── services/
│
├── lib/                   # configurações globais (API, helpers)
├── router/                # configuração de rotas
├── utils/                 # funções utilitárias
├── validations/           # regras de validação
│
├── App.jsx
├── main.jsx
└── index.css
```


## ⚙️ Configuração do Projeto

Instale as dependências:

```bash
npm install
```


## ▶️ Executando o Projeto

Execute o ambiente de desenvolvimento:

```bash
npm run dev
```

Após iniciar, acesse:

```text
http://localhost:5173
```

> ⚠️ Certifique-se de que a API backend esteja em execução para funcionamento completo do sistema.


## 🔌 Integração com Backend

O frontend consome uma API desenvolvida em:

* ASP.NET Core
* Entity Framework Core
* PostgreSQL

A comunicação HTTP é centralizada através da camada de serviços em:

```text
src/features/**/services
```

e da configuração global em:

```text
src/lib/api.js
```


## ✨ Funcionalidades Atuais

* Cadastro de peças
* Cadastro de serviços
* Modal reutilizável de confirmação
* Validações centralizadas
* Estrutura preparada para expansão modular
* Componentização reutilizável
* Interface responsiva

## 🎨 Diretrizes do Projeto

* Código modular e escalável
* Separação de responsabilidades
* Reutilização de componentes
* Padronização visual
* Estrutura organizada por domínio
* Responsividade
* Facilidade de manutenção

## ✨ Experiência do Usuário

O sistema contará com um fluxo guiado (**wizard**) para abertura de ordens de serviço.

### Fluxo

1. Cadastro do cliente
2. Cadastro do veículo vinculado
3. Criação da ordem de serviço com dados preenchidos

Caso cliente e veículo já existam, a OS pode ser aberta diretamente.


## 📬 Contato

Para dúvidas, feedbacks ou informações adicionais sobre o desenvolvimento deste projeto, sinta-se à vontade para entrar em contato:

- [stefany@edu.unifil.br](mailto:stefany@edu.unifil.br)
