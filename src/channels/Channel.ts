
export class Channel {

    /**
     * Name of channel
     * 
     * @var string
     */
    protected channel: string;

    /**
     * Websocket instance
     * 
     * @var WebSocket
     */

    protected server: WebSocket;

    /**
     * Channel type 
     * 
     * @var string
     */
    public mode: string = 'public';


    /**
     * Class Name
     * 
     * @var string
     */
    public class_name = Channel.name

    /**
     * Authorization Token 
     * @var string
     */
    public token: string | null;

    /**
     * Unique identifier for current connection
     * 
     */
    protected id: string;


    /**
     * Constructor
     * @param auth 
     * @param channel 
     * @param id
     * @param token
     */
    constructor(server: WebSocket, channel: string, id: string, token: string | null) {
        this.id = id
        this.channel = channel
        this.server = server
        this.token = token
    } 

    /**
     * Listening the events for the channel
     * 
     * @param EventName noma of event
     * @param callback function
     * @return 
     */
    listen(ListenEvent: string, callback: Function) {
        const channel = this.class_name.toLowerCase().replace('channel', '')
        const belongsTo = (channel == this.mode);

        this.server.addEventListener("message", (listen) => {

            const msg = JSON.parse(listen.data)
            if (msg.event == ListenEvent && belongsTo && `${this.mode}-${this.channel}` == msg.channel) {
                return callback(msg)
            }
        });
        return this
    };

    /**
     * Emit the event from js
     * 
     * @param EventName event name to emit
     */
    event(EventName: string, msg: string, id: string) {
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
    * Listen the events except for the current user emitted the event
    * @param EventName string
    * @param callback function
    * @return 
    */
    toOthers(ListenEvent: string, callback: Function) {

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