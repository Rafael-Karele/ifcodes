# 📌 IF Codes



## 🚀 Tecnologias Utilizadas

- [Laravel](https://laravel.com/) – Framework PHP para desenvolvimento web
- [Docker](https://www.docker.com/) – Containerização do ambiente
- [PostgreSQL](https://www.postgresql.org/) – Banco de dados relacional

## CI/CD

- **CI (Continuous Integration):** Testes PHPUnit rodam automaticamente em cada Pull Request. PRs com testes falhando nao podem ser mergeados.
- **CD (Continuous Deployment):** Apos merge na `main`, o deploy e feito automaticamente no VPS via SSH + Docker Compose.

Para mais detalhes sobre o pipeline de deploy, configuracao de secrets e evolucao futura, veja a [documentacao de CD](docs/CD.md).
- **Melhorias futuras:** Sugestoes como migracao para Nginx + PHP-FPM e GHCR estao documentadas em [docs/melhorias-futuras.md](docs/melhorias-futuras.md).

---

# Guia de Instalação do Ambiente de Desenvolvimento

Este guia detalha o processo para configurar e iniciar o ambiente de desenvolvimento completo do projeto, que utiliza Vagrant para criar uma máquina virtual e Docker para orquestrar os serviços.

> ⚠️ **Aviso de Desempenho: Linux vs. Windows**
> É altamente recomendado executar este ambiente em um sistema operacional Linux. A integração nativa do Docker com o kernel do Linux oferece um desempenho drasticamente superior. Em sistemas Windows, a camada de virtualização adicional para o compartilhamento de arquivos pode tornar a aplicação, especialmente o frontend, significativamente mais lenta.

---

## 1. Pré-requisitos

Antes de começar, garanta que os seguintes softwares estejam instalados em sua máquina:

1.  **Virtualização Habilitada na BIOS:** Verifique se a virtualização (Intel VT-x ou AMD-V) está ativada na BIOS/UEFI do seu computador. Este é um requisito fundamental para o VirtualBox funcionar.
2.  **[Git](https://git-scm.com/downloads)**: Para controle de versão.
3.  **[VirtualBox](https://www.virtualbox.org/wiki/Downloads)**: A plataforma de virtualização.
4.  **[Vagrant](https://developer.hashicorp.com/vagrant/downloads)**: A ferramenta para gerenciar a máquina virtual.

### Otimização para Usuários de Windows (Opcional, mas recomendado)

Para mitigar a falta de desempenho no Windows, você pode tentar ativar a "Plataforma do Hipervisor do Windows", o que pode melhorar a comunicação com o VirtualBox.
1.  Pressione `Win` e digite "Ativar ou desativar recursos do Windows".
2.  Na janela que abrir, encontre e marque a opção **"Plataforma do Hipervisor do Windows"**.
3.  Clique em "OK" e reinicie o computador quando solicitado.

---

## 2. Configuração do Projeto

Siga estes passos para estruturar corretamente seu ambiente local.

### a. Estrutura de Pastas

1.  Crie uma pasta principal para o projeto (ex: `ifcodes-dev`).
2.  Dentro desta pasta, crie a seguinte estrutura e clone os repositórios do backend e frontend (ou forks correspondentes) nos locais indicados:

    ```
    ifcodes-dev/
    |
    ├── back/
    |
    └── front/
    ```
    **Exemplo dos comandos:**
    ```bash
    mkdir ifcodes-dev
    cd ifcodes-dev
    git clone [URL_DO_REPO_BACKEND] back
    git clone [URL_DO_REPO_FRONTEND] front
    ```

### b. Arquivos de Configuração

Copie os seguintes arquivos dessa **[pasta do drive](https://drive.google.com/drive/folders/14nPSCOsxm1RkzN-rDTMaXMD-eoaDHBtA?usp=drive_link)** para a **raiz da sua pasta principal (`ifcodes-dev/`)**:

* `docker-compose.yml`
* `init-backend-db.sh`
* `judge0.conf`
* `Vagrantfile`

### c. Hierarquia Final dos Arquivos

Sua estrutura de pastas e arquivos deve ficar exatamente assim:

```
ifcodes-dev/
├── .env
├── back/
    └── ... (código completo do Laravel)
├── front/
    └── ... (código completo do React)
├── docker-compose.yml
├── init-backend-db.sh
├── judge0.conf
└── Vagrantfile
```
## 3. Subindo o Ambiente (Passo a Passo)

Siga esta sequência com atenção.

1.  **Ajuste de Recursos (Opcional):**
    A máquina virtual está pré-configurada para usar **4 núcleos de CPU** e **4GB de RAM**. Se sua máquina tiver recursos limitados ou de sobra, você pode ajustar estes valores no `Vagrantfile`:
    ```ruby
    # Dentro do Vagrantfile
    vb.customize ["modifyvm", :id, "--memory", "4096"] # Altere o valor da memória (em MB)
    vb.cpus = 4        # Altere o número de núcleos de CPU
    ```

2.  **Inicie a Máquina Virtual:**
    Abra um terminal na pasta raiz do projeto (`ifcodes-dev/`) e execute:
    ```bash
    vagrant up
    ```
    Este comando irá baixar a imagem do Ubuntu e provisionar a VM com Docker, o que pode demorar vários minutos na primeira vez.

    > **Dica de Troubleshooting:** Se a máquina não subir ou apresentar erros de tela preta, descomente a linha `vb.gui = true` no `Vagrantfile`. Isso abrirá uma janela do VirtualBox, permitindo que você veja o que está acontecendo dentro da VM.

3.  **Recarregue a VM:**
    O Judge0 precisa de uma configuração especial no boot da VM. Para aplicá-la, é necessário recarregar a máquina:
    ```bash
    vagrant reload
    ```

4.  **Configure o `.env` do Backend:**
    O passo anterior gerou um arquivo `passwords.txt` na raiz do seu projeto.
    * Abra o `passwords.txt` e copie o valor do campo **"PostgreSQL Password"**.
    * Navegue até a pasta `back/src/`. Você encontrará um arquivo `.env.example`.
    * **Copie** este arquivo e renomeie a cópia para `.env`.
    * Abra o novo `back/src/.env` e cole a senha que você copiou no campo `DB_PASSWORD`.

5.  **Acesse a VM via SSH:**
    ```bash
    vagrant ssh
    ```

6.  **Navegue até a Pasta do Projeto:**
    Dentro da VM, os arquivos do seu projeto estão na pasta `/vagrant`.
    ```bash
    cd /vagrant
    ```

7.  **Inicie os Contêineres Docker:**
    Este comando irá baixar todas as imagens Docker e iniciar os serviços.
    ```bash
    docker compose up -d
    ```
    > **Atenção:** Este processo pode demorar muito, especialmente na primeira vez em um sistema Windows. É normal que o download de algumas imagens pareça "travado". Se o processo ficar congelado por mais de 5-10 minutos em uma única etapa, pressione `Ctrl + C` para interromper e execute o comando `docker compose up -d` novamente. O Docker continuará de onde parou.

8.  **Execute as Migrações do Banco de Dados:**
    Com os contêineres rodando, execute as migrações do Laravel para criar as tabelas no banco de dados.
    ```bash
    docker exec laravel_app php artisan migrate:fresh --seed
    ```

9.  **Gere a Chave da Aplicação Laravel:**
    Execute o comando para gerar a chave de criptografia da aplicação:
    ```bash
    docker exec laravel_app php artisan key:generate
    ```


**Pronto!** Se todos os passos foram concluídos, o sistema deve estar totalmente funcional.

---

## 4. Acessando os Serviços

* **Frontend (React):** `http://localhost:5173`
* **Backend (Laravel):** `http://localhost:8000`
* **API (Judge0):** `http://localhost:2358`

### Acessando os Bancos de Dados (via DBeaver, etc.)

Ambas as aplicações usam a mesma instância do PostgreSQL, mas bancos de dados separados.

**Banco de Dados do Judge0:**
* **Host/URL:** `localhost`
* **Porta:** `5433`
* **Base de Dados:** `judge0`
* **Usuário:** `integrador`
* **Senha:** A senha do arquivo `passwords.txt`.

**Banco de Dados do Backend:**
* **Host/URL:** `localhost`
* **Porta:** `5433`
* **Base de Dados:** `ifcodes`
* **Usuário:** `integrador`
* **Senha:** A senha do arquivo `passwords.txt`.

---

## 5. Dica de Performance Avançada: NFS (Windows)

Caso o sistema esteja muito lento, a alternativa é usar o modo de compartilhamento de arquivos **NFS**, que é drasticamente mais rápido. No Windows, ele não é suportado nativamente pelo Vagrant e precisa de um plugin. Essa configuração não está como padrão pois não foi bem testada ainda.

1.  **Instale o plugin:**
    ```bash
    vagrant plugin install vagrant-winnfsd
    ```
2.  **Edite o `Vagrantfile`:**
    Altere a linha `synced_folder` para usar o NFS e adicione as opções de montagem que corrigem bugs comuns no Windows.
    ```ruby
    # No Vagrantfile
    config.vm.synced_folder ".", "/vagrant", type: "nfs", mount_options: ['vers=3', 'tcp', 'nolock', 'actimeo=1']
    ```
3.  Execute `vagrant reload` e **aceite a solicitação do Firewall do Windows** quando ela aparecer.

Fiquem à vontade para compartilhar outras configurações e melhorias!
