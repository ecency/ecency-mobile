import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import QUERIES from '../queryKeys';
import { castPollVote, getPollData } from '../../polls/polls';
import { PostMetadata } from '../../hive/hive.types';
import { Poll, PollChoice } from '../../polls/polls.types';
import { useAppSelector } from '../../../hooks';
import parseToken from '../../../utils/parseToken';
import { vestsToHp } from '../../../utils/conversions';
import { updatePollVoteCache } from '../../../redux/actions/cacheActions';
import { CacheStatus, PollVoteCache } from '../../../redux/reducers/cacheReducer';
import { toastNotification } from '../../../redux/actions/uiAction';

/** hook used to return post poll */
export const useGetPollQuery = (_author?: string, _permlink?: string, metadata?: PostMetadata) => {
  const [author, setAuthor] = useState(_author);
  const [permlink, setPermlink] = useState(_permlink);

  // post process initial post if available
  const _initialPollData = useMemo(() => {
    // TODO: convert metadata to Poll data;

    return null;
  }, [metadata]);

  const query = useQuery(
    [QUERIES.POST.GET_POLL, author, permlink],
    async () => {
      if (!author || !permlink) {
        return null;
      }

      try {
        const pollData = await getPollData(author, permlink);
        if (!pollData) {
          new Error('Poll data unavailable');
        }

        return pollData;
      } catch (err) {
        console.warn('Failed to get post', err);
        throw err;
      }
    },
    {
      initialData: _initialPollData,
      cacheTime: 30 * 60 * 1000, // keeps cache for 30 minutes
    },
  );

  // TODO: use injectPollVoteCache here for simplifity and code reuseability
  const data = useInjectPollVoteCache(query.data);

  return {
    ...query,
    data,
    setAuthor,
    setPermlink,
  };
};

export function useVotePollMutation(poll: Poll | null) {
  // const { activeUser } = useMappedStore();
  const intl = useIntl();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const pollVotesCollection = useAppSelector((state) => state.cache.pollVotesCollection);
  const pinHash = useAppSelector((state) => state.application.pin);
  const globalProps = useAppSelector((state) => state.account.globalProps);

  return useMutation({
    mutationKey: [QUERIES.POST.SIGN_POLL_VOTE, poll?.author, poll?.permlink],
    mutationFn: async ({ choices }: { choices: number[] }) => {
      if (!poll || !currentAccount) {
        throw new Error('Failed to register vote');
      }

      if (!(choices instanceof Array)) {
        throw new Error('Invalid vote');
      }

      return await castPollVote(poll.poll_trx_id, choices, currentAccount, pinHash);
    },
    retry: 3,
    onMutate: ({ choices }) => {
      // update redux
      const userHp =
        Math.round(
          vestsToHp(parseToken(currentAccount.vesting_shares), globalProps.hivePerMVests) * 1000,
        ) / 1000;
      const postPath = `${poll?.author || ''}/${poll?.permlink || ''}`;
      const curTime = new Date().getTime();
      const vote = {
        choices,
        userHp,
        username: currentAccount.username,
        votedAt: curTime,
        expiresAt: curTime + 120000,
        status: CacheStatus.PENDING,
      } as PollVoteCache;
      dispatch(updatePollVoteCache(postPath, vote));
    },

    onSuccess: (status) => {
      console.log('vote response', status);
      // update poll cache here
      const postPath = `${poll?.author || ''}/${poll?.permlink || ''}`;
      const voteCache: PollVoteCache = pollVotesCollection[postPath];
      if (voteCache) {
        voteCache.status = status ? CacheStatus.PUBLISHED : CacheStatus.FAILED;
        dispatch(updatePollVoteCache(postPath, voteCache));
      }
    },
    onError: (err) => {
      // reverse mutation here
      const postPath = `${poll?.author || ''}/${poll?.permlink || ''}`;
      const voteCache: PollVoteCache = pollVotesCollection[postPath];
      if (voteCache) {
        voteCache.status = CacheStatus.FAILED;
        dispatch(updatePollVoteCache(postPath, voteCache));
      }

      dispatch(toastNotification(`${intl.formateMessage({ id: 'alert.fail' })}. ${err.message}`));

      queryClient.invalidateQueries([QUERIES.POST.GET_POLL, poll?.author, poll?.permlink]);
    },
  });
}

