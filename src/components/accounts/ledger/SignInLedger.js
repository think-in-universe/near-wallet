import React, { useState } from 'react';
import { Translate } from 'react-localize-redux';
import { useSelector, useDispatch } from 'react-redux';

import { 
    signInWithLedger, 
    redirectToApp,
    redirectTo,
    refreshAccount, 
    signInWithLedgerAddAndSaveAccounts, 
    checkAccountAvailable, 
    clearSignInWithLedgerModalState,
    clearAccountState
} from '../../../actions/account';
import { clearLocalAlert } from '../../../actions/status';
import { Mixpanel } from '../../../mixpanel/index';
import { controller as controllerHelperApi } from '../../../utils/helper-api';
import parseFundingOptions from '../../../utils/parseFundingOptions';
import FormButton from '../../common/FormButton';
import LocalAlertBox from '../../common/LocalAlertBox';
import Container from '../../common/styled/Container.css';
import LedgerImage from '../../svg/LedgerImage';
import LedgerHdPaths from './LedgerHdPaths';
import LedgerSignInModal from './LedgerSignInModal';

export function SignInLedger(props) {
    const dispatch = useDispatch();

    const [accountId, setAccountId] = useState('');
    const [loader, setLoader] = useState(false);
    const [path, setPath] = useState(1);
    const [confirmedPath, setConfirmedPath] = useState(null);
    const ledgerHdPath = confirmedPath ? `44'/397'/0'/0'/${confirmedPath}'` : null;

    const account = useSelector(({ account }) => account);
    const status = useSelector(({ status }) => status);
    const { signInWithLedger: signInWithLedgerState, txSigned, signInWithLedgerStatus} = useSelector(({ ledger }) => ledger);
    
    const signInWithLedgerKeys = Object.keys(signInWithLedgerState || {});

    const ledgerAccounts = signInWithLedgerKeys.map((accountId) => ({
        accountId,
        status: signInWithLedgerState[accountId].status
    }));
    
    const accountsApproved = signInWithLedgerKeys.reduce((a, accountId) => signInWithLedgerState[accountId].status === 'success' ? a + 1 : a, 0);
    const accountsError = signInWithLedgerKeys.reduce((a, accountId) => signInWithLedgerState[accountId].status === 'error' ? a + 1 : a, 0);
    const accountsRejected = signInWithLedgerKeys.reduce((a, accountId) => signInWithLedgerState[accountId].status === 'rejected' ? a + 1 : a, 0);
    const totalAccounts = signInWithLedgerKeys.length;
    
    const signingIn = !!signInWithLedgerStatus;

    const handleChange = (value) => {
        setAccountId(value);
    };

    const handleSignIn = async () => {
        setLoader(false);
        await Mixpanel.withTracking("IE-Ledger Sign in",
            async () =>{
                await dispatch(signInWithLedger(ledgerHdPath));
                refreshAndRedirect();
            }
        );
    };

    const handleAdditionalAccountId = async () => {
        setLoader(true);
        await Mixpanel.withTracking("IE-Ledger Handle additional accountId",
            async () =>{
                await dispatch(signInWithLedgerAddAndSaveAccounts([accountId], ledgerHdPath));
                setLoader(false);
                refreshAndRedirect();
            }
        );
    };

    const refreshAndRedirect = () => {
        const options = parseFundingOptions(props.history.location.search);
        dispatch(refreshAccount());
        if (options) {
            dispatch(redirectTo(`/linkdrop/${options.fundingContract}/${options.fundingKey}`));
        } else {
            dispatch(redirectToApp());
        }
        dispatch(clearAccountState());
    };

    const onClose = () => {
        Mixpanel.track("IE-Ledger Close ledger confirmation");
        if (signInWithLedgerStatus === 'confirm-public-key') {
            controllerHelperApi.abort();
        }
        if (signInWithLedgerStatus === 'enter-accountId') {
            dispatch(clearSignInWithLedgerModalState());
        }
    };

    return (
        <Container className='small-centered border ledger-theme'>
            <h1><Translate id='signInLedger.header'/></h1>
            <LedgerImage/>
            <h2><Translate id='signInLedger.one'/></h2>
            <br/>
            <LocalAlertBox localAlert={status.localAlert}/>
            <LedgerHdPaths
                path={path}
                onSetPath={path => setPath(path)}
                onConfirmHdPath={() => {
                    setConfirmedPath(path);
                    Mixpanel.track("IE-Ledger Sign in set custom HD path");
                }}
            />
            <FormButton
                onClick={handleSignIn}
                sending={signingIn}
                sendingString='button.signingIn'
            >
                <Translate id={`button.${status.localAlert && !status.localAlert.success ? 'retry' : 'signIn'}`}/>
            </FormButton>
            <FormButton 
                className='link red' 
                onClick={() => props.history.goBack()}
                trackingId='IE-Ledger Click cancel button'
            >
                <Translate id='button.cancel'/>
            </FormButton>

            {signingIn &&
                <LedgerSignInModal 
                    open={signingIn} 
                    onClose={onClose}
                    ledgerAccounts={ledgerAccounts} 
                    accountsApproved={accountsApproved}
                    accountsError={accountsError}
                    accountsRejected={accountsRejected}
                    totalAccounts={totalAccounts}
                    txSigned={txSigned}
                    handleAdditionalAccountId={handleAdditionalAccountId}
                    signInWithLedgerStatus={signInWithLedgerStatus}
                    accountId={accountId}
                    handleChange={handleChange}
                    localAlert={status.localAlert}
                    checkAccountAvailable={(accountId) => dispatch(checkAccountAvailable(accountId))}
                    mainLoader={account.mainLoader}
                    clearLocalAlert={() => dispatch(clearLocalAlert())}
                    stateAccountId={account.accountId}
                    loader={loader}
                    clearSignInWithLedgerModalState={() => dispatch(clearSignInWithLedgerModalState())}
                />
            }
        </Container>
    );
}
