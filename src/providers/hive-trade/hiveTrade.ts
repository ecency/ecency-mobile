import { PrivateKey } from '@esteemapp/dhive';
import { getAnyPrivateKey, getDigitPinCode, getMarketStatistics, sendHiveOperations } from '../hive/dhive';
import { MarketAsset, MarketStatistics, OrderIdPrefix, SwapOptions, TransactionType } from './hiveTrade.types';
import bugsnapInstance from '../../config/bugsnag';
import { Operation } from '@hiveio/dhive';
import { convertSwapOptionsToLimitOrder } from './converters';


//This operation creates a limit order and matches it against existing open orders. 
//The maximum expiration time for any limit order is 28 days from head_block_time()
export const limitOrderCreate = (
    currentAccount: any,
    pinHash: string,
    amountToSell: number,
    minToReceive: number,
    orderType: TransactionType,
    idPrefix = OrderIdPrefix.EMPTY) => {


    const digitPinCode = getDigitPinCode(pinHash);
    const key = getAnyPrivateKey(
        {
            activeKey: currentAccount?.local?.activeKey,
        },
        digitPinCode,
    );

    if (key) {
        const privateKey = PrivateKey.fromString(key);

        let expiration: any = new Date(Date.now());
        expiration.setDate(expiration.getDate() + 27);
        expiration = expiration.toISOString().split(".")[0];

        const data = getLimitOrderCreateOpData(currentAccount.username, amountToSell, minToReceive, orderType, idPrefix);

        const args: Operation[] = [
            [
                'limit_order_create',
                data
            ],
        ];

        return new Promise((resolve, reject) => {
            sendHiveOperations(args, privateKey)
                .then((result) => {
                    if (result) {
                        resolve(result);
                    }
                })
                .catch((err) => {
                    bugsnapInstance.notify(err);
                    reject(err);
                });
        });
    }

    return Promise.reject(
        new Error('Check private key permission! Required private active key or above.'),
    );
};



export const generateHsLimitOrderCreatePath = (
    currentAccount: any,
    amountToSell: number,
    minToReceive: number,
    orderType: TransactionType,
    idPrefix = OrderIdPrefix.EMPTY) => {

    const data = getLimitOrderCreateOpData(currentAccount.username, amountToSell, minToReceive, orderType, idPrefix)

    const query = new URLSearchParams(data).toString()

    return `sign/limitOrderCreate?${query}`

}



export const generateHsSwapTokenPath = (
    currentAccount: any,
    data: SwapOptions) => {

    const {
        amountToSell,
        minToRecieve,
        transactionType
    } = convertSwapOptionsToLimitOrder(data)

    return generateHsLimitOrderCreatePath(
        currentAccount,
        amountToSell,
        minToRecieve,
        transactionType,
        OrderIdPrefix.SWAP
    )
}




export const swapToken = async (
    currentAccount: any,
    pinHash: string,
    data: SwapOptions) => {

    try {
        const {
            amountToSell,
            minToRecieve,
            transactionType
        } = convertSwapOptionsToLimitOrder(data)


        await limitOrderCreate(
            currentAccount,
            pinHash,
            amountToSell,
            minToRecieve,
            transactionType,
            OrderIdPrefix.SWAP
        )
    }
    catch (err) {
        console.warn("Failed to swap token", err)
        throw err;
    }
}



export const fetchHiveMarketRate = async (asset: MarketAsset): Promise<number> => {

    try {
        const market: MarketStatistics = await getMarketStatistics();
        const _lowestAsk = Number(market?.lowest_ask);

        if (!_lowestAsk) {
            throw new Error("Invalid market lowest ask")
        }

        switch (asset) {
            case MarketAsset.HIVE:
                return _lowestAsk
            case MarketAsset.HBD:
                return 1 / _lowestAsk;
            default:
                return 0;
        }

    } catch (err) {
        console.warn("failed to get hive market rate");
        bugsnapInstance.notify(err);
        throw err;
    }
}


const getLimitOrderCreateOpData = (username, amountToSell, minToReceive, orderType, idPrefix) => {
    let expiration: any = new Date(Date.now());
    expiration.setDate(expiration.getDate() + 27);
    expiration = expiration.toISOString().split(".")[0];

    return {
        owner: username,
        orderid: Number(
            `${idPrefix}${Math.floor(Date.now() / 1000)
                .toString()
                .slice(2)}`
        ),
        amount_to_sell: `${orderType === TransactionType.Buy
            ? amountToSell.toFixed(3)
            : minToReceive.toFixed(3)
            } ${orderType === TransactionType.Buy ? MarketAsset.HBD : MarketAsset.HIVE}`,
        min_to_receive: `${orderType === TransactionType.Buy
            ? minToReceive.toFixed(3)
            : amountToSell.toFixed(3)
            } ${orderType === TransactionType.Buy ? MarketAsset.HIVE : MarketAsset.HBD}`,
        fill_or_kill: false,
        expiration: expiration
    }
}