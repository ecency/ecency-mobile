import { b64uEnc } from "./b64";

export interface HiveSignerMessage {
    signed_message: {
        type: string;
        app: string;
    },
    authors: string[];
    timestamp: number;
    signatures?: string[];
}


export const makeHsCode = async (account: string, signer: (message: string) => Promise<string>): Promise<string> => {
    const timestamp = new Date().getTime() / 1000;
    const messageObj: HiveSignerMessage = {signed_message: {type: 'code', app: "ecency.app"}, authors: [account], timestamp};
    const message = JSON.stringify(messageObj);
    const signature = await signer(message);
    messageObj.signatures = [signature];
    return b64uEnc(JSON.stringify(messageObj));
}
