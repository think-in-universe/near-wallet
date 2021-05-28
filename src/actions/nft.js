import { createActions } from 'redux-actions'
import { wallet } from '../utils/wallet'
import { Account } from 'near-api-js'

export const handleGetTokens = () => async (dispatch, getState) => {
    const { account: { accountId } } = getState()

    const likelyContracts = await dispatch(tokens.likelyContracts.get(accountId))

    // TODO: Should this happen in likelyContracts.get reducer?
    let contracts = getState().tokens.likelyContracts.reduce((x, contract) => ({
        ...x,
        [contract]: { contract }
    }), {})

    // TODO: Does this even need to await for the whole thing?
    await Promise.all(Object.keys(contracts).map(async contract => {
        await dispatch(tokens.tokensDetails.getMetadata(contract))
    }))

    Object.keys(contracts).map(async contract => {
        await dispatch(tokens.tokensDetails.getTokens(contract, accountId))
    })
}

// TODO: Decide where to ignore and where to bubble up errors
// TODO: Maybe errors should be stored per token in Redux state?
async function getLikelyContracts() {
    return await sendJson('GET', `${ACCOUNT_HELPER_URL}/account/${accountId}/likelyNFTs`)
}

async function getMetadata(contract) {
    const account = new Account(wallet.connection, accountId)
    return await account.viewFunction(contract, 'nft_metadata')
}

async function getTokens(contract, accountId) {
    const account = new Account(wallet.connection, accountId)
    const tokenIds = await account.viewFunction(contract, 'nft_tokens_for_owner_set', { account_id: accountId })
    const tokens = await Promise.all(tokenIds.map(async token_id => {
        const { media, reference }  = await account.viewFunction(contract, 'nft_token_metadata', { token_id })
        // TODO: Need to know base URI to fetch media by reference if needed
    }));
}

export const { tokens } = createActions({
    NFT: {
        LIKELY_CONTRACTS: {
            GET: getLikelyContracts,
        },
        TOKENS_DETAILS: {
            GET_METADATA: getMetadata,
            GET_TOKENS: getTokens,
        },
    }
})