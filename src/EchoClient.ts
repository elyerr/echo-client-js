import { PrivateChannel } from "./channels/PrivateChannel";
import { PublicChannel } from "./channels/PublicChannel";
import { PresenceChannel } from "./channels/PresenceChannel";

export default class EchoClient {

    /**
     * almacena los datos de conexion y credenciales de usuario
     * @var any
     */
    private options: any;

    /**
     * Crear una instancia del servidor websocket
     * @var String
     */
    private server: WebSocket;

    /**
     * inicializa el servidor websockets
     * @param options
     */

    /**
     * indentificador unico del cliente
     * @var string
     */
    private uuid: String;

    /**
     * URL o endpoint del servidor websockets
     * @var string
     */
    private endpoint: string;

    /**
     * constructor principal de la clase
     * 
     * @param options 
     */
    constructor(options: any) {

        this.uuid = self.crypto.randomUUID();

        this.options = JSON.parse(JSON.stringify(options))

        this.endpoint = `${this.options.transport ? this.options.transport : 'wss'}://${this.options.host}:${this.options.port}`

        this.server = new WebSocket(this.endpoint)

        this.server.addEventListener('open', (open) => {
            this.server.send(this.session())
        })
    }

    /**
     * acceso a canales publicos
     * 
     * @param channel_name : String
     * @returns 
     */
    channel(channel_name: String) {
        const channel = new PublicChannel(this.server, channel_name, null, this.uuid)
        return channel
    }

    /**
     * Retorna una instancia de un canal privado
     * 
     * @param channel_name 
     * @returns PrivateCannel
     */
    private(channel_name: String) {
        const channel = new PrivateChannel(this.server, channel_name, this.options.auth, this.uuid)
        return channel
    }

    /**
     * Escucha canales de presencia
     * 
     * @param channel_name : String
     * @returns 
     */
    presence(channel_name: string) {
        const channel = new PresenceChannel(this.server, channel_name, this.options.auth, this.uuid);
        return channel
    }

    /**
    * envia informacion relevante al servidor cuando se ingresa por primera vez
    * 
    * @return String
    */
    session() {

        const data = {
            id: this.uuid,
            host: window.location.hostname,
            action: 'subscribe',
        }

        return JSON.stringify(data)
    }

    /**
     * subscribe al cliente al servidor websockets normalmente suele usarse luego
     * de terminar una sesion con el servidor websockets
     * 
     * @param callback : Function
     * @return void
     */
    /*subscribe(callback: Function) {
        this.server = new WebSocket(this.endpoint)
        this.server.send(this.session())
        this.server.addEventListener('open', (open) => {
            return callback(open)
        })
    }*/

    /**
    * cierra una conexion con el servidor websocket
    * 
    * @return String
    */
    unsubscribe() {

        const data = {
            id: this.uuid,
            host: window.location.hostname,
            action: 'unsubscribe',
        }

        this.server.send(JSON.stringify(data))

        const message = 'The client has finished connection'
        this.server.close(1000, message)
    }

    /**
     * escucha el envento cuando el servidor cierra la conexion 
     * 
     * @param callback : Function
     */
    closed(callback: Function) {
        this.server.addEventListener('close', (close) => {
            return callback(close)
        })
    }

    /**
     * escucha el envento cuando ocurre un error con el servidor websockets
     * 
     * @param callback Function
     */
    error(callback: Function) {
        this.server.addEventListener('error', (error) => {
            return callback(error)
        })
    }


    /**
     * retorna el uuid unico generado por cada session
     * 
     * @return String
     */
    getId() {
        return this.uuid;
    }
}