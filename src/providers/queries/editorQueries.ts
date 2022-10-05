import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useIntl } from 'react-intl';
import { useAppDispatch } from '../../hooks';
import { toastNotification } from '../../redux/actions/uiAction';
import { addFragment, getFragments, updateFragment } from '../ecency/ecency';
import { Snippet } from '../ecency/ecency.types';
import QUERIES from './queryKeys';

interface SnippetMutationVars {
    id: string | null;
    title: string;
    body: string;
}

export const useSnippetsQuery = () => {
    const intl = useIntl();
    const dispatch = useAppDispatch();
    return useQuery<Snippet[]>([QUERIES.SNIPPETS.GET], getFragments, {
        onError: () => {
            dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
        },
    });
};


export const useSnippetsMutation = () => {
    const intl = useIntl();
    const dispatch = useAppDispatch();
    const queryClient = useQueryClient();

    return useMutation<Snippet[], undefined, SnippetMutationVars>(async (vars) => {
        console.log("going to add/update snippet", vars);
        if (vars.id) {
            const response = await updateFragment(vars.id, vars.title, vars.body)
            return response;
        } else {
            const response = await addFragment(vars.title, vars.body)
            return response;
        }
    }, {
        onMutate: (vars) => {
            console.log("mutate snippets for add/update", vars)

            const _newItem = {
                id: vars.id,
                title: vars.title,
                body: vars.body,
                created: new Date().toDateString(),
                modified: new Date().toDateString(),
            } as Snippet;

            const data = queryClient.getQueryData<Snippet[]>([QUERIES.SNIPPETS.GET]);

            let _newData: Snippet[] = data ? [...data] : [];
            if (vars.id) {
                const snipIndex = _newData.findIndex((item) => vars.id === item.id)
                _newData[snipIndex] = _newItem;
            } else {
                _newData = [_newItem, ..._newData];
            }

            queryClient.setQueryData([QUERIES.SNIPPETS.GET], _newData)
        },
        onSuccess: (data) => {
            console.log("added/updated snippet", data)
            queryClient.invalidateQueries([QUERIES.SNIPPETS.GET])
        },
        onError: () => {
            dispatch(toastNotification(intl.formatMessage({ id: 'snippets.message_failed' })));
        }
    })
}