
export class Channel {

    /**
     * Name of channel
     * 
     * @var string
     */
    public channel: string;

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
    public mode: string = "public";

    /**
     * Redis prefix of channels
     */
    public prefix: string | null;

    /**
     * Socket id
     */
    public socket_id: string;

    /**
     * Authorization Token 
     * @var string
     */
    public token: string | null;

    /**
     * Constructor
     * @param server 
     * @param socket_id 
     * @param channel 
     * @param token 
     */
    constructor(
        server: WebSocket,
        socket_id: string,
        channel: string,
        prefix: string | null = null,
        token: string | null = null
    ) {
        this.channel = channel;
        this.prefix = prefix;
        this.socket_id = socket_id
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

        let channel = `${this.mode}-${this.channel}`;
        if (this.prefix) {
            channel = `${this.prefix}_${channel}`;
        }

        this.server.addEventListener("message", (listen) => {

            //Decode string data to json
            const msg = JSON.parse(listen.data)

            //Deny access to ping pong and bad events
            if (msg.type !== undefined) {
                return;
            }

            //Listen events
            if (msg.event == ListenEvent && channel == msg.data.channel) {
                return callback(msg)
            }
        });

        return this
    };

    /**
    * Listen the events except for the current user emitted the event
    * @param EventName string
    * @param callback function
    * @return 
    */
    toOthers(ListenEvent: string, callback: Function) {
        let channel = `${this.mode}-${this.channel}`;
        if (this.prefix) {
            channel = `${this.prefix}_${channel}`;
        }

        this.server.addEventListener("message", (listen) => {

            //Decode string data to json
            const msg = JSON.parse(listen.data)

            //Deny access to ping pong and bad events
            if (msg.type !== undefined || msg.socket == this.socket_id) {
                return;
            }

            //Listen events
            if (msg.event == ListenEvent && (channel == msg.data.channel)) {
                return callback(msg)
            }
        });

        return this
    };


    /**
     * Create new event 
     * @param event 
     * @param message 
     */
    event(event: string, message: string) {
        const payload: WebSocketEvent = {
            type: 'events',
            channel: this.channel,
            event: event,
            message: message,
            socket_id: this.socket_id
        };

        if (this.server.readyState === WebSocket.OPEN) {
            this.server.send(JSON.stringify(payload));
        } else {
            this.server.addEventListener('open', () => {
                this.server.send(JSON.stringify(payload));
            }, { once: true });
        }
    }
}