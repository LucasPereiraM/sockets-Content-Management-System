import threading
from socket import socket, AF_INET, SOCK_STREAM

HOST = "127.0.0.1"
PORT = 65005
database = {}

def log_message(message: str):
    with open("servidor_log.txt", "a") as log_file:
        log_file.write(message + "\n")
    print(message)

def handle_client(conn, addr):
    log_message(f"\n[CONEXÃO] Cliente conectado: {addr}")

    try:
        while True:
            data = conn.recv(1024).decode("utf-8")
            if not data:
                break

            parts = data.split(" ", 1)
            command = parts[0]
            args = parts[1] if len(parts) > 1 else ""

            response = "Comando inválido."

            if command == "CREATE":
                try:
                    key, title, author, value = args.split("' '")
                    key = key.replace("'", "")
                    value = value.rstrip("'")
                    database[key] = {"title": title, "author": author, "value": value}
                    response = f"Conteúdo criado: {key} -> {title} por {author}: {value}"
                    log_message(f"[CRIAÇÃO] {response}")
                except ValueError:
                    response = "Erro no comando CREATE. Verifique a formatação."

            elif command == "READ":
                key = args.strip().replace("'", "")
                post = database.get(key)
                if post:
                    response = f"{key}: {post['title']} por {post['author']} - {post['value']}"
                else:
                    response = "Conteúdo não encontrado."

            elif command == "UPDATE":
                try:
                    key, title, author, value = args.split("' '")
                    key = key.replace("'", "")
                    value = value.rstrip("'")
                    if key in database:
                        database[key] = {"title": title, "author": author, "value": value}
                        response = f"Conteúdo atualizado: {key} -> {title} por {author}: {value}"
                        log_message(f"[ATUALIZAÇÃO] {response}")
                    else:
                        response = "Chave não encontrada para atualização."
                except ValueError:
                    response = "Erro no comando UPDATE. Verifique a formatação."

            elif command == "DELETE":
                key = args.strip().replace("'", "")
                if key in database:
                    del database[key]
                    response = f"Conteúdo deletado: {key}"
                    log_message(f"[EXCLUSÃO] {response}")
                else:
                    response = "Chave não encontrada para exclusão."

            elif command == "LIST":
                if database:
                    response = "\n".join([f"{key}: {post['title']}: {post['author']}: {post['value']}" for key, post in database.items()])
                else:
                    response = "Nenhum post ainda."

            conn.sendall(response.encode("utf-8"))
    except Exception as e:
        log_message(f"[ERRO] {e}")
    finally:
        conn.close()
        log_message(f"[DESCONECTADO] Cliente desconectado: {addr}")

def start_server():
    server = socket(AF_INET, SOCK_STREAM)
    server.bind((HOST, PORT))
    server.listen(5)
    log_message(f"[INICIADO] Servidor iniciado em {HOST}:{PORT}")

    while True:
        conn, addr = server.accept()
        thread = threading.Thread(target=handle_client, args=(conn, addr))
        thread.start()
        log_message(f"[ATIVO] Conexões ativas: {threading.active_count() - 1}")

if __name__ == "__main__":
    start_server()
