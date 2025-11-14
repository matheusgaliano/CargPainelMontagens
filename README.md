# 🚛 Painel de Carregamento Inteligente (Cargnelluti Revenda Ambev)

Prezados,

Este projeto foi desenvolvido como uma solução prática de um estudante Engenharia de Software, que é funcionário de uma distribuidora da Ambev, para otimizar o fluxo de trabalho e a comunicação na montagem de cargas em carretas, substituindo processos manuais por um sistema em tempo real.

Construído com foco em **Modularidade, Resiliência Offline e Separação de Responsabilidades (Permissões)**.

---

## 🚀 Status do Projeto

| Ambiente | Status |
| :--- | :--- |
| **Produção** | ✅ Online (Acesso via URL do Firebase Hosting) |
| **Código** | Limpo e Modularizado em 3 arquivos (HTML, CSS, JS) |

---

## 🎯 Desafios do Projeto Superados

Este projeto é uma solução robusta para um ambiente de trabalho desafiador (pátio, conexão instável, múltiplos usuários).

1.  **Resiliência Offline:** Implementação de persistência offline no Firestore, garantindo que as ações (Assumir, Finalizar) dos Conferentes não se percam mesmo em áreas sem internet, sincronizando-se automaticamente quando a conexão é restabelecida.
2.  **Separação de Permissões:** Criação de dois perfis distintos (**Operacional** e **Conferente**) com base no `localStorage` do navegador, com regras que controlam quais botões e funcionalidades são visíveis para cada usuário.
3.  **Controle de Fluxo e Destravamento:**
    * **Botões de Desfazer:** Adição de reversões para o Conferente (`Devolver p/ Aguardando`, `Devolver p/ Em Processo`) para auto-correção de erros.
    * **Botão de Super-Admin:** Implementação do botão **FORÇAR DEVOLUÇÃO** (visível apenas para Operacional) para resolver gargalos e destravar tarefas presas.
4.  **UX/Design Responsivo:** Refatoração do cabeçalho com classes Tailwind CSS (`flex-col lg:flex-row`) para garantir um layout funcional e esteticamente agradável tanto em desktops quanto em celulares e tablets.

---

## 🛠️ Arquitetura e Tecnologia

| Categoria | Tecnologia | Uso no Projeto |
| :--- | :--- | :--- |
| **Frontend** | HTML, JavaScript (Puro) | Lógica de aplicação e renderização. |
| **Estilo** | Tailwind CSS (CDN) | Layout responsivo e padronização visual. |
| **Banco de Dados** | Firebase Firestore | **Tempo Real (onSnapshot)** e armazenamento de dados. |
| **Login/Auth** | JavaScript + LocalStorage | Sistema simples e prático de identificação de usuário/função. |
| **Deployment** | Firebase Hosting | Hospedagem profissional e acesso via URL. |

---

## ✨ Funcionalidades por Perfil

### 💼 Perfil Operacional (Gestão)

* **Controle Total:** Criação (`+ Adicionar`), Edição (`Editar`), Exclusão (`Excluir`).
* **Limpeza:** Botão `Arquivar Prontas` para limpar o painel de carretas concluídas (mudança de status para `arquivada`).
* **Recuperação:** Botão `FORÇAR DEVOLUÇÃO` para destravar cards presos na coluna "Em Processo".

### 👷 Perfil Conferente (Execução)

* **Ações Simples:** `Assumir Montagem` e `Finalizar Carreta`.
* **Autonomia:** Botões de `Devolver` para corrigir erros de fluxo.
* **Foco:** Ocultação de todas as funções de administração.

---

## 💻 Estrutura de Arquivos

O projeto é mantido na raiz da pasta para simplificar a implantação: 
---

## 🚀 Como Executar o Deployment (Para Desenvolvedores)

1.  **Pré-requisitos:** Node.js e Firebase CLI instalados.
2.  **Login:** `firebase login` (no terminal).
3.  **Deployment:** Na raiz do projeto, execute:
    ```bash
    firebase deploy
    ```

---

Este projeto demonstra um uso prático e eficiente de tecnologias modernas para resolver problemas de logística o qual enfrento diariamente na empresa.
