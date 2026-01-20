import { useMutation, useQuery } from '@tanstack/react-query';
import {
  getProposalsQueryOptions,
  getUserProposalVotesQueryOptions,
  useBroadcastMutation,
} from '@ecency/sdk';
import { useIntl } from 'react-intl';
import { ProposalVoteMeta } from 'redux/reducers/cacheReducer';
import * as hiveuri from 'hive-uri';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { toastNotification } from '../../redux/actions/uiAction';
import { updateProposalVoteMeta } from '../../redux/actions/cacheActions';
import { ProposalMeta } from '../ecency/ecency.types';
import authType from '../../constants/authType';
import ROUTES from '../../constants/routeNames';
import { selectCurrentAccount, selectPin } from '../../redux/selectors';
import { decryptKey } from '../../utils/crypto';
import { getDigitPinCode } from '../hive/dhive';

// query for getting active proposal meta using SDK
export const useActiveProposalMetaQuery = () => {
  return useQuery<ProposalMeta>(getProposalsQueryOptions('active'));
};

export const useProposalVotedQuery = (proposalId?: number) => {
  const currentAccount = useAppSelector(selectCurrentAccount);
  const proposalsVoteMeta = useAppSelector((state) => state.cache.proposalsVoteMeta);

  // form meta id
  const _cacheId = `${proposalId}_${currentAccount.username}`;
  const _proposalVoteMeta: ProposalVoteMeta | null = proposalsVoteMeta[_cacheId];

  // Use SDK to get user's proposal votes, then check if this proposal is voted
  const query = useQuery({
    ...getUserProposalVotesQueryOptions(currentAccount.username),
    select: (votedProposals) => {
      if (!proposalId || !votedProposals) {
        return true;
      }
      const isVoted = votedProposals.some((item) => item.proposal.proposal_id === proposalId);
      console.log('is proposal voted', isVoted);
      return isVoted;
    },
    initialData: true,
  });

  return {
    ...query,
    meta: _proposalVoteMeta,
  };
};

export const useProposalVoteMutation = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const intl = useIntl();

  const currentAccount = useAppSelector(selectCurrentAccount);
  const pinHash = useAppSelector(selectPin);

  // Prepare auth credentials
  const digitPinCode = getDigitPinCode(pinHash);
  const isHiveSigner =
    currentAccount.local.authType === authType.STEEM_CONNECT ||
    currentAccount.local.authType === authType.HIVE_AUTH;

  const accessToken = isHiveSigner
    ? decryptKey(currentAccount.local.accessToken, digitPinCode)
    : undefined;

  // Note: proposal voting requires active key, not posting key
  const activeKey =
    !isHiveSigner && currentAccount.local.activeKey
      ? decryptKey(currentAccount.local.activeKey, digitPinCode)
      : undefined;

  const auth = {
    postingKey: activeKey, // SDK uses postingKey param but we pass active key for proposals
    loginType: isHiveSigner ? 'hs' : 'key',
  };

  const broadcastMutation = useBroadcastMutation<{ proposalId: number }>(
    ['proposals', 'vote'],
    currentAccount.name,
    accessToken,
    ({ proposalId }) => [
      [
        'update_proposal_votes',
        {
          voter: currentAccount.username,
          proposal_ids: [proposalId],
          approve: true,
          extensions: [],
        },
      ],
    ],
    () => {}, // onSuccess callback
    auth,
  );

  return useMutation<any, Error, { proposalId: number }>({
    mutationFn: ({ proposalId }) => {
      // For HiveSigner, use navigation modal instead of direct API call
      if (currentAccount.local.authType === authType.STEEM_CONNECT) {
        const _enHiveuri = hiveuri.encodeOp([
          'update_proposal_votes',
          {
            voter: currentAccount.username,
            proposal_ids: [proposalId],
            approve: true,
            extensions: [],
          },
        ]);

        return new Promise((resolve) => {
          navigation.navigate(ROUTES.MODALS.HIVE_SIGNER, {
            hiveuri: _enHiveuri,
            onClose: () => {
              resolve(true);
            },
          });
        });
      }

      // For other auth types, use SDK broadcast
      return broadcastMutation.mutateAsync({ proposalId });
    },

    retry: 3,
    onSuccess: (_, { proposalId }) => {
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.thankyou' })));
      dispatch(updateProposalVoteMeta(proposalId, currentAccount.username, true));
    },
    onError: () => {
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
    },
  });
};
