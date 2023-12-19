# Echo Server Client
Cliente websockets para aplicaciones bajo JavaScript o cualquier Framework bajo JS, este cliente funciona usando el servidor [Echo Server](https://gitlab.com/elyerr/echo-server)

#### INSTALACIÓN BAJO NODEJS
Puedes instalarlo fácilmente en tus proyectos ejecutando el siguiente comando
```
npm i echo-client-js
```
#### CONFIGURACIÓN
configuracion para el framework de vuejs, puedes ajustarlo dependiendo del framework
```
import "./assets/main.css";
import EchoClient from "echo-client-js"; //paquete
import { createApp } from "vue";
import App from "./App.vue";

//configuracion del cliente
const echo = new EchoClient({
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
Existen 3 categorías de canales, estos son accedidos a través de una instancia de echo-client, el parámetro **canal** es el nombre del canal por donde se emitirá el evento
- **channel(canal)** : canal publico
- **private(canal)** : canal privado
- **presence(canals)** : canal de presencia

### PARÁMETROS ACEPTADOS
- **host** : uri donde se ejecuta el servidor principal websocket.
- **port**: puerto en donde se ejecuta el servidor websockets.
- **transport** : acepta los dos estandares **ws** mayormente para testing y **wss**, si no se agrega la propiedad se usará **wss** por defecto. 

El servidor websockets [Echo Server](https://gitlab.com/elyerr/echo-server), por defecto para la autenticación de canales privados y presence usarán las cookies de cada cliente para la autenticación. si el host de autorización maneja la sesión por cookies asegúrate de que estas sean compartidas por todos los subdominios para que el cliente tenga acceso a esas cookies y se envien por medio del server websocket en caso contrario puede agregar el token de autorizacion directamente en la configuración global de EchoClient agregando la siguiente llave. 

```
headers: {
Authorization: "token",
},

```
**Nota:** debes tener en cuenta que el servidor websocket [Echo Server](https://gitlab.com/elyerr/echo-server) no se encarga de la autorización directamente, simplemente envía las credenciales aun host por medio de un **endpoint** que este le proporciona, si tu host lo desarrollaste tu mismo deberás recuperar las credenciales que van en las cabeceras y realizar tu propia lógica de autorización. si estas usando un framework como laravel ya tiene un **endpoint** y una lógica predefinida que automáticamente procesará las credenciales que van en las cabeceras tomando por defecto las cookies y si estas utilizado microservicios y quieres que te autentique también por token deberás pasar el middleware como parámetro en el service provider para que pueda autorizar los tokens.

Esta configuración de ejemplo solo aplica para micro-servicios bajo Laravel deberás adaptarla según tu framework o dependiendo la configuración que tengas

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
Para emitir eventos simplemente se debe llamar a la instancia de echo global, esta acción puede ir dentro de una función para que sea fácil de controlar, recibe tres parámetros, siendo los 2 últimos parámetros opciones, el primer parámetro es el nombre del evento a emitir, el segundo es un mensaje en el evento, y el último es un id por defecto tomará el id único por sesión generada cuando no se ingresa un valor
```
nuevoEvento() {
this.$echo.channel("chat").event(EventName: String, msg: String, id: string);
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
También puedes escuchar múltiples eventos de un solo canal de la siguiente forma, esto para todos los tipos de canales

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
También te permite solo escuchar los eventos de los demás usuarios que emitan, exceptuando los tuyos propios usando la siguiente función

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
Hay dos tipos de listener por defecto que son emitidos justo cuando alguien se conecta o se desconecta, puedes usarlo por las diferentes categorías de canales y no solo aplica para públicos dependiendo del usuario estos se emitirán por el respectivo canal que fue autorizado, el ejemplo debajo hace uso de canales públicos
```
this.$echo.channel(ChannelName).listen("authorize", (msg) => {
//logica aqui
});

this.$echo.channel(ChannelName).listen("unsubscribe", (msg) => {
//logica aqui
});

```

Se integro dos oyentes que te permiten capturar excepciones cuando se pierda la conexion con el server o cuando suceda algun error
```
this.$echo.closed((close) => {
//logica aqui
});

this.$echo.error((error) => {
//logica aqui
});

```

### DESCONECTARTE DEL SERVIDOR DE WEBSOCKETS
mediante este método te permitirá desconectarte del servidor websockets, ten en cuenta que esto hará que no recibas información en tiempo real si tu aplicación es reactiva. Si deseas volver a conectarte al servidor deberás recargar la pagina para que automáticamente genere nuevas credenciales.
```
this.$echo.unsubscribe();

```

## CONFIGURACION PROXY
Puedes revisar la documentacion del servidor websockets [Echo Server](https://gitlab.com/elyerr/echo-server/-/blob/main/README.md?ref_type=heads#user-content-multi-instancias) , tambien veras como distribuir la carga en multiples instancias.