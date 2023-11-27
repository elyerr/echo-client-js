
export class Channel {

    /**
     * nombre del canal 
     * @var String
     */
    protected channel: String;

    /**
     * instacia de websokets
     * @var WebSocket
     */

    protected server: WebSocket;

    /**
     * tipo del tipo del canal
     * @var String
     */
    public mode: String = 'public';


    /**
     * nombre de la clase
     * @var String
     */
    public class_name = Channel.name

    /**
     * almacena las credenciales de usuario solo en presence y private
     * @var any
     */
    protected auth: any;

    /**
     * indentificador unico de la sesion
     */
    protected id: String;

    /**
     * constructor de la clase 
     * @param auth 
     * @param channel 
     */
    constructor(server: WebSocket, channel: String, auth: any, id: String) {
        this.server = server
        this.channel = channel
        this.auth = auth,
            this.id = id
    }

    /**
     * Escucha los eventos correspondientes a cada clase
     * 
     * @param EventName String
     * @param callback funcion
     * @return 
     */
    listen(ListenEvent: String, callback: Function) {

        const event = ListenEvent

        const belongsTo = this.class_name.toLowerCase().replace('channel', '') == this.mode;

        this.server.addEventListener("message", (listen) => {

            const msg = JSON.parse(listen.data)

            if (msg.action == "subscribe" && msg.event == ListenEvent && belongsTo) {
                return callback(msg)
            } else if (msg.action == "event" && msg.event == ListenEvent && belongsTo) {
                return callback(msg)
            } else if (msg.action == "unsubscribe" && msg.event == ListenEvent && belongsTo) {
                return callback(msg)
            }
        })

        return this
    };


    /**
     * Emite un evento 
     * @param EventName : String
     */
    event(EventName: String, msg: String, id: string) {
        const data = {
            id: id ? id : this.id,
            host: window.location.hostname,
            action: 'event',
            channel: this.channel,
            event: EventName,
            message: msg,
            auth: this.mode == 'public' ? null : this.auth
        }

        this.server.send(JSON.stringify(data))
    }

    /**
    * Escucha los eventos correspondientes a todos los usuarios
    * excpto al envento que el emite
    * 
    * @param EventName String
    * @param callback funcion
    * @return 
    */
    toOthers(ListenEvent: String, callback: Function) {

        const event = ListenEvent

        const belongsTo = this.class_name.toLowerCase().replace('channel', '') == this.mode;

        this.server.addEventListener("message", (listen) => {

            const msg = JSON.parse(listen.data)
            if (msg.id != this.id) {

                if (msg.action == "subscribe" && msg.event == ListenEvent && belongsTo) {
                    return callback(msg)
                } else if (msg.action == "event" && msg.event == ListenEvent && belongsTo) {
                    return callback(msg)
                } else if (msg.action == "unsubscribe" && msg.event == ListenEvent && belongsTo) {
                    return callback(msg)
                }
            }
        })

        return this
    };
}