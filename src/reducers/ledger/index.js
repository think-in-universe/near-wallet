import { handleActions, combineActions } from 'redux-actions'
import reduceReducers from 'reduce-reducers'

import {
    getLedgerAccountIds,
    addLedgerAccountId,
    saveAndSelectLedgerAccounts,
    refreshAccount,
    sendMoney,
    addAccessKey,
    signAndSendTransactions,
    removeAccessKey,
    addAccessKeySeedPhrase,
    deleteRecoveryMethod,
    setupRecoveryMessage,
    addLedgerAccessKey,
    getLedgerPublicKey,
    connectLedger,
    setLedgerTxSigned,
    createNewAccount,
    clearSignInWithLedgerModalState,
    showLedgerModal
} from '../../actions/account'

import { HIDE_SIGN_IN_WITH_LEDGER_ENTER_ACCOUNT_ID_MODAL } from '../../utils/wallet'

const initialState = {
    modal: {}
}

const ledgerModalReducer = (state, { error, ready, payload, meta, type }) => {
    if (state.modal?.show && type === state.modal?.action && (ready || error)) {
        return {
            ...state,
            modal: undefined,
            txSigned: undefined
        }
    }

    return state
}

const ledger = handleActions({
    [getLedgerAccountIds]: (state, { error, payload, ready }) => {
        if (error) {
            return {
                ...state,
                signInWithLedgerStatus: (payload.messageCode === 'signInLedger.getLedgerAccountIds.noAccounts' && !HIDE_SIGN_IN_WITH_LEDGER_ENTER_ACCOUNT_ID_MODAL) ? 'enter-accountId' : undefined,
                signInWithLedger: undefined,
                txSigned: undefined
            }
        }

        return {
            ...state,
            signInWithLedgerStatus: !ready ? 'confirm-public-key' : 'confirm-accounts',
            signInWithLedger: payload 
                ? payload.reduce((r, accountId) => ({
                    ...r,
                    [accountId]: {
                        status: 'waiting'
                    }
                }), {})
                : {}
        }
    },
    [addLedgerAccountId]: (state, { error, ready, meta }) => {
        if (error) {
            return {
                ...state,
                signInWithLedgerStatus: undefined,
                signInWithLedger: undefined,
                txSigned: undefined
            }
        }

        return {
            ...state,
            signInWithLedgerStatus: 'confirm-accounts',
            signInWithLedger: {
                ...state.signInWithLedger,
                [meta.accountId]: {
                    status: ready ? 'success' : 'confirm'
                }
            }
        }
    },
    [saveAndSelectLedgerAccounts]: (state, { error, ready }) => {
        if (error) {
            return {
                ...state,
                signInWithLedgerStatus: undefined,
                signInWithLedger: undefined
            }
        }

        return ready 
            ? {
                ...state,
                signInWithLedgerStatus: ready ? undefined : state.signInWithLedgerStatus,
                signInWithLedger: undefined
            }
            : state
    },
    [refreshAccount]: (state, { payload }) => {
        return {
            ...state,
            ...(payload && payload.ledger)
        }
    },
    [setLedgerTxSigned]: (state, { payload, meta }) => {
        const signInWithLedger = (meta.accountId && Object.keys(state.signInWithLedger || {}).length )
            ? {
                ...state.signInWithLedger,
                [meta.accountId]: {
                    status: (state.signInWithLedger[meta.accountId].status === 'confirm' && payload.status)
                        ? 'pending'
                        : state.signInWithLedger[meta.accountId].status
                }
            }
            : undefined

        return {
            ...state,
            txSigned: payload.status,
            signInWithLedger
        }
    },
    [clearSignInWithLedgerModalState]: (state, { payload, meta }) => {
        return {
            ...state,
            txSigned: undefined,
            signInWithLedgerStatus: undefined,
            signInWithLedger: undefined
        }
    },
    [showLedgerModal]: (state, { payload }) => {
        return {
            ...state,
            modal: {
                ...state.modal,
                show: !state.signInWithLedgerStatus && payload.show,
                action: payload.action,
                textId: `ledgerSignTxModal.${payload.action}`
            }
        }
    },
}, initialState)

export default reduceReducers(
    initialState,
    ledger,
    ledgerModalReducer
)
