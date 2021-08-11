import TransportU2F from "@ledgerhq/hw-transport-u2f";
import { createClient } from 'near-ledger-js';

import { WalletError } from './walletError';

async function createLedgerU2FTransport() {
    let transport;
    try {
        transport = await TransportU2F.create();
    } catch (error) {
        if (error.id === 'U2FNotSupported') {
            throw new WalletError(error.message, 'getLedgerAccountIds.U2FNotSupported');
        }
        throw error;
    }
    transport.setScrambleKey("NEAR");
    return transport;
}

async function createLedgerU2FClient() {
    const transport = await createLedgerU2FTransport();
    const client = await createClient(transport);
    return client;
}

export { createLedgerU2FClient };