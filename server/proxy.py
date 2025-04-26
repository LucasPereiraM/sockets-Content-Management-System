from flask import Flask, request, jsonify
from socket import socket, AF_INET, SOCK_STREAM
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

SERVER_HOST = os.getenv("SERVER_HOST","localhost")
SERVER_PORT = 5000

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'POST')
    return response

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