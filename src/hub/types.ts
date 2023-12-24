import { HubConnection } from "@microsoft/signalr";

interface IHub {
  isConnected: boolean;
  isConnecting: boolean;
  connection: HubConnection;
  startHubConnection: () => Promise<void>;
}

export type { IHub };
