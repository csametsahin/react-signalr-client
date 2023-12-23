import React, { useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import * as signalR from "@microsoft/signalr";

function App() {
  const [message, setMessage] = useState<string>("Hello World");
  const [receivedMessages, setReceivedMessages] = useState<string[]>([]); // [
  let connection = new signalR.HubConnectionBuilder()
    .withUrl("https://localhost:7213/myfirsthub")
    .build();

  connection.start();

  const handleSendMessageToFirstHub = () => {
    connection.invoke("SendMessage", message).catch((err) => {
      return console.error(err.toString());
    });
  };
  connection.on("receivedMessage", (message) => {
    setReceivedMessages([...receivedMessages, message]);
  });
  return (
    <div className="App">
      <header className="App-header">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={handleSendMessageToFirstHub}>Click me</button>
        {receivedMessages?.map((message) => (
          <p key={message}>{message}</p>
        ))}
      </header>
    </div>
  );
}

export default App;
