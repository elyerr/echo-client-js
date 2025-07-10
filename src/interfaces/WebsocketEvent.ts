interface WebSocketEvent {
    type: string;
    channel: string;
    event: string;
    message: string;
    socket_id: string;
}