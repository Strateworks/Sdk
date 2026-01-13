import WebSocket from 'isomorphic-ws';
import fs from 'fs';
import https from 'https';
import { Client } from './client';
import { Callback, Configuration, Event, EventPromise, PublishEvent, WelcomeEvent } from './types';

/**
 * Sdk
 */
export class Sdk {
    /**
     * Connect
     *
     * @param url The URL of the server
     * @param configuration The Configuration used on client
     */
    async connect(url: string, configuration: Configuration = {}) {
        return new Promise<Client>((resolve, reject) => {
            const agent = new https.Agent({
                ca: fs.readFileSync(configuration.ca_file ?? 'ca.crt'),
                cert: fs.readFileSync(configuration.cert_file ?? 'client.crt'),
                key: fs.readFileSync(configuration.key_file ?? 'client.key'),
                rejectUnauthorized: true,
                passphrase: configuration.passphrase ?? 'd96ab300',
                checkServerIdentity: (a, b) => undefined
            });

            const ws = new WebSocket(url, {
                agent,
            });
            const client = new Client(ws);
            client.ws.onerror = reject;
            client.ws.onopen = () => {};
            client.ws.onmessage = (message: MessageEvent) => {
                const welcome = JSON.parse(message.data) as WelcomeEvent;
                client.id = welcome.data.client_id;

                client.ws.onmessage = (message: MessageEvent) => {
                    const event = JSON.parse(message.data) as Event;

                    switch (event.action) {
                        case 'ack':
                            if (client.promises.has(event.transaction_id)) {
                                const transaction = client.promises.get(
                                    event.transaction_id
                                ) as EventPromise;
                                if (event.status == 'success') {
                                    transaction.on_success(event);
                                } else {
                                    transaction.on_error(event);
                                }
                            }

                            if (client.handlers.has('ack')) {
                                const handler = client.handlers.get('ack') as Callback;
                                handler(event);
                            }
                            break;

                        case 'broadcast':
                            if (client.handlers.has('broadcast')) {
                                const handler = client.handlers.get('broadcast') as Callback;
                                handler(event);
                            }
                            break;

                        case 'send':
                            if (client.handlers.has('send')) {
                                const handler = client.handlers.get('send') as Callback;
                                handler(event);
                            }
                            break;

                        case 'publish':
                            if (client.handlers.has('publish')) {
                                const handler = client.handlers.get('publish') as Callback;
                                handler(event);
                            }

                            const publish = event as PublishEvent;

                            if (client.channels.has(publish.params.channel)) {
                                const handler = client.channels.get(
                                    publish.params.channel
                                ) as Callback;
                                handler(event);
                            }

                            break;
                    }
                };
                resolve(client);
            };
        });
    }
}
