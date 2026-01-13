import { describe, it, expect } from 'vitest';
import { Sdk } from '../src';
import { BroadcastEvent, PublishEvent, SendEvent } from '../src';

function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

describe('client', async () => {
    it('can broadcast events', async () => {
        const sdk = new Sdk();
        const client_a = await sdk.connect('wss://instance:12000');
        const client_b = await sdk.connect('wss://instance:12000');

        let check = false;

        client_a.on('broadcast', (event: BroadcastEvent) => {
            expect(event.params.payload.hasOwnProperty('message')).toBe(true);
            const payload = event.params.payload as { message: string };
            expect(payload.message).toBe('EHLO');

            check = true;
        });

        await client_b.broadcast({
            message: 'EHLO',
        });

        await wait(300);

        expect(check).toBeTruthy();
        client_a.ws.close();
        client_b.ws.close();
    });

    it('can send events', async () => {
        const sdk = new Sdk();
        const client_a = await sdk.connect('wss://instance:12000');
        const client_b = await sdk.connect('wss://instance:12000');

        let check = false;

        client_b.on('send', (event: SendEvent) => {
            expect(event.params.from_client_id).toBe(client_a.id);
            expect(event.params.to_client_id).toBe(client_b.id);
            expect(event.params.payload.hasOwnProperty('message')).toBe(true);
            const payload = event.params.payload as { message: string };
            expect(payload.message).toBe('EHLO');
            check = true;
        });

        await client_a.send(client_b.id as string, {
            message: 'EHLO',
        });

        await wait(100);

        expect(check).toBeTruthy();
        client_a.ws.close();
        client_b.ws.close();
    });

    it('can publish events', async () => {
        const sdk = new Sdk();
        const client_a = await sdk.connect('wss://instance:12000');
        const client_b = await sdk.connect('wss://instance:12000');

        let check = false;

        await client_a.subscribe('welcome', (event: PublishEvent) => {
            expect(event.params.payload.hasOwnProperty('message')).toBe(true);
            const payload = event.params.payload as { message: string };
            expect(payload.message).toBe('EHLO');
            check = true;
        });

        await client_b.publish('welcome', {
            message: 'EHLO',
        });

        await wait(100);

        await client_a.unsubscribe('welcome');

        await wait(100);

        expect(check).toBeTruthy();

        client_a.ws.close();
        client_b.ws.close();
    });

    it('can callback on ack', async () => {
        const sdk = new Sdk();
        const client = await sdk.connect('wss://instance:12000');

        let check = false;

        client.on('ack', (event: Event) => {
            check = true;
        });

        await client.broadcast({
            message: 'EHLO',
        });

        await wait(300);

        expect(check).toBeTruthy();
        client.ws.close();
    });

    it('can callback on publish', async () => {
        const sdk = new Sdk();
        const client_a = await sdk.connect('wss://instance:12000');
        const client_b = await sdk.connect('wss://instance:12000');

        let check = false;

        await client_a.subscribe('callback_on_publish', () => {});

        client_a.on('publish', (event: PublishEvent) => {
            check = true;
        });

        await client_b.publish('callback_on_publish', {
            message: 'EHLO',
        });

        await wait(300);

        expect(check).toBeTruthy();
        client_a.ws.close();
        client_b.ws.close();
    });
});
