import * as signalR from '@microsoft/signalr'

// 하나만 써야지. 싱글턴!
let connection = null

export const getDashboardConnection = () => {
  if (!connection) {
    connection = new signalR.HubConnectionBuilder()
      .withUrl('/hubs/dashboard')
      .withAutomaticReconnect()
      .build()
  }

  return connection
}
