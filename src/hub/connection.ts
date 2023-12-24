import * as signalR from "@microsoft/signalr";
import { IHub } from "./types";

import { useEffect, useState } from "react";

/**
 * this somehow doesnt work will try to fix it later
 *  it doesnt reconnect after disconnecting and after connection established it says can not send a message with a disconnected connection
 */
export function useHubConnection() {
  // Hub Connection States
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(true);
  // Hub Connection Methods
  let connection = new signalR.HubConnectionBuilder()
    .withUrl("https://localhost:7213/myfirsthub")
    .withAutomaticReconnect({
      nextRetryDelayInMilliseconds: (retryContext) => {
        console.log(`Retrying in ${retryContext.elapsedMilliseconds} ms.`);
        return Math.min(10000, retryContext.elapsedMilliseconds * 2); // Exponential backoff with a max delay of 10 seconds
      },
    })
    .build();

  const startHubConnection = async () => {
    try {
      await connection.start();
      setIsConnected(true);
      setIsConnecting(false);
    } catch (err) {
      console.log("Error while starting connection: " + err);
      setTimeout(() => startHubConnection(), 5000);
    }
  };

  connection.onreconnecting((error) => {
    console.assert(
      connection.state === signalR.HubConnectionState.Reconnecting
    );
    console.log("Connection lost due to error. Reconnecting.");
    setIsConnected(false);
    setIsConnecting(true);
  });

  connection.onreconnected((connectionId) => {
    console.assert(connection.state === signalR.HubConnectionState.Connected);
    console.log(
      "Connection reestablished. Connected with connectionId: " + connectionId
    );
    setIsConnected(true);
    setIsConnecting(false);
  });

  connection.onclose(() => {
    console.assert(
      connection.state === signalR.HubConnectionState.Disconnected
    );
    console.log("Connection closed");
    setIsConnected(false);
    setIsConnecting(false);
  });

  const handleSendMessageToHub = (message: string) => {
    console.log(connection);
    connection.invoke("SendMessage", message).catch((err) => {
      return console.error(err.toString());
    });
  };
  //Effects
  useEffect(() => {
    function onCreate() {
      startHubConnection();
    }
    // Strict mode will cause a re-render
    console.log("rendered");
    onCreate();
  }, []);
  return {
    connection,
    isConnected,
    isConnecting,
    handleSendMessageToHub,
  };
}
