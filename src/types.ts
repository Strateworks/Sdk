/**
 * Callback
 */
export type Callback = (event: any) => void;

/**
 * Events
 */
export type Events = 'broadcast' | 'publish' | 'send' | 'ack';

/**
 * Statuses
 */
export type Statuses = 'success' | 'failed';

/**
 * Statuses
 */
export type Messages = 'ok' | 'no effect' | 'unprocessable entity' | 'pong';

/**
 * Configuration
 */
export interface Configuration {
    /**
     * CA File
     */
    ca_file?: string;

    /**
     * Cert File
     */
    cert_file?: string;

    /**
     * Key File
     */
    key_file?: string;

    /**
     * Passphrase
     */
    passphrase?: string;
}

/**
 * Event
 */
export interface Event {
    /**
     * Transaction ID
     */
    transaction_id: string;

    /**
     * Action
     */
    action: Events;

    /**
     * Status
     */
    status: Statuses;

    /**
     * Message
     */
    message: Messages;

    /**
     * Timestamp
     */
    timestamp: number;

    /**
     * Runtime
     */
    runtime: number;

    /**
     * Data
     */
    data: Object;
}

/**
 * Event Promise
 */
export interface EventPromise {
    /**
     * On Success
     */
    on_success: Function;

    /**
     * On Error
     */
    on_error: Function;
}

/**
 * Welcome Event
 */
export interface WelcomeEvent extends Event {
    /**
     * Data
     */
    data: {
        /**
         * Client ID
         */
        client_id: string;
    };
}

/**
 * Broadcast Event
 */
export interface BroadcastEvent extends Event {
    /**
     * Params
     */
    params: {
        /**
         * Payload
         */
        payload: Object;
    };
}

/**
 * Publish Event
 */
export interface PublishEvent extends Event {
    /**
     * Params
     */
    params: {
        /**
         * Channel
         */
        channel: string;

        /**
         * Payload
         */
        payload: Object;
    };
}

/**
 * Send Event
 */
export interface SendEvent extends Event {
    /**
     * Params
     */
    params: {
        /**
         * From Client ID
         */
        from_client_id: string;

        /**
         * To Client ID
         */
        to_client_id: string;

        /**
         * Payload
         */
        payload: Object;
    };
}
