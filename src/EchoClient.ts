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
     * constructor principal de la clase
     * @param options 
     */
    constructor(options: any) {
        
        this.uuid = self.crypto.randomUUID();

        this.options = JSON.parse(JSON.stringify(options))

        const endpoint = `${this.options.transport ? this.options.transport : 'wss'}://${this.options.host}:${this.options.port}`

        this.server = new WebSocket(endpoint)

        this.server.onopen = () => {
            this.server.send(this.subscribe())
        }

        this.server.onerror = (error) => {
            console.log(error);
        }

        this.server.onclose = (close) => {
            if (close.code == 1000) {
                this.server.send(this.unsubscribe())
                this.server = new WebSocket(endpoint)
            }
        }
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
    private(channel_name: String, message: String) {
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
    * envia informacion relevante al servidor
    * 
    * @return String
    */
    subscribe() {

        const data = {
            id: this.uuid, 
            host: window.location.hostname,
            action: 'subscribe',
        }

        return JSON.stringify(data)
    }

    /**
    * envia informacion relevante al servidor
    * 
    * @return String
    */
    unsubscribe() {

        const data = {
            host: window.location.hostname,
            action: 'unsubscribe',
        }

        return JSON.stringify(data)
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