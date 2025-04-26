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
      const res = await fetch(`/api`, {
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
      const res = await fetch(`/api`, {
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
      const res = await fetch(`/api`, {
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
      const res = await fetch(`/api`, {
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
      <div className="flex flex-row items-center gap-5 mt-5 mb-5 p-2 bg-blue-600 rounded-lg">
        <h1 className="text-5xl mb-5 mt-5 font-semibold w-fit rounded-lg">Blog in</h1>
        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="currentColor" className="bi bi-stars" viewBox="0 0 16 16">
          <path d="M7.657 6.247c.11-.33.576-.33.686 0l.645 1.937a2.89 2.89 0 0 0 1.829 1.828l1.936.645c.33.11.33.576 0 .686l-1.937.645a2.89 2.89 0 0 0-1.828 1.829l-.645 1.936a.361.361 0 0 1-.686 0l-.645-1.937a2.89 2.89 0 0 0-1.828-1.828l-1.937-.645a.361.361 0 0 1 0-.686l1.937-.645a2.89 2.89 0 0 0 1.828-1.828zM3.794 1.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387A1.73 1.73 0 0 0 4.593 5.69l-.387 1.162a.217.217 0 0 1-.412 0L3.407 5.69A1.73 1.73 0 0 0 2.31 4.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387A1.73 1.73 0 0 0 3.407 2.31zM10.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.16 1.16 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.16 1.16 0 0 0-.732-.732L9.1 2.137a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732z" />
        </svg>
      </div>
      <div id="admin-panel" className="border-2 rounded-lg w-fit ml-5 bg-gray-200 flex flex-col justify-center items-center shadow-lg">
        <h2 className="text-2xl mb-10 font-semibold bg-blue-600 p-5 w-[700px] rounded-lg text-center" id="input-section">Painel de Admin</h2>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="flex flex-col gap-5 mt-10">
            <input
              type="text"
              className="w-[400px] text-black rounded-lg p-3 mt-1 shadow-lg"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder="Digite o título"
            />
            <input
              type="text"
              className="w-[400px] text-black rounded-lg p-3 mt-1 shadow-lg"
              value={authorInput}
              onChange={(e) => setAuthorInput(e.target.value)}
              placeholder="Digite o autor"
            />
            <textarea
              className="w-[400px] text-black rounded-lg p-3 mt-1 shadow-lg"
              value={valueInput}
              onChange={(e) => setValueInput(e.target.value)}
              placeholder="Digite o conteúdo"
            />
          </div>

          <button type="submit" className="border-2 p-2 rounded-lg bg-blue-600 font-bold hover:bg-blue-500 gap-5 flex flex-row h-12 mt-14 flex justify-center">
            enviar
            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-send-fill" viewBox="0 0 16 16">
              <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471z" />
            </svg>
          </button>
        </form>

        <div className="response mt-10 text-lg font-bold border-2 border-gray-500 p-5 rounded-lg" id="response">
          <h2 className="bg-blue-600 rounded-lg p-2 w-[400px]">Resposta do Servidor</h2>
          <p className="text-gray-500 max-w-[400px] text-wrap h-28 overflow-y-auto mt-5">{response}</p>
        </div>

        <div className="history mt-10 text-lg font-bold" id="log">
          <h2 className="bg-blue-600 rounded-lg p-2">Histórico de Comandos:</h2>
          <ul>
            {history.map((item, index) => (
              <li key={index} className="mb-10 mt-5 flex flex-row gap-5 border-2 border-gray-500 rounded-lg p-2 w-fit">
                <div className="bg-blue-600 rounded p-1 h-10 w-10 mt-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-box-arrow-in-right" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M6 3.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 0-1 0v2A1.5 1.5 0 0 0 6.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-8A1.5 1.5 0 0 0 5 3.5v2a.5.5 0 0 0 1 0z" />
                    <path fill-rule="evenodd" d="M11.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H1.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z" />
                  </svg>
                </div>
                <div className="flex flex-col gap-2 mt-1 w-[600px]">
                  <strong className="text-blue-600">Comando:</strong> <p className="h-28 overflow-y-auto text-gray-500">{item.command}</p> <br />
                  <strong className="text-blue-600">Resposta:</strong> <p className="h-28 overflow-y-auto text-gray-500">{item.response}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div id="blog-posts" className=" mt-10">
        <h2 className="text-2xl font-bold mb-10 ml-14 bg-blue-600 rounded-lg p-2 w-[200px]">Postagens</h2>
        {posts.length > 0 ? (
          <ul className="ml-10">
            {posts.map((post) => {
              const title = post.title;
              const author = post.author;
              const content = post.value;

              return (
                <li key={post.key} className="mb-4 p-4 border-2 rounded-lg w-fit min-w-[760px] bg-gray-200 shadow-lg">
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleEdit(post.key, post.title, post.author, post.value)}
                      className="text-blue-500 mr-5 bg-blue-600 hover:bg-blue-500 rounded-md"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-pencil-fill text-white p-1" viewBox="0 0 16 16">
                        <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(post.key)}
                      className="text-red-500 bg-red-600 hover:bg-red-500 rounded-md"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-x text-white p-1" viewBox="0 0 16 16">
                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex flex-col mb-7">
                    <p className="font-semibold text-lg text-blue-600">{title}</p>
                    <p className="text-sm text-black">Autor: {author}</p>
                    <p className="text-base mt-2 text-wrap w-[600px] text-gray-600">{content}</p>
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
