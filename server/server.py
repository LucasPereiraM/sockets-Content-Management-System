from flask import Flask, jsonify
import threading
from socket import socket, AF_INET, SOCK_STREAM
import logging
from waitress import serve

app = Flask(__name__)

HOST = "0.0.0.0"
SOCKET_PORT = 5000
HTTP_PORT = 5001

database = {}

def log_message(message: str):
    with open("servidor_log.txt", "a") as log_file:
        log_file.write(message + "\n")
    print(message)

@app.route('/health')
def health_check():
    return jsonify({
        "status": "healthy",
        "database_entries": len(database)
    }), 200

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

            response = process_command(command, args)
            conn.sendall(response.encode("utf-8"))

    except Exception as e:
        log_message(f"[ERRO] {e}")
    finally:
        conn.close()
        log_message(f"[DESCONECTADO] Cliente {addr}")

def process_command(command: str, args: str) -> str:
    if command == "CREATE":
        try:
            key, title, author, value = args.split("' '")
            key = key.replace("'", "")
            value = value.rstrip("'")
            database[key] = {"title": title, "author": author, "value": value}
            log_message(f"[CRIAÇÃO] {key}: {title}")
            return f"Conteúdo criado: {key}"
        except ValueError:
            return "Erro: Formato CREATE inválido"

    elif command == "READ":
        key = args.strip().replace("'", "")
        post = database.get(key)
        return f"{key}: {post['title']}" if post else "Conteúdo não encontrado"

    elif command == "UPDATE":
        try:
            key, title, author, value = args.split("' '")
            key = key.replace("'", "")
            value = value.rstrip("'")
            if key in database:
                database[key] = {"title": title, "author": author, "value": value}
                log_message(f"[ATUALIZAÇÃO] {key}")
                return f"Conteúdo atualizado: {key}"
            return "Chave não encontrada"
        except ValueError:
            return "Erro: Formato UPDATE inválido"

    elif command == "DELETE":
        key = args.strip().replace("'", "")
        if key in database:
            del database[key]
            log_message(f"[EXCLUSÃO] {key}")
            return f"Conteúdo deletado: {key}"
        return "Chave não encontrada"

    elif command == "LIST":
        return "\n".join(
            f"{k}: {v['title']}" for k, v in database.items()
        ) if database else "Nenhum post ainda"

    return "Comando inválido"

def start_socket_server():
    with socket(AF_INET, SOCK_STREAM) as server:
        server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        server.bind((HOST, SOCKET_PORT))
        server.listen(5)
        log_message(f"[SOCKET] Ouvindo em {HOST}:{SOCKET_PORT}")

        while True:
            conn, addr = server.accept()
            thread = threading.Thread(
                target=handle_client,
                args=(conn, addr),
                daemon=True
            )
            thread.start()
            log_message(f"[CONEXÕES ATIVAS] {threading.active_count()}")

if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )

    socket_thread = threading.Thread(
        target=start_socket_server,
        daemon=True
    )
    socket_thread.start()

    log_message(f"[HTTP] Iniciando servidor na porta {HTTP_PORT}")
    serve(
        app,
        host=HOST,
        port=HTTP_PORT,
        threads=4,
        ident="CMS Server"
    )