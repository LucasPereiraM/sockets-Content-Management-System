
## Como rodar com o Docker Compose (na branch main)
## Pré-requisitos

- [Docker](https://www.docker.com/) instalado e funcionando
- [Docker Compose](https://docs.docker.com/compose/) instalado (normalmente já vem com Docker Desktop)

### 1. Clonando o repositório

Clone o projeto em sua máquina:
git clone [<URL-do-repositório>](https://github.com/LucasPereiraM/sockets-Content-Management-System/)
cd <nome-da-pasta-clonada>
va para a branch main se ainda não estiver

### 2. subindo o docker compose
docker-compose up --build

### 3 Acessando o frontend
Após a aplicação iniciar:

Abra o navegador

Acesse: http://localhost:3000

## Passos para rodar o minikube (na branch dev)
## Pré-requisitos

Certifique-se de ter instalado:
- [Docker](https://docs.docker.com/get-docker/)
- [Minikube](https://minikube.sigs.k8s.io/docs/start/)
- [Kubectl](https://kubernetes.io/docs/tasks/tools/)


### 1. Clonar o repositório
git clone https://github.com/LucasPereiraM/sockets-Content-Management-System/
cd seu-repositorio
trocar para a branch dev

### 2. Iniciar o Minikube
minikube start

### 3. Buildar as imagens Docker
docker build -t frontend -f ./clientCMS/Frontend.Dockerfile ./clientCMS
docker build -t proxy -f ./server/Proxy.Dockerfile ./server
docker build -t server -f ./server/Server.Dockerfile ./server

### 4. Aplicar os manifests Kubernetes
kubectl apply -f k8s/

### 5. Verificar o status dos pods e services
kubectl get pods
kubectl get services

### 6. Acessar o Frontend
minikube ip
use http://ip_do_minikube:30080 para acessar

ou minikube services frontend
