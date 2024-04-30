import axios from "axios";
import bugsnagInstance from '../../config/bugsnag';
import { Poll } from "./polls.types";
import { convertPoll } from "./converters";

const POLLS_BASE_URL = 'https://polls.ecency.com';

const PATH_RPC = 'rpc'
const PATH_POLL = 'rpc'

const pollsApi = axios.create({
    baseURL: POLLS_BASE_URL,
});


export const getPollData = async (author: string, permlink: string): Promise<Poll> => {
    try {
        if (!author || !permlink) {
            throw new Error("author and permlink are requied for fetching polls data");
        }

        //prefix (eq.) is a requirement from api implementation
        const params = {
            author: `eq.${author}`,
            permlink: `eq.${permlink}`
        }

        const res = await pollsApi.get(`/${PATH_RPC}/${PATH_POLL}`, { params });

        console.log('poll data fetcehd', res.data);
        if (!res.data || !res.data[0]) {
            throw new Error('No poll data found!');
        }

        const data = convertPoll(res.data[0]);

        if (!data) {
            throw new Error('Failed to parse poll resposne data');
        }

        return data

    } catch (error) {
        bugsnagInstance.notify(error);
        throw error;
    }
};
