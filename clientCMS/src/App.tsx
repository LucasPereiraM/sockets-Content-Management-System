import { useState, FormEvent, useEffect } from "react";
import "./App.css";
import "./index.css";

interface HistoryItem {
  command: string;
  response: string;
}

interface Post {
  key: string;
  title: string;
  value: string;
  author: string;
}

function App() {
  const [response, setResponse] = useState<string>("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [keyInput, setKeyInput] = useState<string>("");
  const [titleInput, setTitleInput] = useState<string>("");
  const [valueInput, setValueInput] = useState<string>("");
  const [authorInput, setAuthorInput] = useState<string>("");

  const updatePosts = async () => {
    try {
      const res = await fetch("http://127.0.0.1:3001/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: "LIST" }),
      });

      const data = await res.json();
      if (data.response === "Nenhum post ainda.") {
        setPosts([]);
      } else {
        const postList = data.response.split("\n").map((line: string) => {
          const parts = line.split(": ");
          if (parts.length < 4) return null;

          const key = parts[0];
          const title = parts[1];
          const author = parts[2];
          const value = parts.slice(3).join(": ");

          return { key, title, value, author };
        }).filter(Boolean) as Post[];

        setPosts(postList);
      }
    } catch (error) {
      setResponse("Erro ao conectar com o servidor.");
    }
  };


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!titleInput.trim() || !valueInput.trim() || !authorInput.trim()) return;
    if (keyInput) {
      await handleUpdate();
      return;
    }

    const key = crypto.randomUUID();

    try {
      const res = await fetch("http://127.0.0.1:3001/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: `CREATE '${key}' '${titleInput}' '${authorInput}' '${valueInput}'`,
        }),
      });

      const data = await res.json();
      setResponse(data.response);

      setHistory((prevHistory) => [
        ...prevHistory,
        { command: `CREATE '${key}' '${titleInput}' '${authorInput}' '${valueInput}'`, response: data.response },
      ]);

      updatePosts();
    } catch (error) {
      setResponse("Erro ao conectar com o servidor.");
    }

    setTitleInput("");
    setValueInput("");
    setAuthorInput("");
    setKeyInput("");
  };


  const handleEdit = async (key: string, title: string, author: string, value: string) => {
    setKeyInput(key);
    setTitleInput(title);
    setAuthorInput(author);
    setValueInput(value);
    document.getElementById('input-section')?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (key: string) => {
    try {
      const res = await fetch("http://127.0.0.1:3001/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: `DELETE '${key}'` }),
      });

      const data = await res.json();
      setResponse(data.response);
      updatePosts();
    } catch (error) {
      setResponse("Erro ao conectar com o servidor.");
    }
  };

  const handleUpdate = async () => {
    if (!keyInput.trim() || !titleInput.trim() || !valueInput.trim() || !authorInput.trim()) return;

    try {
      const res = await fetch("http://127.0.0.1:3001/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: `UPDATE '${keyInput}' '${titleInput}' '${authorInput}' '${valueInput}'`,
        }),
      });

      const data = await res.json();
      setResponse(data.response);
      updatePosts();
    } catch (error) {
      setResponse("Erro ao conectar com o servidor.");
    }

    setTitleInput("");
    setValueInput("");
    setAuthorInput("");
    setKeyInput("");
  };


  useEffect(() => {
    updatePosts();
  }, []);

  return (
    <div className="app text-white flex flex-col justify-center items-center">
      <div className="flex flex-row items-center gap-5 rounded border-2 mt-5 mb-5 p-2">
        <h1 className="text-5xl mb-5 mt-5 font-semibold w-fit p-5 bg-blue-700 rounded-lg">Blog do Lucas P. Maciel</h1>
        <img src="./chat.svg" alt="logo" className="rounded-md w-20 bg-blue-700 p-5" style={{ color: "blue" }} />
      </div>
      <div id="admin-panel" className="border-2 rounded-lg w-fit p-5 ml-5 bg-gray-800 flex flex-col justify-center items-center">
        <h2 className="text-2xl mb-10" id="input-section">Painel de Admin</h2>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="flex flex-col gap-5">
            <input
              type="text"
              className="w-[400px] text-black rounded-lg p-3 mt-1"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder="Digite o título"
            />
            <input
              type="text"
              className="w-[400px] text-black rounded-lg p-3 mt-1"
              value={authorInput}
              onChange={(e) => setAuthorInput(e.target.value)}
              placeholder="Digite o autor"
            />
            <textarea
              className="w-[400px] text-black rounded-lg p-3 mt-1"
              value={valueInput}
              onChange={(e) => setValueInput(e.target.value)}
              placeholder="Digite o conteúdo"
            />
          </div>

          <button type="submit" className="border-2 p-2 rounded-lg bg-blue-600 font-bold hover:bg-blue-700 gap-5 flex flex-row h-12 mt-14 flex justify-center">
            enviar
            <img src="./send.svg" alt="enviar" className="mt-1 w-[18px]" />
          </button>
        </form>

        <div className="response mt-10 text-lg font-bold" id="response">
          <h2>Resposta do Servidor:</h2>
          <p className="text-blue-400 max-w-[600px] text-wrap h-28 overflow-y-auto">{response}</p>
        </div>

        <div className="history mt-10 text-lg font-bold" id="log">
          <h2>Histórico de Comandos:</h2>
          <ul>
            {history.map((item, index) => (
              <li key={index} className="mb-10 mt-5 flex flex-row gap-5 border-2 rounded-lg p-2 w-fit shadow-2xl hover:bg-gray-00">
                <div className="bg-white rounded p-1 h-10">
                  <img src="./box-arrow-in-right.svg" alt="" className="w-7" />
                </div>
                <div className="flex flex-col gap-2 mt-1 w-[600px]">
                  <strong className="text-blue-400">Comando:</strong> <p className="h-28 overflow-y-auto">{item.command}</p> <br />
                  <strong className="text-blue-400">Resposta:</strong> <p className="h-28 overflow-y-auto">{item.response}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div id="blog-posts" className=" mt-10">
        <h2 className="text-2xl font-bold mb-10">Postagens:</h2>
        {posts.length > 0 ? (
          <ul>
            {posts.map((post) => {
              const title = post.title;
              const author = post.author;
              const content = post.value;

              return (
                <li key={post.key} className="mb-4 p-4 border-2 rounded-lg w-fit min-w-[760px]">
                  <div className="flex flex-col">
                    <p className="font-semibold text-lg">{title}</p>
                    <p className="text-sm text-gray-600">Autor: {author}</p>
                    <p className="text-base mt-2 text-wrap w-[600px]">{content}</p>
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={() => handleEdit(post.key, post.title, post.author, post.value)}
                      className="text-blue-500 hover:text-blue-700 mr-5 bg-blue-500 rounded-md"
                    >
                      <img src="./pencil-fill.svg" alt="editar" className="w-7 p-1" />
                    </button>
                    <button
                      onClick={() => handleDelete(post.key)}
                      className="text-red-500 hover:text-red-700 bg-red-500 rounded-md"
                    >


                      <img src="./x-lg.svg" alt="excluir" className="w-7 p-1" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p>Nenhum post ainda.</p>
        )}
      </div>
    </div>
  );
}

export default App;
