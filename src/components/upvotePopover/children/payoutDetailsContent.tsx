import React from 'react';
import { useIntl } from 'react-intl';

import { View, Text } from 'react-native';
import { useAppSelector } from '../../../hooks';
import parseAsset from '../../../utils/parseAsset';
import { getTimeFromNow } from '../../../utils/time';


import { FormattedCurrency } from '../../formatedElements';
// Styles
import styles from './upvoteStyles';


interface Props {
    content: any

}

export const PayoutDetailsContent = ({
    content
}: Props) => {
    const intl = useIntl();

    const globalProps = useAppSelector(state => state.account.globalProps);

    const authorPayout = parseAsset(content.author_payout_value).amount;
    const curationPayout = parseAsset(content.curator_payout_value).amount;
    const promotedPayout = parseAsset(content.promoted).amount;

    const pendingPayout = parseAsset(content.pending_payout_value).amount;

    const totalPayout = content.total_payout;

    const maxPayout = content.max_payout;

    const payoutDate = getTimeFromNow(content.payout_at);

    const payoutLimitHit = totalPayout >= maxPayout;

    // assemble breakdown
    const base = globalProps?.base || 0;
    const quote = globalProps?.quote || 0;
    const hbdPrintRate = globalProps?.hbdPrintRate || 0;
    const SBD_PRINT_RATE_MAX = 10000;
    const percent_steem_dollars = (content.percent_hbd || 10000) / 20000;



    const pending_payout_hbd = pendingPayout * percent_steem_dollars;
    const price_per_steem = base / quote;



    const pending_payout_hp = (pendingPayout - pending_payout_hbd) / price_per_steem;
    const pending_payout_printed_hbd = pending_payout_hbd * (hbdPrintRate / SBD_PRINT_RATE_MAX);
    const pending_payout_printed_hive =
        (pending_payout_hbd - pending_payout_printed_hbd) / price_per_steem;




    const breakdownPayout =
        (pending_payout_printed_hbd > 0 ? `${pending_payout_printed_hbd.toFixed(3)} HBD\n` : '') +
        (pending_payout_printed_hive > 0 ? `${pending_payout_printed_hive.toFixed(3)} HIVE\n` : '') +
        (pending_payout_hp > 0 ? `${pending_payout_hp.toFixed(3)} HP` : '');



    const beneficiaries = [];
    const beneficiary = content?.beneficiaries;
    if (beneficiary) {
        beneficiary.forEach((key, index) => {
            beneficiaries.push(
                `${index !== 0 ? '\n' : ''}${key?.account}: ${(
                    parseFloat(key?.weight) / 100
                ).toFixed(2)}%`,
            );
        });
    }


    const minimumAmountForPayout = 0.02;
    let warnZeroPayout = false;
    if (pendingPayout > 0 && pendingPayout < minimumAmountForPayout) {
        warnZeroPayout = true;
    }



    const _payoutPopupItem = (label, value) => {
        return (
            <View style={styles.popoverItemContent}>
                <Text style={styles.detailsLabel}>{label}</Text>
                <Text style={styles.detailsText}>{value}</Text>
            </View>
        );
    };


    return (
        <View style={styles.popoverContent}>
            {promotedPayout > 0 &&
                _payoutPopupItem(
                    intl.formatMessage({ id: 'payout.promoted' }),
                    <FormattedCurrency value={promotedPayout} isApproximate={true} />,
                )}

            {pendingPayout > 0 &&
                _payoutPopupItem(
                    intl.formatMessage({ id: 'payout.potential_payout' }),
                    <FormattedCurrency value={pendingPayout} isApproximate={true} />,
                )}

            {authorPayout > 0 &&
                _payoutPopupItem(
                    intl.formatMessage({ id: 'payout.author_payout' }),
                    <FormattedCurrency value={authorPayout} isApproximate={true} />,
                )}

            {curationPayout > 0 &&
                _payoutPopupItem(
                    intl.formatMessage({ id: 'payout.curation_payout' }),
                    <FormattedCurrency value={curationPayout} isApproximate={true} />,
                )}
            {payoutLimitHit &&
                _payoutPopupItem(
                    intl.formatMessage({ id: 'payout.max_accepted' }),
                    <FormattedCurrency value={maxPayout} isApproximate={true} />,
                )}

            {!!breakdownPayout &&
                pendingPayout > 0 &&
                _payoutPopupItem(
                    intl.formatMessage({ id: 'payout.breakdown' }),
                    breakdownPayout,
                )}

            {beneficiaries.length > 0 &&
                _payoutPopupItem(
                    intl.formatMessage({ id: 'payout.beneficiaries' }),
                    beneficiaries,
                )}

            {!!payoutDate &&
                _payoutPopupItem(intl.formatMessage({ id: 'payout.payout_date' }), payoutDate)}

            {warnZeroPayout &&
                _payoutPopupItem(intl.formatMessage({ id: 'payout.warn_zero_payout' }), '')}
        </View>
    )
}