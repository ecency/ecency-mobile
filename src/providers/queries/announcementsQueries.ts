import { useQuery } from '@tanstack/react-query';
import { getAnnouncementsQueryOptions } from '@ecency/sdk';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useEffect, useMemo } from 'react';
import VersionNumber from 'react-native-version-number';
import { SheetManager } from 'react-native-actions-sheet';
import { useAppSelector, useLinkProcessor } from '../../hooks';
import { updateAnnoucementsMeta } from '../../redux/actions/cacheActions';
import { getPostUrl } from '../../utils/post';
import { delay } from '../../utils/editor';
import { ButtonTypes } from '../../components/actionModal/container/actionModalContainer';
import parseVersionNumber from '../../utils/parseVersionNumber';
import { decryptKey } from '../../utils/crypto';
import { getDigitPinCode } from '../hive/hive';
import { SheetNames } from '../../navigation/sheets';
import { selectPin, selectCurrentAccount, selectLastAppVersion } from '../../redux/selectors';

const PROMPT_AGAIN_INTERVAL = 48 * 3600 * 1000; // 2 days

export const useAnnouncementsQuery = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const linkProcessor = useLinkProcessor();

  const pinHash = useAppSelector(selectPin);

  const lastAppVersion = useAppSelector(selectLastAppVersion);
  const appVersion = useMemo(() => VersionNumber.appVersion, []);

  const currentAccount = useAppSelector(selectCurrentAccount);
  const announcementsMeta = useAppSelector((state) => state.cache.announcementsMeta);

  // Prepare access token for SDK
  const encToken = currentAccount?.local?.accessToken;
  const accessToken = encToken ? decryptKey(encToken, getDigitPinCode(pinHash)) : '';

  // Use SDK query options
  const announcmentsQuery = useQuery(getAnnouncementsQueryOptions(accessToken));

  useEffect(() => {
    // bypass if it's first launch after new version install/update
    const _isNewVersionLaunch =
      !lastAppVersion || parseVersionNumber(lastAppVersion) < parseVersionNumber(appVersion);
    if (_isNewVersionLaunch) {
      return;
    }

    // bypass if logged in user is required for announcement, skip otherwise
    const firstAnnounce = announcementsMeta.data && announcmentsQuery.data[0];
    if (!firstAnnounce || (firstAnnounce?.auth && !currentAccount?.username)) {
      return;
    }

    // prepare annoucmnet data
    const _metaId = `${firstAnnounce.id}_${currentAccount?.username || 'guest'}`;
    const _meta = announcementsMeta && announcementsMeta[_metaId];
    const curTime = new Date().getTime();

    // bypass if already processed or last prompt limit now expired
    if (_meta?.processed || _meta?.lastSeen + PROMPT_AGAIN_INTERVAL > curTime) {
      return;
    }

    _showAnnouncement(firstAnnounce, _metaId);
  }, [announcmentsQuery.data, currentAccount.name, lastAppVersion]);

  const _showAnnouncement = async (data, metaId) => {
    const _markAsSeen = () => {
      dispatch(updateAnnoucementsMeta(metaId, false));
    };

    const _onActionPress = () => {
      if (data.ops) {
        linkProcessor.handleLink(data.ops);
      } else if (data.button_link) {
        const _url = data.button_link.startsWith('https://')
          ? data.button_link
          : getPostUrl(data.button_link);
        linkProcessor.handleLink(_url);
      }

      // mark as processed
      dispatch(updateAnnoucementsMeta(metaId, true));
    };

    const _buttons = [
      {
        text: intl.formatMessage({ id: 'alert.later' }),
        onPress: _markAsSeen,
        type: ButtonTypes.CANCEL,
      },
      {
        text: data.button_text,
        onPress: _onActionPress,
      },
    ];

    await delay(3000);

    SheetManager.show(SheetNames.ACTION_MODAL, {
      payload: {
        title: data.title,
        body: data.description,
        buttons: _buttons,
        onClosed: _markAsSeen,
      },
    });
  };
};
