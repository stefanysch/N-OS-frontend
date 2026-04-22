# N-OS Frontend

Interface web do projeto **N-OS**, desenvolvida em **React**, com foco em produtividade, experiência moderna e integração com a API backend.

---

## 📁 Estrutura do Projeto

| Pasta | Responsabilidade |
|---|---|
| `src/components` | Componentes reutilizáveis |
| `src/pages` | Telas do sistema |
| `src/services` | Comunicação com API |
| `src/assets` | Recursos visuais |
| `src/styles` | Estilos globais |

---

## 🚀 Tecnologias

- React
- JavaScript
- Vite
- Tailwind CSS
- shadcn/ui

---

## ⚙️ Configuração

Instale as dependências do projeto:

```bash
npm install
```

---

## Executando o Projeto

`npm run dev` é um comando de terminal, utilizado no VS Code, Prompt, PowerShell ou terminal integrado.

### VS Code

Abra a pasta do frontend e rode no terminal integrado:

```bash
npm run dev
```

### Prompt / PowerShell

Navegue até a pasta do frontend e execute:

```bash
cd N-OS-Frontend
npm run dev
```

Após iniciar, acesse no navegador: `http://localhost:5173`

> ⚠️ Certifique-se de que a API backend está em execução para o funcionamento completo do sistema.

---

## 🎨 Diretrizes Adotadas

- Interface moderna e responsiva
- Componentização reutilizável
- Integração com backend .NET
- Código organizado e escalável

---

## ✨ Experiência do Usuário

O sistema oferece um fluxo guiado **(wizard)** para abertura de ordens de serviço, conduzindo o usuário em etapas sequenciais dentro de um modal:

* **Passo 1** — Cadastro do cliente
* **Passo 2** — Cadastro do veículo vinculado ao cliente
* **Resultado** — Tela de nova OS já com os dados preenchidos

> Caso o cliente e o veículo já estejam cadastrados, o usuário pode abrir a OS diretamente, sem passar pelo fluxo wizard.

---

## 📬 Contato

Para dúvidas, feedbacks ou informações adicionais sobre o desenvolvimento deste projeto, sinta-se à vontade para entrar em contato:

- stefany@edu.unifil.br