// used to create, update and remove poll vote entry from votes data
const useInjectPollVoteCache = (pollData: Poll | null) => {
  const pollVotesCollection = useAppSelector((state) => state.cache.pollVotesCollection);
  const lastUpdate = useAppSelector((state) => state.cache.lastUpdate);
  const [retData, setRetData] = useState<Poll | null>(null);

  useEffect(() => {
    if (pollData && lastUpdate && lastUpdate.type === 'poll-vote') {
      const _postPath = lastUpdate.postPath;
      const _voteCache = pollVotesCollection[_postPath];

      const _comparePath = (item) => _postPath === `${item.author}/${item.permlink}`;
      const _pathMatched = pollData && _comparePath(pollData);

      // if poll available, inject cache and update state
      if (_pathMatched) {
        console.log('Injection: on cache change: ', _voteCache);
        const data = injectPollVoteCache(pollData, _voteCache);

        console.log('updating data', data);
        setRetData({ ...data });
      }
    }
  }, [pollVotesCollection]);

  useEffect(() => {
    if (!pollData) {
      setRetData(null);
      return;
    }

    const _path = `${pollData.author}/${pollData.permlink}`;
    const voteCache = pollVotesCollection[_path];

    const _cData = injectPollVoteCache(pollData, voteCache);

    // check if data follows old schema, migrate if nesseary
    if (_cData.poll_voters instanceof Array && !!_cData.poll_voters[0].choice_num) {
      _cData.poll_voters = _cData.poll_voters.map((voter) => ({
        ...voter,
        choices: [voter.choice_num],
      }));
    }

    setRetData(_cData);
  }, [pollData]);

  return retData || pollData;
};

const injectPollVoteCache = (data: Poll, voteCache: PollVoteCache) => {
  if (!data || !voteCache) {
    return data;
  }

  const { userHp, choices, username, status } = voteCache;

  if (status === CacheStatus.FAILED) {
    return data;
  }

  // extract previously votes choices and new choices
  const existingVote = data.poll_voters?.find((pv) => pv.name === username);
  const previousUserChoices = data.poll_choices?.filter((pc) =>
    existingVote?.choices.includes(pc.choice_num),
  );
  const selectedChoices = data.poll_choices?.filter((pc) => choices.includes(pc.choice_num))!;

  // filtered list to separate untoched multiple choice e.g from old [1,2,3] new [3,4,5], removed would be [1, 2] , new would be [4, 5]
  const removedChoices = previousUserChoices.filter(
    (pc) => !selectedChoices.some((element) => element.choice_num === pc.choice_num),
  );
  const newChoices = selectedChoices.filter(
    (pc) => !previousUserChoices.some((element) => element.choice_num === pc.choice_num),
  );

  // votes that were not affected by new vote
  const notTouchedChoices = data.poll_choices?.filter(
    (pc) =>
      ![
        ...removedChoices.map((pc) => pc.choice_num),
        ...newChoices.map((pc) => pc.choice_num),
      ].includes(pc.choice_num),
  );

  const otherVoters = data.poll_voters?.filter((pv) => pv.name !== username) ?? [];

  let { poll_choices } = data;
  poll_choices = [
    ...notTouchedChoices,
    ...removedChoices.map((pc) => ({
      ...pc,
      votes: {
        total_votes: (pc?.votes?.total_votes ?? 0) - 1,
        hive_hp: (pc?.votes?.hive_hp ?? 0) - userHp,
        hive_hp_incl_proxied: (pc?.votes?.hive_hp ?? 0) - userHp,
      },
    })),
    ...newChoices.map((pc) => ({
      ...pc,
      votes: {
        total_votes: (pc?.votes?.total_votes ?? 0) + 1,
        hive_hp: (pc?.votes?.hive_hp ?? 0) + userHp,
        hive_hp_incl_proxied: (pc?.votes?.hive_hp ?? 0) + userHp,
      },
    })),
  ]
    .filter((el) => !!el)
    .sort((a, b) => (a?.choice_num < b?.choice_num ? -1 : 1)) as PollChoice[];

  return {
    ...data,
    poll_choices,
    poll_voters: [...otherVoters, { name: username, choices }],
  } as Poll;
};
