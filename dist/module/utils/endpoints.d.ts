export interface EndpointValidationOptions {
    /** Allow http:// and ws:// (intended for local development only). */
    allowInsecure?: boolean;
    /** Block localhost and private IP ranges (enabled automatically in Node.js). */
    blockPrivateHosts?: boolean;
}
export declare function validateRpcEndpoint(url: string, options?: EndpointValidationOptions): string;
export declare function validateWsEndpoint(url: string, options?: EndpointValidationOptions): string;
