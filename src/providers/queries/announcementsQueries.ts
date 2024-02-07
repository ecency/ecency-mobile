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

const PROMPT_AGAIN_INTERVAL = 48 * 3600 * 1000; // 2 days

export const useAnnouncementsQuery = () => {
  const intl = useIntl();
  const dispatch = useDispatch();

  const isLoggedIn = useAppSelector((state) => state.application.isLoggedIn);
  const announcementsMeta = useAppSelector((state) => state.cache.announcementsMeta);

  const announcmentsQuery = useQuery([QUERIES.ANNOUNCEMENTS.GET], getAnnouncements);

  useEffect(() => {
    if (announcmentsQuery.data?.length > 0) {
      const firstAnnounce = announcmentsQuery.data[0];

      const _meta = announcementsMeta && announcementsMeta[firstAnnounce.id];
      const curTime = new Date().getTime();

      if (
        (firstAnnounce.auth && !isLoggedIn) ||
        _meta?.processed ||
        _meta?.lastSeen + PROMPT_AGAIN_INTERVAL > curTime
      ) {
        return;
      }

      const _markAsSeen = () => {
        dispatch(updateAnnoucementsMeta(firstAnnounce.id, false));
      };

      const _onActionPress = () => {
        if (firstAnnounce.ops) {
          dispatch(handleDeepLink(firstAnnounce.ops));
        } else if (firstAnnounce.button_link) {
          const _url = firstAnnounce.button_link.startsWith('https://')
            ? firstAnnounce.button_link
            : getPostUrl(firstAnnounce.button_link);
          dispatch(handleDeepLink(_url));
        }

        // mark as processed
        dispatch(updateAnnoucementsMeta(firstAnnounce.id, true));
      };

      const _buttons = [
        {
          text: intl.formatMessage({ id: 'alert.later' }),
          onPress: _markAsSeen,
        },
        {
          text: firstAnnounce.button_text,
          onPress: _onActionPress,
        },
      ];

      dispatch(
        showActionModal({
          title: firstAnnounce.title,
          body: firstAnnounce.description,
          buttons: _buttons,
          onClosed: _markAsSeen,
        }),
      );
    }
  }, [announcmentsQuery.data]);
};
