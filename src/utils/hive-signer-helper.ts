import { b64uEnc } from "./b64";

export const getAuthUrl = (redir: string = `${window.location.origin}/auth`) => {
    const app = "ecency.app";
    const scope = "vote,comment,delete_comment,comment_options,custom_json,claim_reward_balance,offline";

    return `https://hivesigner.com/oauth2/authorize?client_id=${app}&redirect_uri=${encodeURIComponent(
        redir
    )}&response_type=code&scope=${encodeURIComponent(scope)}`;
};

export interface HiveSignerMessage {
    signed_message: {
        type: string;
        app: string;
    },
    authors: string[];
    timestamp: number;
    signatures?: string[];
}


export const decodeToken = (code: string): HiveSignerMessage | null => {
    const buff = Buffer.from(code, "base64");
    try {
        const s = buff.toString("ascii");
        return JSON.parse(s);
    } catch (e) {
        return null;
    }
}



export const makeHsCode = async (account: string, signer: (message: string) => Promise<string>): Promise<string> => {
    const timestamp = new Date().getTime() / 1000;
    const messageObj: HiveSignerMessage = {signed_message: {type: 'code', app: "ecency.app"}, authors: [account], timestamp};
    const message = JSON.stringify(messageObj);
    const signature = await signer(message);
    messageObj.signatures = [signature];
    return b64uEnc(JSON.stringify(messageObj));
}



export const buildHotSignUrl = (endpoint: string, params: {
    [key: string]: string;
}, redirect: string): any => {
    const _params = {
        ...params,
        redirect_uri: `https://ecency.com/${redirect}`
    }

    const queryString = new URLSearchParams(_params).toString();
    return `https://hivesigner.com/sign/${endpoint}?${queryString}`;
}


export const hotSign = (endpoint: string, params: {
    [key: string]: any;
}, redirect: string) => {
    const webUrl = buildHotSignUrl(endpoint, params, redirect);
    const win = window.open(webUrl, '_blank');
    return win!.focus();
}