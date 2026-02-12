const usedTxIds = new Set<string>();

export const replayProtection = {
    add: (txId: string) => usedTxIds.add(txId),
    has: (txId: string) => usedTxIds.has(txId),
};
