import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useIntl } from 'react-intl';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import EStyleSheet from 'react-native-extended-stylesheet';
import { getCommunityQueryOptions, ROLES } from '@ecency/sdk';

import { BasicHeader, FormInput, MainButton, ToggleSwitch } from '../../../components';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { useUpdateCommunityMutation } from '../../../providers/sdk/mutations';
import { toastNotification } from '../../../redux/actions/uiAction';
import { selectCurrentAccount } from '../../../redux/selectors';
import { getCommunityRole } from '../../../utils/communityModeration';
import styles from '../styles/communitySettingsScreen.styles';

// Editing community properties is owner and admin only. Mods are deliberately
// excluded, matching web, so this does not reuse isCommunityModerator.
const SETTINGS_ROLES: string[] = [ROLES.OWNER, ROLES.ADMIN];

// Same bounds web enforces, so a community edited on either client stays valid.
const TITLE_MIN = 3;
const TITLE_MAX = 20;

interface FormState {
  title: string;
  about: string;
  lang: string;
  description: string;
  flag_text: string;
  is_nsfw: boolean;
}

const EMPTY_FORM: FormState = {
  title: '',
  about: '',
  lang: '',
  description: '',
  flag_text: '',
  is_nsfw: false,
};

const CommunitySettingsScreen = ({ route }: any) => {
  const intl = useIntl();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const communityId: string = route.params?.communityId ?? '';

  const currentAccount = useAppSelector(selectCurrentAccount);
  const updateCommunityMutation = useUpdateCommunityMutation(communityId);

  const communityQuery = useQuery(
    getCommunityQueryOptions(communityId, currentAccount?.name, !!communityId),
  );

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  // Seed once the community resolves. Keyed on the community payload rather than
  // on mount, since the screen can open before the query settles.
  useEffect(() => {
    const { data } = communityQuery;
    if (!data) {
      return;
    }
    setForm({
      title: data.title ?? '',
      about: data.about ?? '',
      lang: data.lang ?? '',
      description: data.description ?? '',
      flag_text: data.flag_text ?? '',
      is_nsfw: !!data.is_nsfw,
    });
  }, [communityQuery.data]);

  const canEdit = useMemo(
    () =>
      SETTINGS_ROLES.includes(
        getCommunityRole(communityQuery.data?.team, currentAccount?.name) ?? '',
      ),
    [communityQuery.data, currentAccount?.name],
  );

  const titleError = useMemo(() => {
    const title = form.title.trim();
    if (!title) {
      return intl.formatMessage({ id: 'community_settings.required' });
    }
    if (title.length < TITLE_MIN || title.length > TITLE_MAX) {
      return intl.formatMessage(
        { id: 'community_settings.title_length' },
        { min: TITLE_MIN, max: TITLE_MAX },
      );
    }
    return '';
  }, [form.title, intl]);

  const isValid = !titleError && !!form.about.trim() && !!form.lang.trim();

  const _set = (key: keyof FormState) => (value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const _handleSave = async () => {
    if (!isValid || isSaving) {
      return;
    }
    setIsSaving(true);
    try {
      // Trimmed on the way out, as web does. Whitespace-only values would pass
      // hivemind and render as blank.
      await updateCommunityMutation.mutateAsync({
        title: form.title.trim(),
        about: form.about.trim(),
        lang: form.lang.trim(),
        description: form.description.trim(),
        flag_text: form.flag_text.trim(),
        is_nsfw: form.is_nsfw,
      });
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.successful' })));
      navigation.goBack();
    } catch (err) {
      Alert.alert(
        intl.formatMessage({ id: 'alert.fail' }),
        (err as Error)?.message || intl.formatMessage({ id: 'alert.unknow_error' }),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const _renderField = (
    key: keyof FormState,
    labelId: string,
    { multiline = false, error = '' }: { multiline?: boolean; error?: string } = {},
  ) => (
    <View style={styles.field}>
      <Text style={styles.label}>{intl.formatMessage({ id: labelId })}</Text>
      <FormInput
        wrapperStyle={styles.formStyle}
        isValid={!error}
        height={multiline ? 90 : 40}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        onChange={_set(key)}
        isEditable={canEdit}
        type="none"
        value={form[key] as string}
        inputStyle={styles.input}
      />
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <BasicHeader title={intl.formatMessage({ id: 'community_settings.title_header' })} />

      {!canEdit && !communityQuery.isLoading && (
        <Text style={styles.notice}>
          {intl.formatMessage({ id: 'community_settings.owner_admin_only' })}
        </Text>
      )}

      <KeyboardAwareScrollView
        contentContainerStyle={styles.contentContainer}
        enableOnAndroid={true}
      >
        {_renderField('title', 'community_settings.title_label', { error: titleError })}
        {_renderField('about', 'community_settings.about', {
          error: form.about.trim() ? '' : intl.formatMessage({ id: 'community_settings.required' }),
        })}
        {_renderField('lang', 'community_settings.lang', {
          error: form.lang.trim() ? '' : intl.formatMessage({ id: 'community_settings.required' }),
        })}
        {_renderField('description', 'community_settings.description', { multiline: true })}
        {/* hivemind calls this flag_text; both clients surface it as the rules. */}
        {_renderField('flag_text', 'community_settings.rules', { multiline: true })}

        <View style={styles.toggleRow}>
          <Text style={styles.label}>{intl.formatMessage({ id: 'community_settings.nsfw' })}</Text>
          <ToggleSwitch
            {...({} as any)}
            isOn={form.is_nsfw}
            onColor={EStyleSheet.value('$primaryBlue')}
            offColor={EStyleSheet.value('$primaryLightGray')}
            onToggle={(value) => canEdit && _set('is_nsfw')(value)}
          />
        </View>

        {canEdit && (
          <MainButton
            style={styles.saveButton}
            onPress={_handleSave}
            isLoading={isSaving}
            isDisable={!isValid || isSaving}
            text={intl.formatMessage({ id: 'community_settings.save' })}
          />
        )}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default gestureHandlerRootHOC(CommunitySettingsScreen);
