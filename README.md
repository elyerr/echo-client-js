# Echo Client (Testing)
Cliente websokets para aplicaciones bajo javascript o cualquier framework bajo JS, este cliente funciona usando el servidor [Echo Server](https://gitlab.com/elyerr/echo-server)

#### CONFIGURACION
configuracion para el framework de vuejs, puedes ajustarlo dependiendo del framework
```
import "./assets/main.css";
import EchoClient from "EchoClient"; //paquete
import { createApp } from "vue";
import App from "./App.vue";

//configuracion del cliente
const echo = new EchoClient({
  host: "server.dominio.dom",
  port: "6010",
  transport: 'ws', //wss para ssl
  auth: {
    headers: {
      Authotization: "some_key",
    },
  },
});

const app = createApp(App);
//configuracion global en vue 
app.config.globalProperties.$echo = echo;

app.mount("#app");

```

### TIPOS DE CANALES
Existen 3 tipos de eventos, estos son accedidos a traves de una instacia de echo-client, el parametro **canal** es el nombre del canal por donde se emitira el evento
- **channel(canal)** : canal publico
- **private(canal)** : canal privado
- **presence(canals)** : canal de presencia


### EMITIR EVENTOS
Para emitir eventos simplemente se debe llamar a la instacia de echo global, esta accion puede ir dentro de una funcion para que sea facil de controlar
```
  nuevoEvento() {
      this.$echo.channel("chat").event("message");
    },
```

### ESCUCHAR EVENTOS
Para escuchar eventos se deben acceder desde la instancia global de echo de la sigueinete manera

```
//canales publicos
this.$echo.channel(canal).listen(event, (res) => {
    //logica aqui
})

//canales privados
this.$echo.private(canal).listen(event, (res) => {
    //logica aqui
})

//canales presence
this.$echo.presence(canal).listen(event, (res) => {
    //logica aqui
})

```

Tambien puedes escuchar multiples eventos de un solo canal de la siguiente forma, esto aplica tanto para privados y de presencia

``` 
this.$echo.channel(canal)
.listen(event1, (res) => {
    //logica aqui
})
.listen(event2, (res) => {
    //logica aqui
})
.listen(event3, (res) => {
    //logica aqui
})
.listen(event4, (res) => {
    //logica aqui
})

``` 
Tambien te permite  solo escuchar los eventos de los demas usuarios que emitan exceptuando los tuyos propios usando la siguiente funcion

``` 
this.$echo.channel(canal)
.toOthers(event1, (res) => {
    //logica aqui
})
.toOthers(event2, (res) => {
    //logica aqui
})
.toOthers(event3, (res) => {
    //logica aqui
})
.toOthers(event4, (res) => {
    //logica aqui
})

``` 

Para obtener el id de la session de echo client puedes usar la siguiente funcion
```
this.$echo.getId()
```