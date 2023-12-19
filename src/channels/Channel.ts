
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
    public class_name = "PublicChannel"

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
     * Escucha los eventos correspondientes a cada clase emitiendolos a todos 
     * los que estan suscritos a ese canal y escuchando dicho evento
     * 
     * @param EventName String
     * @param callback funcion
     * @return 
     */
    listen(ListenEvent: String, callback: Function) {
        //verifica si el canal que evento pertenezca a un canal
        const channel = `${this.mode}-${this.channel}`
        const belongsTo = (this.class_name.toLowerCase().replace('channel', '') == this.mode);
         
        //escucha eventos entrantes
        this.server.addEventListener("message", function(event){            
            const msg = JSON.parse(event.data)

            if (msg.type == "event" && msg.event == ListenEvent &&
                belongsTo && channel == msg.channel) {
                return callback(msg)
            }
        })

        return this
    };

    /**
     * Emite un evento directamente desde js
     * 
     * @param EventName : String
     * @param msg : String
     * @param id : String
     */
    event(EventName: String, msg: String, id: string) {
        const data = {
            id: id ? id : this.id, 
            type: 'event',
            channel: `${this.mode}-${this.channel}`,
            event: EventName,
            data: msg,
            headers: this.auth,
        }

        this.server.send(JSON.stringify(data))
    }
}