import React from 'react';

import { formatTokenAmount, removeTrailingZeros } from '../../utils/amounts';

const FRAC_DIGITS = 5;

const formatToken = (amount, decimals) => {
    if (amount === '0') {
        return amount;
    }

    let formattedAmount = formatTokenAmount(amount, decimals, FRAC_DIGITS);

    if (formattedAmount === `0.${'0'.repeat(FRAC_DIGITS)}`) {
        return `< ${!FRAC_DIGITS ? `0` : `0.${'0'.repeat((FRAC_DIGITS || 1) - 1)}1`}`;
    }
    return removeTrailingZeros(formattedAmount);
};

const showFullAmount = (amount, decimals, symbol) =>
    (amount !== '0' && !!amount)
        ? `${formatTokenAmount(amount, decimals, decimals)} ${symbol}`
        : '';

const TokenAmount = ({ token: { balance, decimals, symbol }, withSymbol = false, className, showFiatAmount = true }) => (
    <div className={className} title={showFullAmount(balance, decimals, symbol)}>
        <div>
            {balance
                ? formatToken(balance, decimals)
                : <span className='dots' />
            }
            <span className='currency'>{withSymbol ? ` ${symbol}` : null}</span>
        </div>
        {showFiatAmount &&
            <div className='fiat-amount'>
                — USD
            </div>
        }
    </div>
);

export default TokenAmount;
