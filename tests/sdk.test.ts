import { describe, it, expect } from 'vitest';
import { Sdk } from '../src';

describe('sdk', async () => {
    it('can create connections', async () => {
        const sdk = new Sdk();
        const client = await sdk.connect('wss://instance:12000');

        expect(client.ws.readyState).toBe(WebSocket.OPEN);

        await new Promise<void>((resolve, reject) => {
            client.ws.onclose = () => resolve();
            client.ws.onerror = reject;
            client.ws.close();
        });

        expect(client.ws.readyState).toBe(WebSocket.CLOSED);
        expect(client.id).toBeDefined();
        client.ws.close();
    });
});
