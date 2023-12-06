import { PrivateChannel } from "./channels/PrivateChannel";
import { PublicChannel } from "./channels/PublicChannel";
import { PresenceChannel } from "./channels/PresenceChannel";
import { v4 as uuidv4 } from 'uuid';
export default class EchoClient {

    /**
     * almacena los datos de conexion y credenciales de usuario
     * 
     * @var any
     */
    private options: any;

    /**
     * Crear una instancia del servidor websocket
     * 
     * @var String
     */
    private server: WebSocket;

    /**
     * indentificador unico del cliente
     * 
     * @var string
     */
    private uuid: String;

    /**
     * URL o endpoint del servidor websockets
     * 
     * @var string
     */
    private endpoint: string;

    /**
     * driver por donde escuchara eventos soporta (redis|null)
     * 
     * @var String
     */
    private driver: String;

    /**
     * constructor principal de la clase
     * 
     * @param options 
     */
    constructor(options: any) {

        this.uuid = uuidv4()

        this.options = JSON.parse(JSON.stringify(options))

        this.driver = this.options.driver ? this.options.driver : null

        const transport = this.options.transport ? this.options.transport : 'wss'
        
        this.endpoint = `${transport}://${this.options.host}:${this.options.port}`

        this.server = new WebSocket(this.endpoint)
    }

    /**
     * acceso a canales publicos
     * 
     * @param channel_name : String
     * @returns 
     */
    channel(channel_name: String) {
        const channel = new PublicChannel(this.server, this.driver, channel_name, null, this.uuid)

        this.server.addEventListener('open', (open) => {
            this.server.send(this.authorize(`${channel.mode}-${channel_name}`))
        })

        if (this.server.readyState == this.server.OPEN) {
            this.server.send(this.authorize(`${channel.mode}-${channel_name}`))
        }

        return channel
    }

    /**
     * Retorna una instancia de un canal privado
     * 
     * @param channel_name 
     * @returns PrivateCannel
     */
    private(channel_name: String) {
        const channel = new PrivateChannel(this.server, this.driver, channel_name, this.options.auth, this.uuid)

        this.server.addEventListener('open', (open) => {
            this.server.send(this.authorize(`${channel.mode}-${channel_name}`))
        })

        if (this.server.readyState == this.server.OPEN) {
            this.server.send(this.authorize(`${channel.mode}-${channel_name}`))
        }
        return channel
    }

    /**
     * Escucha canales de presencia
     * 
     * @param channel_name : String
     * @returns 
     */
    presence(channel_name: string) {
        const channel = new PresenceChannel(this.server, this.driver, channel_name, this.options.auth, this.uuid);

        this.server.addEventListener('open', (open) => {
            this.server.send(this.authorize(`${channel.mode}-${channel_name}`))
        })

        if (this.server.readyState == this.server.OPEN) {
            this.server.send(this.authorize(`${channel.mode}-${channel_name}`))
        }

        return channel
    }

    /**
    * envia informacion relevante al servidor cuando se ingresa por primera vez
    * 
    * @return String
    */
    authorize(channel: String) {
        const data = {
            id: this.uuid,
            type: 'authorize',
            channel: channel,
            headers: this.options.headers ? this.options.headers : null,
            driver: this.driver
        }
        return JSON.stringify(data)
    }

    /**
    * cierra una conexion con el servidor websocket
    * 
    * @return String
    */
    unsubscribe() {

        this.server.send(JSON.stringify({
            type: 'unsubscribe',
            driver: this.driver
        }))

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