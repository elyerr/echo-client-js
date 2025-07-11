# Echo Server Client

A lightweight WebSocket client for JavaScript applications, designed to work seamlessly with the [Echo Server](https://gitlab.com/elyerr/echo-server). This client provides support for **public** and **private** channels, event broadcasting, and reconnection handling.

---

## 🔧 Installation

Install the package via npm:

```bash
npm install echo-client-js
```

---

## 📡 Supported Channel Types

This client provides two types of real-time communication channels:

* `channel(name, prefix?)`: Access a **public** channel.
* `private(name, prefix?)`: Access a **private** channel (requires token-based authorization).

You can optionally pass a `prefix` as a second parameter. This is useful when working with frameworks like Laravel, which may prepend a Redis prefix to channel names. Using the correct prefix ensures events are detected and routed properly **when receiving events**.

> ⚠️ Prefix is **optional** when emitting events from the client (JS). But when **listening to events** emitted from Laravel, you must provide the correct prefix if Laravel includes one in Redis.

---

## ⚙️ Configuration & Initialization

To use the client, initialize it with the required configuration options:

```ts
import EchoClient from "echo-client-js";

const options = {
  host: "sockets.domain.xyz/app", // WebSocket server host
  port: 443,                      // WebSocket port
  transport: "wss",              // Protocol: "ws" or "wss"
  token: "YOUR_TOKEN",           // Optional: for private channel auth
  reload: false,                 // Optional: auto-reload on disconnect
};

export const $echo = new EchoClient(options);
```

---

## 🚀 Emitting Events

### Public Channels

```ts
$echo.channel("channel-1").event("eventName", "message");
```

### Private Channels

```ts
$echo.private("channel-1").event("eventName", "message");
```

You may include a prefix when emitting, though it's optional:

```ts
$echo.private("channel-1", "laravel_database").event("eventName", "message");
```

---

## 📥 Listening for Events

### Listen on Public Channel

If the event was emitted by Laravel with a Redis prefix, **you must provide it** when listening:

```ts
$echo.channel("channel-1", "laravel_database").listen("eventName", (payload) => {
  console.log(payload);
});
```

Otherwise:

```ts
$echo.channel("channel-1").listen("eventName", (payload) => {
  console.log(payload);
});
```

### Listen on Private Channel

```ts
$echo.private("channel-1").listen("eventName", (payload) => {
  console.log(payload);
});
```

---

## 🔀 Listening with `toOthers`

Only triggers if the event was **not** emitted by the current socket (useful to avoid echoing back to self):

```ts
$echo.channel("channel-1").toOthers("eventName", (payload) => {
  console.log("From others:", payload);
});
```

---

## 🧠 Default Event Listeners

You can listen to built-in events such as connection, disconnection, or errors:

```ts
$echo.channel("channel-1")
  .listen("connected", (msg) => {
    console.log("Connected:", msg);
  })
  .listen("disconnected", (msg) => {
    console.log("Disconnected:", msg);
  });

// Handle socket close
$echo.closed((reason) => {
  console.warn("Connection closed:", reason);
});

// Handle errors
$echo.error((error) => {
  console.error("WebSocket error:", error);
});
```

> ⚠️ `closed` and `error` are planned extensions — implement their handlers if you extend the client for error or closure handling hooks.

---

## 🔐 Private Channels & Authentication

To authorize private channels, make sure to pass a `token` during initialization. The token is sent with each channel authorization request.

```ts
const options = {
  host: "sockets.domain.xyz/app",
  port: 443,
  transport: "wss",
  token: "YOUR_AUTH_TOKEN", // required for private channels
};
```

---

## 🔄 Reconnection Strategy

If `reload: true` is set, the client will attempt to reconnect to the server every 10 seconds and reload the page upon reconnection.

---

## 📘 API Reference

### `new EchoClient(options: EchoOptions)`

Initializes a new client with configuration.

### `channel(name: string, prefix?: string)`

Returns a `PublicChannel` instance.

### `private(name: string, prefix?: string)`

Returns a `PrivateChannel` instance (requires `token`).

### `.listen(event: string, callback: Function)`

Listens for a specific event.

### `.event(event: string, message: string)`

Emits an event with a message payload.

### `.toOthers(event: string, callback: Function)`

Listens for events excluding the current socket.

---

## 💬 Support & Community

If you have questions, suggestions, or just want to get in touch:

* Telegram: [@elyerr](https://t.me/elyerr)

---

## 📄 License

[GNU General Public License](./LICENSE.md)
