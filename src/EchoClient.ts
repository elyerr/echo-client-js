import { PrivateChannel } from "./channels/PrivateChannel";
import { PublicChannel } from "./channels/PublicChannel";
import { v4 as uuidv4 } from 'uuid';
import EchoOptions from "./interfaces/EchoOptions"

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
     * Authorization token for authentication
     * 
     * @var string
     */
    private token: string | null;

    /**
     * Constructor to initialize the EchoClient instance and establish WebSocket connection
     * 
     * @param options Configuration options for the WebSocket connection
     */
    constructor(options: any) {

        // Deep clone the options object to avoid any mutation
        this.options = JSON.parse(JSON.stringify(options));

        // Determine the transport type (either 'wss' or custom)
        const transport = this.options.transport ? this.options.transport : 'wss';

        // Construct the WebSocket endpoint using transport, host, and port
        this.endpoint = `${transport}://${this.options.host}:${this.options.port}`;

        // Set the token for authorization, defaulting to null if not provided
        this.token = this.options.token ? this.options.token : null;

        // Create a new WebSocket instance with the provided endpoint
        this.server = new WebSocket(this.endpoint);

        // When the WebSocket connection opens, ping the server to keep it alive
        this.server.addEventListener('open', (open) => {
            this.ping();
        });

        // Handle reconnection when the server closes the connection
        this.server.addEventListener('close', (open) => {
            setInterval(() => {
                // Recreate the WebSocket instance to reconnect
                this.server = new WebSocket(this.endpoint);
                this.server.addEventListener('open', (open) => {
                    // Reload the page when the connection opens
                    location.reload();
                });
            }, 5000);
        });
    }

    /**
     * Access a public channel by its name
     * 
     * @param channel_name The name of the public channel
     * @returns PublicChannel
     */
    channel(channel_name: string) {
        const channel = new PublicChannel(this.server, channel_name, uuidv4(), "");

        // Send authorization data when the connection opens
        this.server.addEventListener('open', (open) => {
            this.server.send(this.authorize(`${channel.mode}-${channel_name}`));
        });

        // If the connection is already open, send authorization immediately
        if (this.server.readyState == this.server.OPEN) {
            this.server.send(this.authorize(`${channel.mode}-${channel_name}`));
        }

        return channel;
    }

    /**
     * Access a private channel by its name
     * 
     * @param channel_name The name of the private channel
     * @returns PrivateChannel
     */
    private(channel_name: string) {
        const channel = new PrivateChannel(this.server, channel_name, uuidv4(), this.token);

        // Send authorization data when the connection opens
        this.server.addEventListener('open', (open) => {
            this.server.send(this.authorize(`${channel.mode}-${channel_name}`));
        });

        // If the connection is already open, send authorization immediately
        if (this.server.readyState == this.server.OPEN) {
            this.server.send(this.authorize(`${channel.mode}-${channel_name}`));
        }

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
            id: uuidv4(),
            event: 'connected',
            channel: channel,
            message: "new device connected",
            token: this.token
        };
        return JSON.stringify(data);
    }

    /**
     * Closes the WebSocket connection and sends a disconnection message
     * 
     * @param channel The channel to be unsubscribed from
     */
    unsubscribe(channel: string) {

        // Send a disconnection message to the server
        this.server.send(JSON.stringify({
            id: uuidv4(),
            event: 'disconnected',
            channel: channel,
            message: "device disconnected",
            token: this.token
        }));

        // Close the WebSocket connection with a normal closure status code
        this.server.close(1000, 'The client has finished connection');
    }

    /**
     * Listens for the 'close' event when the WebSocket connection is closed
     * 
     * @param callback The callback function to be executed when the connection is closed
     */
    closed(callback: Function) {
        this.server.addEventListener('close', (close) => {
            return callback(close);
        });
    }

    /**
     * Listens for the 'error' event when an error occurs with the WebSocket server
     * 
     * @param callback The callback function to be executed when an error occurs
     */
    error(callback: Function) {
        this.server.addEventListener('error', (error) => {
            return callback(error);
        });
    }

    /**
     * Pings the server every 5 seconds to keep the connection alive
     */
    ping() {
        const socket = this.server;
        const data = {
            type: 'ping',
        };
        setInterval(function () {
            socket.send(JSON.stringify(data));
        }, 5000);
    }
}
