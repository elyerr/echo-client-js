import { PrivateChannel } from "./channels/PrivateChannel";
import { PublicChannel } from "./channels/PublicChannel";
import { v4 as uuidv4 } from "uuid";
import EchoOptions from "./interfaces/EchoOptions";

export default class EchoClient {
    /**
     * Configuration options for WebSocket connection
     *
     * @var EchoOptions
     */
    private options: EchoOptions;

    /**
     * WebSocket server connection instance
     *
     * @var WebSocket
     */
    private server: WebSocket;

    /**
     * URI of the WebSocket server
     *
     * @var string
     */
    private endpoint: string;

    /**
     * @var boolean
     */
    private reload: boolean;

    /**
     * Socket id
     */
    public socket_id: string;

    /**
     * Constructor to initialize the EchoClient instance and establish WebSocket connection
     *
     * @param options Configuration options for the WebSocket connection
     */
    constructor(options: any) {
        this.socket_id = uuidv4();

        // Deep clone the options object to avoid any mutation
        this.options = JSON.parse(JSON.stringify(options));

        this.reload = this.options.reload ?? true;

        // Determine the transport type (either 'wss' or custom)
        const transport = this.options.transport ? this.options.transport : "wss";

        // Construct the WebSocket endpoint using transport, host, and port
        this.endpoint = `${transport}://${this.options.host}:${this.options.port}`;

        // Create a new WebSocket instance with the provided endpoint
        this.server = new WebSocket(this.endpoint);

        // When the WebSocket connection opens, ping the server to keep it alive
        this.server.addEventListener("open", (open) => {
            this.ping();
        });

        // Handle reconnection when the server closes the connection
        this.server.addEventListener("close", (open) => {             
            if (this.reload) {
                setInterval(() => {
                    // Recreate the WebSocket instance to reconnect
                    this.server = new WebSocket(this.endpoint);
                    this.server.addEventListener("open", (open) => {
                        // Reload the page when the connection opens
                        location.reload();
                    });
                }, 10000);
            }
        });
    }

    /**
     * Access a public channel by its name
     *
     * @param channel_name The name of the public channel
     * @returns PublicChannel
     */
    channel(channel_name: string, prefix: string | null = null) {
        const channel = new PublicChannel(
            this.server,
            this.socket_id,
            channel_name,
            prefix
        );

        this.server.addEventListener("open", (open) => {
            this.server.send(this.authorize(`${channel.mode}-${channel_name}`));
        });

        return channel;
    }

    /**
     * Access a private channel by its name
     *
     * @param channel_name The name of the private channel
     * @returns PrivateChannel
     */
    private(channel_name: string, prefix: string | null = null) {
        const channel = new PrivateChannel(
            this.server,
            this.socket_id,
            channel_name,
            prefix
        );

        this.server.addEventListener("open", (open) => {
            this.server.send(this.authorize(`${channel.mode}-${channel_name}`));
        });
        return channel;
    }

    /**
     * Sends relevant information to the server when connecting for the first time
     *
     * @param channel The channel to be authorized
     * @returns string The authorization data in JSON format
     */
    authorize(channel: string) {
        const data = {
            type: "listen",
            channel: channel,
            socket_id: this.socket_id,
        };
        return JSON.stringify(data);
    }

    /**
     * Pings the server every 5 seconds to keep the connection alive
     */
    ping() {
        const socket = this.server;
        const data = {
            type: "ping",
        };
        setInterval(function () {
            socket.send(JSON.stringify(data));
        }, 5000);
    }
}
