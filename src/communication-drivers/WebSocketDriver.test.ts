import { describe, expect, test } from "@jest/globals"
import { Server, WebSocket } from "mock-socket"

import { WebSocketDriver } from "./WebSocketDriver"
import { firstValueFrom } from "rxjs"

describe("WebSocketDriver", () => {
  describe("isOpen", () => {
    test("it returns the websocket open state", async () => {
      const server = new Server("ws://test.com:3000")
      const webSocket = new WebSocket("ws://test.com:3000")
      const driver = new WebSocketDriver(webSocket)

      await driver.open()
      expect(driver.isOpen).toBe(true)

      driver.close()
      expect(driver.isOpen).toBe(false)

      server.close()
    })
  })

  describe("close", () => {
    test("it closes the websocket", async () => {
      const server = new Server("ws://test.com:3000")
      server.on("connection", (socket) => {
        socket.send("ABC")
      })

      const webSocket = new WebSocket("ws://test.com:3000")
      const driver = new WebSocketDriver(webSocket)

      await driver.open()
      driver.close()
      expect(webSocket.readyState).toBe(WebSocket.CLOSING)

      server.close()
    })
  })

  describe("observable", () => {
    test("reads strings from the websocket", async () => {
      const server = new Server("ws://test.com:3000")
      server.on("connection", (socket) => {
        socket.send("ABC")
      })

      const webSocket = new WebSocket("ws://test.com:3000")
      const driver = new WebSocketDriver(webSocket)
      const result = firstValueFrom(driver.observable)
      await driver.open()

      await expect(result).resolves.toEqual(new Uint8Array([65, 66, 67]))

      server.close()
    })
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
      const driver = new WebSocketDriver(webSocket)

      driver.open()
        .then(() => driver.write(new Uint8Array([0x1, 0x2, 0x3])))
    }))
  })
})
