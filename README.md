# Echo Server Client

Websocket client for js applications, this client working using the server [Echo Server](https://gitlab.com/elyerr/echo-server)

## Install on NPM

```bash
npm i echo-client-js
```

## Types of channels

There is a two channels, You can access this channels using the instance of echo client

- **channel(canal)** : Public Channel
- **private(canal)** : Private Channel

## Config in js application (Example)

```js
const options = {
  host: "sockets.domain.xyz/app", //server host
  port: "443", //port
  transport: "wss", //wss or ws
  token: "TOKEN", //credentials to authorize private channels
};

export const $echo = new EchoClient(options);
```

## Emit public events

```js
this.$echo.channel("channel-1").event(EventName: String, msg: String, id: string);
```

## Emit private events

```js
this.$echo.private("channel-1").event(EventName: String, msg: String, id: string);
```

## Listening events

#### Public channels

```js
this.$echo.channel(canal).listen(event, (res) => {
  console.log(res); //or any actions
});
```

#### Private channels

```js
this.$echo.private(canal).listen(event, (res) => {
  console.log(res); //or any actions
});
```

### Listener by default

Example using public channel

```sh
this.$echo.channel(ChannelName).listen("connected", (msg) => {
    console.log(msg);//or any action
});

this.$echo.channel(ChannelName).listen("disconnected", (msg) => {
    console.log(msg);//or any action
});

this.$echo.closed((close) => {
    console.log(msg);//or any action
});

this.$echo.error((error) => {

});
```

# Telegram
- [Telegram](https://t.me/elyerr)
