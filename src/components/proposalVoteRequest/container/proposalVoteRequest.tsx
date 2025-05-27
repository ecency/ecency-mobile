import React, { useMemo, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { SheetManager } from 'react-native-actions-sheet';
import styles from '../styles/ProposalVoteRequest.styles';
import { TextButton } from '../../buttons';
import { MainButton } from '../../mainButton';
import { ButtonTypes } from '../../actionModal/container/actionModalContainer';
import {
  useActiveProposalMetaQuery,
  useProposalVotedQuery,
  useProposalVoteMutation,
} from '../../../providers/queries';
import { updateProposalVoteMeta } from '../../../redux/actions/cacheActions';
import { SheetNames } from '../../../navigation/sheets';

const RE_REQUEST_INTERVAL = 259200000; // 3 days;

export const ProposalVoteRequest = () => {
  const intl = useIntl();
  const dispatch = useDispatch();

  // reference query with active proposal id
  const activeProposalMetaQuery = useActiveProposalMetaQuery();
  const _ecencyProposalId = activeProposalMetaQuery.data?.id;

  // make sure proposalVotedQuery returnes updated data on id change
  const proposalVotedQuery = useProposalVotedQuery(_ecencyProposalId);
  const proposalVoteMutation = useProposalVoteMutation();

  const currentAccount = useSelector((state) => state.account.currentAccount);
  const isLoggedIn = useSelector((state) => state.application.isLoggedIn);

  // assess if user should be promopted to vote proposal
  // makes sure this logic is only calculated once on launch
  const [skipOnLaunch] = useState(
    !isLoggedIn || proposalVotedQuery.data || proposalVotedQuery.meta?.processed,
  );

  // render or no render based on dimiss action performed
  const skipRender = useMemo(() => {
    if (!skipOnLaunch && proposalVotedQuery.meta) {
      const curTime = new Date().getTime();
      const nextRequestTime = proposalVotedQuery.meta.dismissedAt + RE_REQUEST_INTERVAL;
      return nextRequestTime > curTime;
    }
    return skipOnLaunch;
  }, [proposalVotedQuery.meta]);

  if (skipRender) {
    return null;
  }

  const voteCasted = proposalVoteMutation.isSuccess;

  const _voteAction = () => {
    proposalVoteMutation.mutate({ proposalId: _ecencyProposalId });
  };

  const _remindLater = () => {
    if (!_ecencyProposalId) {
      return null;
    }

    SheetManager.show(SheetNames.ACTION_MODAL, {
      payload: {
        title: intl.formatMessage({ id: 'proposal.title-action-dismiss' }), // "Dismiss Vote Request",
        buttons: [
          {
            text: intl.formatMessage({ id: 'proposal.btn-ignore' }),
            type: ButtonTypes.CANCEL,
            onPress: () => {
              console.log('Ignore');
              dispatch(
                updateProposalVoteMeta(
                  _ecencyProposalId,
                  currentAccount.username,
                  true,
                  new Date().getTime(),
                ),
              );
            },
          },
          {
            text: intl.formatMessage({ id: 'proposal.btn-later' }),
            onPress: () => {
              dispatch(
                updateProposalVoteMeta(
                  _ecencyProposalId,
                  currentAccount.username,
                  false,
                  new Date().getTime(),
                ),
              );
            },
          },
        ],
      },
    });
  };

  const _actionPanel = () => {
    return (
      <View style={styles.actionPanel}>
        <MainButton
          onPress={_voteAction}
          style={{ height: 40 }}
          textStyle={styles.voteBtnTitle}
          text={intl.formatMessage({ id: 'proposal.btn-vote' })}
          isLoading={proposalVoteMutation.isLoading}
        />
        <TextButton
          onPress={_remindLater}
          style={{ marginLeft: 8 }}
          text={intl.formatMessage({ id: 'proposal.btn-dismiss' })}
        />
      </View>
    );
  };

  const titleTextId = voteCasted ? 'proposal.title-voted' : 'proposal.title';
  const descTextId = voteCasted ? 'proposal.desc-voted' : 'proposal.desc';

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{intl.formatMessage({ id: titleTextId })}</Text>

          <Text style={styles.description}>{intl.formatMessage({ id: descTextId })}</Text>
        </View>

        <Image
          resizeMode="contain"
          style={{ width: 56, marginHorizontal: 12 }}
          source={require('../../../assets/ecency_logo_transparent.png')}
        />
      </View>
      {!voteCasted && _actionPanel()}
    </View>
  );
};
