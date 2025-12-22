import { useRef, useState, useEffect } from 'react'
import './App.css'

function Home() {
  const [messages, setMessages] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const socketRef = useRef<WebSocket | null>(null);
  
  useEffect(() => {
    const connectWebSocket = () => {
      const clientId = crypto.randomUUID();
      socketRef.current = new WebSocket(`ws://localhost:8000/ws/${clientId}`);

      socketRef.current.onopen = () => {
        console.log("コネクションを確立しました");
        setIsConnected(true);
      };

      socketRef.current.onmessage = (event: MessageEvent<string>) => {
        console.log("サーバからメッセージを受け取りました:", event.data);
        setMessages((prev: string[]) => [...prev, event.data]);
      };

      socketRef.current.onerror = (error: Event) => {
        console.log("エラーが発生しました:", error);
      };

      socketRef.current.onclose = () => {
        console.log("サーバとのコネクションをクローズしました");
        setIsConnected(false);
      };
    };

    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [])



  const sendMessage = () => {
    if (socketRef.current && isConnected) {
      socketRef.current.send(input);
      console.log("WebSocketサーバにメッセージを送信しました。 message ->", input);
      setInput("");
    } else {
      console.error("WebSocketサーバとの通信を確立できません");
    }
  };

  const closeConnection = () => {
    if (socketRef.current) {
      socketRef.current.close();
      console.log("WebSocketサーバとのコネクションをクローズします");
      setIsConnected(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold">WebSocket Messages</h1>
      <div className="p-4">
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Enter message'
          className="border rounded p-2 mr-2"
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white p-2 rounded"
            >
              Send
            </button>
            <button
              onClick={closeConnection}
              className="bg-red-500 text-white p-2 rounded ml-2"
              >
                Close Connection
              </button>
      </div>
      <div>
        <p className="ml-4">
          status: {isConnected ?  "Connected" : "Disconnected, reconnecting..."}
        </p>
        <ul className="ml-4">
          {messages.map((msg: string, index: number) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Home;
