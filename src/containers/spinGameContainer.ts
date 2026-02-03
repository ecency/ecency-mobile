import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import get from 'lodash/get';
import { injectIntl } from 'react-intl';
import { useQueryClient } from '@tanstack/react-query';
import { getGameStatusCheckQueryOptions, useGameClaim } from '@ecency/sdk';
import { useAuth } from '../hooks';

const RedeemContainer = ({ children }) => {
  const queryClient = useQueryClient();
  const { username, code } = useAuth();

  const [score, setScore] = useState(0);
  const [nextDate, setNextDate] = useState(null);
  const [gameRight, setGameRight] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [claimKey, setClaimKey] = useState('');

  const claimMutation = useGameClaim(username, code, 'spin', claimKey);
  const claimMutationRef = useRef(claimMutation);
  const pendingGameStatusRef = useRef<any>(null);

  useEffect(() => {
    claimMutationRef.current = claimMutation;
  }, [claimMutation]);

  const _statusCheck = useCallback(async () => {
    try {
      const res = await queryClient.fetchQuery(
        getGameStatusCheckQueryOptions(username, code, 'spin'),
      );
      setGameRight(get(res, 'remaining', 0));
      setNextDate(get(res, 'next_date', null));
      setIsLoading(false);
      return res;
    } catch (err) {
      if (err) {
        Alert.alert(get(err, 'message') || err.toString());
      }
      setIsLoading(false);
      return null;
    }
  }, [code, queryClient, username]);

  useEffect(() => {
    _statusCheck();
  }, [_statusCheck]);

  const _startGame = async (_type) => {
    let gameStatus = null;
    try {
      gameStatus = await queryClient.fetchQuery(
        getGameStatusCheckQueryOptions(username, code, 'spin'),
      );
    } catch (err) {
      if (err) {
        Alert.alert(get(err, 'message') || err.toString());
      }
      return;
    }

    if (get(gameStatus, 'status') !== 18) {
      const key = get(gameStatus, 'key');
      if (!key) {
        Alert.alert('Game key missing');
        return;
      }
      pendingGameStatusRef.current = gameStatus;
      setClaimKey(key);
    } else {
      setNextDate(get(gameStatus, 'next_date'));
      setGameRight(0);
    }
  };

  useEffect(() => {
    if (!claimKey) {
      return;
    }

    const runClaim = async () => {
      try {
        const res = await claimMutationRef.current.mutateAsync();
        const gameStatus = pendingGameStatusRef.current;
        pendingGameStatusRef.current = null;

        setGameRight(get(gameStatus, 'status') !== 3 ? 0 : 5);
        setScore(get(res, 'score'));
        _statusCheck();
      } catch (err) {
        pendingGameStatusRef.current = null;
        if (err) {
          Alert.alert(get(err, 'message') || err.toString());
        }
      }
    };

    runClaim();
  }, [claimKey, _statusCheck]);

  return (
    children &&
    children({
      score,
      startGame: _startGame,
      gameRight,
      nextDate,
      isLoading,
      statusCheck: _statusCheck,
    })
  );
};

export default injectIntl(RedeemContainer);
