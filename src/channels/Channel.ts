
export class Channel {

    /**
     * nombre del canal 
     * 
     * @var String
     */
    protected channel: String;

    /**
     * instacia de websokets
     * 
     * @var WebSocket
     */

    protected server: WebSocket;

    /**
     * tipo del tipo del canal
     * 
     * @var String
     */
    public mode: String = 'public';


    /**
     * nombre de la clase
     * 
     * @var String
     */
    public class_name = Channel.name

    /**
     * almacena el token
     * @var String
     */
    public token: String;

    /**
     * indentificador unico de la sesion
     * 
     */
    protected id: String;


    /**
     * constructor de la clase 
     * @param auth 
     * @param channel 
     */
    constructor(server: WebSocket, channel: String, id: String, token: String) {
        this.id = id
        this.channel = channel
        this.server = server
        this.token = token
    }

    /**
     * Escucha los eventos correspondientes a cada clase emitiendolos a todos 
     * los que estan suscritos a ese canal y escuchando dicho evento
     * 
     * @param EventName String
     * @param callback funcion
     * @return 
     */
    listen(ListenEvent: String, callback: Function) {
        //verifica si el canal que evento pertenezca a un canal
        const channel = this.class_name.toLowerCase().replace('channel', '')
        const belongsTo = (channel == this.mode);

        //escucha eventos entrantes
        this.server.addEventListener("message", (listen) => {

            const msg = JSON.parse(listen.data)
            if (msg.event == ListenEvent && belongsTo && `${this.mode}-${this.channel}` == msg.channel) {
                return callback(msg)
            }
        })

        return this
    };

    /**
     * Emite un evento directamente desde js
     * 
     * @param EventName : String
     */
    event(EventName: String, msg: String, id: string) {
        const data = {
            id: id ? id : this.id,
            event: EventName,
            channel: `${this.mode}-${this.channel}`,
            message: msg,
            token: this.token
        }

        this.server.send(JSON.stringify(data))
    }

    /**
    * Escucha los eventos correspondientes a todos los usuarios emitiendo a todos
    * excepto al cliente que emitio el evento
    * 
    * @param EventName String
    * @param callback funcion
    * @return 
    */
    toOthers(ListenEvent: String, callback: Function) {

        const channel = this.class_name.toLowerCase().replace('channel', '')
        const belongsTo = (channel == this.mode);

        this.server.addEventListener("message", (listen) => {

            const msg = JSON.parse(listen.data)
            if (msg.id != this.id) {
                if (msg.event == ListenEvent && belongsTo && `${this.mode}-${this.channel}` == msg.channel) {
                    return callback(msg)
                }
            }
        })
        return this
    };
}