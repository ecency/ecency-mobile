import { CoinBase } from "../redux/reducers/walletReducer"

const DEFAULT_COINS = [{
    id:'ecency',
    name:'Ecency Points', 
    symbol:'Points',
    notCrypto:true
},{
    id:'hive_power',
    name:'Hive Power', 
    symbol:'HP',
    notCrypto:true
},{
    id:'hive',
    name:'Hive Token',
    symbol:'HIVE',
    notCrypto:false
},{ 
    id:'hive_dollar',
    name:'Hive Dollar',
    symbol:'HBD',
    notCrypto:false
}] as CoinBase[]

export const COIN_IDS = {
    ECENCY:'ecency',
    HIVE:'hive',
    HBD:'hive_dollar',
    HP:'hive_power'
}


export default DEFAULT_COINS