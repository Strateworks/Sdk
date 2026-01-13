import { Callback, Events, Event, EventPromise } from './types';
import { v4 } from 'uuid';
import WebSocket from 'isomorphic-ws';

/**
 * Client
 */
export class Client {
    /**
     * WebSocket instance
     */
    public ws: WebSocket;

    /**
     * Client ID
     */
    public id?: string;

    /**
     * Promises
     */
    public promises = new Map<string, EventPromise>();

    /**
     * Channels
     */
    public channels = new Map<string, Callback>();

    /**
     * Handlers
     */
    public handlers = new Map<Events, Callback>();

    /**
     * Constructor
     *
     * @param ws The Websocket instance
     */
    constructor(ws: WebSocket) {
        this.ws = ws;
    }

    /**
     * Subscribe
     *
     * @param channel The channel that will be subscribed
     * @param callback The handler that will be called on channel message
     */
    async subscribe(channel: string, callback: Callback): Promise<Event> {
        return new Promise((resolve, reject) => {
            const transaction_id = v4();

            this.channels.set(channel, callback);

            this.promises.set(transaction_id, {
                on_success: resolve,
                on_error: reject,
            });

            this.ws.send(
                JSON.stringify({
                    transaction_id: transaction_id,
                    action: 'subscribe',
                    params: {
                        channel: channel,
                    },
                })
            );
        });
    }

    /**
     * Unsubscribe
     *
     * @param channel The channel that will be unsubscribed
     */
    async unsubscribe(channel: string): Promise<Event> {
        return new Promise((resolve, reject) => {
            const transaction_id = v4();

            this.channels.delete(channel);

            this.promises.set(transaction_id, {
                on_success: resolve,
                on_error: reject,
            });

            this.ws.send(
                JSON.stringify({
                    transaction_id: transaction_id,
                    action: 'unsubscribe',
                    params: {
                        channel: channel,
                    },
                })
            );
        });
    }

    /**
     * Publish
     *
     * @param channel The channel that will be used
     * @param payload The payload that will be sent
     */
    async publish(channel: string, payload: Object): Promise<Event> {
        return new Promise((resolve, reject) => {
            const transaction_id = v4();

            this.promises.set(transaction_id, {
                on_success: resolve,
                on_error: reject,
            });

            this.ws.send(
                JSON.stringify({
                    transaction_id: transaction_id,
                    action: 'publish',
                    params: {
                        channel: channel,
                        payload: payload,
                    },
                })
            );
        });
    }

    /**
     * Send
     *
     * @param client_id The client id that will be used
     * @param payload The payload that will be sent
     */
    async send(client_id: string, payload: Object): Promise<Event> {
        return new Promise((resolve, reject) => {
            const transaction_id = v4();

            this.promises.set(transaction_id, {
                on_success: resolve,
                on_error: reject,
            });

            this.ws.send(
                JSON.stringify({
                    transaction_id: transaction_id,
                    action: 'send',
                    params: {
                        to_client_id: client_id,
                        payload: payload,
                    },
                })
            );
        });
    }

    /**
     * Broadcast
     *
     * @param payload The payload that will be broadcast
     */
    async broadcast(payload: Object): Promise<Event> {
        return new Promise((resolve, reject) => {
            const transaction_id = v4();

            this.promises.set(transaction_id, {
                on_success: resolve,
                on_error: reject,
            });

            this.ws.send(
                JSON.stringify({
                    transaction_id: transaction_id,
                    action: 'broadcast',
                    params: {
                        payload: payload,
                    },
                })
            );
        });
    }

    /**
     * On
     *
     * @param event The event that will be used
     * @param callback The callback that will be called on event
     */
    on(event: Events, callback: Callback) {
        this.handlers.set(event, callback);
    }
}
