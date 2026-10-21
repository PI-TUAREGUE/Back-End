Projeto Integrador: Agendamento Tuaregue Automotiva

API desenvolvida para o sistema de agendamento interno para a oficina mecânica Tuaregue Automotiva. O sistema permite desde o cadastro e visualização de Agendamentos, Serviços e Funcionários visando a eficiência no planejamento do fluxo de trabalho pelos funcionários de maneira 100% digital.

🚀 Tecnologias

    Ambiente: Node.js

    Linguagem: TypeScript

    Framework Web: Express

    Bancos de Dados: * MongoDB (Mongoose): Regras de Negócio e Casos de Uso do fluxo princial (Usuários, Serviços, Agendamentos).

    Conteinerização: Docker & Docker Compose

    Segurança: JWT (JSON Web Tokens) & Bcrypt

    Upload de Arquivos: Multer

    Envio de E-mail: Nodemailer & Etheral

    Swagger: Documentação e Teste de Rotas e API's respectivas

🏗️ Arquitetura

O projeto foi desenvolvido utilizando uma arquitetura monolítica modular, visando a organização de domínios e/ou funcionalidades e garantindo fácil escalabilidade de projeto.

    Auth: Módulo responsável pelas funcionalidades de autenticação do sistema.

    Employees: Funcionários responsáveis por executarem fluxos com base em seus cargos.

    Services: Representa os Serviços prestados na oficina.

    Schedulings: O fluxo principal do sistema, responsável pela realização dos agendamentos.

    Invitation: Fluxo resposável pelo convite para outros Funcionários de cargo "Mecânico" participarem de outros agendamentos.

🏁 Como Executar

O projeto está totalmente "dockerizado", o que facilita a execução do ambiente de desenvolvimento.

    Clone o repositório:
    Bash

    git clone https://github.com/GustaGevigi/Internship-Equivalency.git](https://github.com/PI-TUAREGUE/Back-End.git

    Configure as variáveis de ambiente:
    Crie um arquivo .env na raiz (baseado no .env.example).

    Suba os containers:
    Bash

    docker compose up -d

A API estará disponível em http://localhost:3000/api-docs.

🔐 Segurança e Roles

O acesso é controlado por permissões granulares:

    Employee: Funcionários que usufruem do sistema.
    
    Cargos:  Mecânico: Realiza agendamentos, convida outros mecânicos para participarem de um agendamento.
             Administrador: Crie e ddita Serviços e Funcionários.
