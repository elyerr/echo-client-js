import { PrivateChannel } from "./channels/PrivateChannel";
import { PublicChannel } from "./channels/PublicChannel";
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
     * URL o endpoint del servidor websockets
     * 
     * @var string
     */
    private endpoint: string;


    /**
     * Authorization token
     * @var String
     */
    private token: String;

    /**
     * constructor principal de la clase
     * 
     * @param options 
     */
    constructor(options: any) {

        this.options = JSON.parse(JSON.stringify(options))

        const transport = this.options.transport ? this.options.transport : 'wss'
        this.endpoint = `${transport}://${this.options.host}:${this.options.port}`
        this.token = this.options.token ? this.options.token : null

        this.server = new WebSocket(this.endpoint)

        this.server.addEventListener('open', (open) => {
            this.ping()
        })
        //reconnecting 
        this.server.addEventListener('close', (open) => {
            setInterval(() => {
                this.server = new WebSocket(this.endpoint)
                this.server.addEventListener('open', (open) => {
                    location.reload()
                })
            }, 5000)
        })
    }

    /**
     * acceso a canales publicos
     * 
     * @param channel_name : String
     * @returns 
     */
    channel(channel_name: String) {
        const channel = new PublicChannel(this.server, channel_name, uuidv4(), "")

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
        const channel = new PrivateChannel(this.server, channel_name, uuidv4(), this.token)

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
            id: uuidv4(),
            event: 'connected',
            channel: channel,
            message: "new device connected",
            token: this.token
        }
        return JSON.stringify(data)
    }

    /**
    * cierra una conexion con el servidor websocket
    * 
    * @return String
    */
    unsubscribe(channel: String) {

        this.server.send(JSON.stringify({
            id: uuidv4(),
            event: 'disconnected',
            channel: channel,
            message: "device disconnected",
            token: this.token
        }))

        this.server.close(1000, 'The client has finished connection')
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
     * verifica la conexion cada 5 segundos
     */
    ping() {
        const socket = this.server
        const data = {
            type: 'ping',
        }
        setInterval(function () {
            socket.send(JSON.stringify(data))
        }, 5000)
    }
}