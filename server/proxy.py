from flask import Flask, request, jsonify
from socket import socket, AF_INET, SOCK_STREAM
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

SERVER_HOST = "127.0.0.1"
SERVER_PORT = 65005

@app.route('/api', methods=['POST'])
def api():
    data = request.json
    command = data.get("command")

    if not command:
        return jsonify({"response": "Comando inválido"}), 400

    try:
        with socket(AF_INET, SOCK_STREAM) as client_socket:
            client_socket.connect((SERVER_HOST, SERVER_PORT))
            client_socket.sendall(command.encode("utf-8"))
            response = client_socket.recv(1024).decode("utf-8")
    except ConnectionRefusedError:
        return jsonify({"response": "Erro ao conectar com o servidor."}), 500

    return jsonify({"response": response})

if __name__ == '__main__':
    app.run(port=3001)