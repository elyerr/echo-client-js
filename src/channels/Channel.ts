
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
     * almacena las credenciales de usuario solo en presence y private
     * 
     * @var any
     */
    protected auth: any;

    /**
     * indentificador unico de la sesion
     * 
     */
    protected id: String;

    /**
     * driver por donde escuchara eventos soporta (redis|null)
     * 
     * @var String
     */
    private driver: String;

    /**
     * constructor de la clase 
     * @param auth 
     * @param channel 
     */
    constructor(server: WebSocket, driver: String, channel: String, auth: any, id: String) {
        this.server = server
        this.driver = driver
        this.channel = channel
        this.auth = auth,
            this.id = id
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
            
            if (msg.type == "event" && msg.event == ListenEvent &&
                belongsTo && `${this.mode}-${this.channel}` == msg.channel) {
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
            driver: this.driver,
            host: window.location.hostname,
            type: 'event',
            channel: `${this.mode}-${this.channel}`,
            event: EventName,
            message: msg,
            headers: this.auth,
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
                if (msg.type == "event" && msg.event == ListenEvent &&
                    belongsTo && `${this.mode}-${this.channel}` == msg.channel) {
                    return callback(msg)
                }
            }
        })
        return this
    };
}