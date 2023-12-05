# Echo Server Client
Cliente websokets para aplicaciones bajo javascript o cualquier framework bajo JS, este cliente funciona usando el servidor [Echo Server](https://gitlab.com/elyerr/echo-server)

#### INSTALACION BAJO NODEJS
puedes instalarlo facilmente en tus proyectos ejecutando el siguiente comando
```
npm i echo-client-js
```
#### CONFIGURACION
configuracion para el framework de vuejs, puedes ajustarlo dependiendo del framework
```
import "./assets/main.css";
import EchoClient from "echo-client-js"; //paquete
import { createApp } from "vue";
import App from "./App.vue";

//configuracion del cliente
const echo = new EchoClient({
  driver: "null",
  host: "server.dominio.dom",
  port: "6010",
  transport: 'ws', //wss para ssl
});

const app = createApp(App);
//configuracion global en vue 
app.config.globalProperties.$echo = echo;

app.mount("#app");

```

### TIPOS DE CANALES
Existen 3 categorias de canales, estos son accedidos a traves de una instacia de echo-client, el parametro **canal** es el nombre del canal por donde se emitira el evento
- **channel(canal)** : canal publico
- **private(canal)** : canal privado
- **presence(canals)** : canal de presencia

### PARAMETROS ACEPTADOS
- **driver**: soporta dos tipos **null** y **redis**, si no se agrega la propiedad por defecto usara **null**.
- **host** : uri donde se ejecuta el servidor principal.
- **port**: puerto en donde se ejecuta el servidor websockets.
- **transport** : acepta los dos estandares **ws** mayormente para testing y **wss**, si no se agrega la propiedad se usara **wss** por defecto.
- **channels**: requerido cuando el driver es **redis**, los canales van separados por commas **"test1,test2,etc"**

El servidor websockets [Echo Server](https://gitlab.com/elyerr/echo-server), por defecto para la autenticacion de canales privados y presence usararan las cookies de cada cliente para la autenticacion. si el host de autorizacion maneja la sesion por cookies asegurate de que estas sean compartidas por todos los subdominios para que el cliente tenga acceso a esas cookies y se envien por medio del server websocket en caso contrario puede agregar el token de autorizacion directamente en la configuracion global de EchoClient agregando los siguiente llave. 

```
headers: {
    Authorization: "token",
 },

```
**Nota:** debes tener en cuenta que el servidor websocket [Echo Server](https://gitlab.com/elyerr/echo-server) no se encarga de la autorizacion directamente, simplemente envia las credenciales aun host por medio de un **endpoint** que este le proporciona, si tu host lo desarrollaste tu mismo deberas recuperar las credenciales que van en las cabeceras y realizar tu propia logica de autorizacion. si estas usando un framework como laravel ya tiene un **endpoint** y una logica predefinada que automaticamente procesará las credenciales que van en las cabeceras tomando por defecto las cookies y si estas utilizado microservicios y quieres que te autentique tambien por token deberas pasale el middleware como parametro en el service provider para que pueda autorizar los tokens.

Esta condfiguracion de ejemplo solo aplica para microservicios bajo laravel deberas adaptarla segun tu framework o dependiendo la configuracion que tengas

```
   public function boot()
    {
        $middleware = request()->cookie(env('COOKIE_NAME', 'auth_server')) ? //cookie de session
        ['middleware' => ['web']] : //sesion por defecto de laravel
        ['middleware' => ['auth:api']];//usando passport

        Broadcast::routes($middleware);

        require base_path('routes/channels.php');
    }

``` 

### EMITIR EVENTOS
Para emitir eventos simplemente se debe llamar a la instacia de echo global, esta accion puede ir dentro de una funcion para que sea facil de controlar, recibe tres parametros, siendo
los 2 ultimos parametros opciones, el primer parametro es el nombre del evento a emitir, el segundo es un mensaje en el evento, y el ultimo es un id por defecto tomara el id unico por sesion generada cuando no se ingresa un valor
```
  nuevoEvento() {
      this.$echo.channel("chat")event(EventName: String, msg: String, id: string);
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
### LISTENER U OYENTES ANIDADOS
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
### OBTENER EL IDENTIFICADOR DE SESSION
Para obtener el id de la session de echo client puedes usar la siguiente funcion
```
this.$echo.getId()
```

### LISTENER U OYENTES POR DEFECTO
Hay dos tipos de listener por defecto que son emitidos justo cuando alguien se conecta o se desconecta, puedes usarlo por los diferentes categorias de canales no solo aplica para publicos dependiendo del usuario estos se emitiran por el respectivo canal, el ejemplo debajo hace uso de canales publicos
```
this.$echo.channel(ChannelName).listen("subscribe", (msg) => {
       //logica aqui
    });

this.$echo.channel(ChannelName).listen("unsubscribe", (msg) => {
    //logica aqui
    });

```

Se integegro dos oyentes que te pemiten capturar excepciones cuando se pierda la conexion con el server o cuando suceda algun error
```
 this.$echo.closed((close) => {
      //logica aqui
    });

    this.$echo.error((error) => {
      //logica aqui
     });

```

### DESCONECTARTE DEL SERVIDOR DE WEBSOCKETS
midiante este metodo te permitirá desconectarte del servidor websockets, ten encuenta que esto hara que no recibas informacion en tiempo real si tu aplicacion es reactiva. si desdeas volver a conectarte al servidor deberas recargar la pagina para que automaticamente genere nuevas credenciales.
```
this.$echo.unsubscribe();

```
