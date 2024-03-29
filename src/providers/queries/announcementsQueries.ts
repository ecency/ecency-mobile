import { useQuery } from '@tanstack/react-query';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { getAnnouncements } from '../ecency/ecency';
import QUERIES from './queryKeys';
import { useAppSelector } from '../../hooks';
import { updateAnnoucementsMeta } from '../../redux/actions/cacheActions';
import { handleDeepLink, showActionModal } from '../../redux/actions/uiAction';
import { getPostUrl } from '../../utils/post';
import { delay } from '../../utils/editor';

const PROMPT_AGAIN_INTERVAL = 48 * 3600 * 1000; // 2 days

export const useAnnouncementsQuery = () => {
  const intl = useIntl();
  const dispatch = useDispatch();

  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const announcementsMeta = useAppSelector((state) => state.cache.announcementsMeta);

  const announcmentsQuery = useQuery([QUERIES.ANNOUNCEMENTS.GET], getAnnouncements);

  useEffect(() => {
    if (announcmentsQuery.data?.length > 0) {
      const firstAnnounce = announcmentsQuery.data[0];

      const _metaId = `${firstAnnounce.id}_${currentAccount?.username || 'guest'}`;

      const _meta = announcementsMeta && announcementsMeta[_metaId];
      const curTime = new Date().getTime();

      if (
        (firstAnnounce.auth && !currentAccount?.username) ||
        _meta?.processed ||
        _meta?.lastSeen + PROMPT_AGAIN_INTERVAL > curTime
      ) {
        return;
      }

      _showAnnouncement(firstAnnounce, _metaId);
    }
  }, [announcmentsQuery.data, currentAccount.username]);

  const _showAnnouncement = async (data, metaId) => {
    const _markAsSeen = () => {
      dispatch(updateAnnoucementsMeta(metaId, false));
    };

    const _onActionPress = () => {
      if (data.ops) {
        dispatch(handleDeepLink(data.ops));
      } else if (data.button_link) {
        const _url = data.button_link.startsWith('https://')
          ? data.button_link
          : getPostUrl(data.button_link);
        dispatch(handleDeepLink(_url));
      }

      // mark as processed
      dispatch(updateAnnoucementsMeta(metaId, true));
    };

    const _buttons = [
      {
        text: intl.formatMessage({ id: 'alert.later' }),
        onPress: _markAsSeen,
      },
      {
        text: data.button_text,
        onPress: _onActionPress,
      },
    ];

    await delay(3000);

    dispatch(
      showActionModal({
        title: data.title,
        body: data.description,
        buttons: _buttons,
        onClosed: _markAsSeen,
      }),
    );
  };
};
