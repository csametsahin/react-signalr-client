import { useEffect, useState } from "react";
import "./App.css";
import * as signalR from "@microsoft/signalr";

function App() {
  // States
  const [message, setMessage] = useState<string>("Hello World");
  const [receivedMessages, setReceivedMessages] = useState<string[]>([]);
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [connected, setConnected] = useState<boolean>(false);
  // Hub Connection Methods
  let connection = new signalR.HubConnectionBuilder()
    .withUrl("https://localhost:7213/myfirsthub")
    .withAutomaticReconnect() // default 0 - 2 - 10 - 30 if connection is not failed at first
    .build();

  // TODO : there is a potential re-render error while users connected in this component
  const handleSendMessageToHub = () => {
    connection.invoke("SendMessage", message).catch((err) => {
      return console.error(err.toString());
    });
  };
  connection.on("receivedMessage", (message) => {
    setReceivedMessages([...receivedMessages, message]);
  });
  connection.on("userConnected", (connectionId) => {
    console.log(`${connectionId} bağlandı`);
  });
  connection.on("userDisconnected", (connectionId) => {
    console.log(`${connectionId} ayrıldıo`);
  });
  connection.on("clients", (clients) => {
    console.log(clients);
  });
  const startHubConnection = async () => {
    try {
      await connection.start();
      setConnected(true);
      console.log("Connection started");
    } catch (err) {
      console.log("Error while starting connection: " + err);
      setTimeout(() => startHubConnection(), 5000);
    }
  };

  connection.onreconnecting((error) => {
    console.assert(
      connection.state === signalR.HubConnectionState.Reconnecting
    );

    setConnecting(true);
  });
  connection.onreconnected((connectionId) => {
    console.assert(connection.state === signalR.HubConnectionState.Connected);

    setConnecting(false);
    setConnected(true);
  });

  connection.onclose(() => {
    console.assert(
      connection.state === signalR.HubConnectionState.Disconnected
    );

    setConnecting(false);
    setConnected(false);
  });
  //Effects
  useEffect(() => {
    function onCreate() {
      startHubConnection();
    }
    // Strict mode will cause a re-render
    onCreate();
  });

  return (
    <div className="App">
      <header className="App-header">
        {connecting && <p>Connecting...</p>}
        {connected && <p>Connected</p>}
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={handleSendMessageToHub}>Click me</button>
        {receivedMessages?.map((message) => (
          <p key={message}>{message}</p>
        ))}
        {connectedUsers?.map((user) => (
          <p key={user}>{user}</p>
        ))}
      </header>
    </div>
  );
}

export default App;
