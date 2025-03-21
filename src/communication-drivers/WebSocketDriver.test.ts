import { describe, expect, test } from "@jest/globals"
import { Server, WebSocket } from "mock-socket"

import { WebSocketDriver } from "./WebSocketDriver"
import { firstValueFrom } from "rxjs"

describe("WebSocketDriver", () => {
  describe("observable", () => {
    test("reads strings from the websocket", () => new Promise<void>((done) => {
      const server = new Server("ws://test.com:3000")
      server.on("connection", (socket) => {
        socket.send("ABC")
      })

      const webSocket = new WebSocket("ws://test.com:3000")
      webSocket.addEventListener("open", async () => {
        const driver = new WebSocketDriver(webSocket)

        await expect(firstValueFrom(driver.observable)).resolves.toEqual(new Uint8Array([65, 66, 67]))

        server.close()
        done()
      })
    }))
  })

  describe("write", () => {
    test("writes to the websocket", () => new Promise<void>((done) => {
      const server = new Server("ws://test.com:3000")
      server.on("connection", (socket) => {
        socket.on("message", (data) => {
          expect(data).toEqual(new Uint8Array([0x1, 0x2, 0x3]))

          server.close()
          done()
        })
      })

      const webSocket = new WebSocket("ws://test.com:3000")
      webSocket.addEventListener("open", () => {
        const driver = new WebSocketDriver(webSocket)

        driver.write(new Uint8Array([0x1, 0x2, 0x3]))
      })
    }))
  })
})
