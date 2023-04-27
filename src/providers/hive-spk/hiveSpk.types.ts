export interface SpkApiWallet {
  balance: number;
  claim: number;
  drop: {
    availible: {
      amount: number;
      precision: number;
      token: string;
    };
    last_claim: number;
    total_claims: number;
  };
  poweredUp: number;
  granted: {
    t: number;
    [key: string]: number;
  };
  granting: {
    t: number;
    [key: string]: number;
  };
  heldCollateral: number;
  contracts: unknown[];
  up: unknown;
  down: unknown;
  power_downs: { [key: string]: string };
  gov_downs: unknown;
  gov: number;
  spk: number;
  spk_block: number;
  tick: string; // double in string
  node: string;
  head_block: number;
  behind: number;
  VERSION: string; // v<x.x.x>
  pow: number;
}

export interface SpkMarkets {
  head_block: number;
  markets: {
    node: {
      [key: string]: {
        lastGood: number;
        report: {
          block: number;
        };
      };
    };
  };
}

export interface Market {
  name: string;
  status: string;
}

export interface Markets {
  list: Market[];
  raw: any;
}

export interface HivePrice {
  hive: {
    usd: number;
  };
}

export enum SpkActions {
  TRANSFER = 'transfer_spk',
  TRANSFER_LARYNX = 'transfer_larynx',
  POWER_UP = 'power_up_spk',
  LOCK_LIQUIDITY = 'lock_liquidity_spk',
  DELEGATE = 'delegate_spk',
  POWER_DOWN = 'power_down_spk',
}

export enum SpkPowerMode {
  UP = 'up',
  DOWN = 'down',
}
