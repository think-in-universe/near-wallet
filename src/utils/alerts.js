import { store } from '..';
import { clearGlobalAlert, clearLocalAlert } from '../actions/status';

export const showAlert = ({ data, onlyError, onlySuccess, console = true, localAlert, messageCodeHeader, success } = {}) => ({
    alert: {
        showAlert: localAlert ? false : true,
        onlyError: onlySuccess ? false : true,
        onlySuccess: onlyError ? false : true,
        console,
        localAlert,
        messageCodeHeader,
        success
    },
    data
});

export const dispatchWithAlert = (action, data) => store.dispatch({
    ...action,
    meta: {
        ...action.meta,
        ...showAlert(data)
    }
});

export const actionsPending = (types) => (typeof types === 'string' ? [types] : types).some((type) => store.getState().status?.actionStatus[type]?.pending);

export const actionsPendingByPrefix = (typePrefix) => {
    const { actionStatus = {} } = store.getState().status;

    return Object.keys(actionStatus).some((type) => {
        if (type.startsWith(typePrefix)) {
            return actionStatus[type]?.pending;
        }
        return false;
    });
};

export const handleClearAlert = () => {
    const { dispatch, getState } = store;
    const { account, router } = getState();

    if (!router.location.state?.globalAlertPreventClear && !account.globalAlertPreventClear) {
        dispatch(clearGlobalAlert());
    }
    dispatch(clearLocalAlert());
};
