import { Appearance } from 'react-native';

// Constants
import THEME_OPTIONS from '../../../constants/options/theme';

// Services
import {
    getSettings,
} from '../../../realm/realm';

import {
    isDarkTheme,
    changeNotificationSettings,
    changeAllNotificationSettings,
    setApi,
    setCurrency,
    setLanguage,
    setUpvotePercent,
    setNsfw,
    isDefaultFooter,
    isPinCodeOpen,
    setColorTheme,
    setSettingsMigrated,
} from '../../../redux/actions/applicationActions';
import {
    hideActionModal,
    hideProfileModal,
    setRcOffer,
    toastNotification,
} from '../../../redux/actions/uiAction';


//migrates settings from realm to redux once and do no user realm for settings again;
export const migrateSettings = async (dispatch: any, settingsMigratedV2: boolean) => {

    if (settingsMigratedV2) {
        return;
    }

    //reset certain properties
    dispatch(hideActionModal());
    dispatch(hideProfileModal());
    dispatch(toastNotification(''));
    dispatch(setRcOffer(false));


    const settings = await getSettings();

    if (settings) {
        const isDarkMode = Appearance.getColorScheme() === 'dark';
        dispatch(isDarkTheme(settings.isDarkTheme !== null ? settings.isDarkTheme : isDarkMode));
        dispatch(setColorTheme(THEME_OPTIONS.findIndex(item => item.value === settings.isDarkTheme)));
        await dispatch(isPinCodeOpen(!!settings.isPinCodeOpen));
        if (settings.language !== '') dispatch(setLanguage(settings.language));
        if (settings.server !== '') dispatch(setApi(settings.server));
        if (settings.upvotePercent !== '') {
            dispatch(setUpvotePercent(Number(settings.upvotePercent)));
        }
        if (settings.isDefaultFooter !== '') dispatch(isDefaultFooter(settings.isDefaultFooter)); //TODO: remove as not being used


        if (settings.nsfw !== '') dispatch(setNsfw(settings.nsfw));

        dispatch(setCurrency(settings.currency !== '' ? settings.currency : 'usd'));

        if (settings.notification !== '') {
            dispatch(
                changeNotificationSettings({
                    type: 'notification',
                    action: settings.notification,
                }),
            );

            dispatch(changeAllNotificationSettings(settings));
        }

        await dispatch(setSettingsMigrated(true))
    }
}

export default {
    migrateSettings
}