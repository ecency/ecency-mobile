import { debounce, isArray } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { Text, TouchableOpacity, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { lookupAccountsQueryOptions, isThreeSpeakBeneficiary } from '@ecency/sdk';
import { useQueryClient } from '@tanstack/react-query';
import styles from './styles';

import { CheckBox, FormInput, IconButton, TextButton } from '..';
import type { FormInputHandle } from '../formInput';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { setBeneficiaries as setBeneficiariesAction } from '../../redux/actions/editorActions';
import { toastNotification } from '../../redux/actions/uiAction';
import { DEFAULT_USER_DRAFT_ID } from '../../redux/constants/constants';
import { Beneficiary } from '../../redux/reducers/editorReducer';
import {
  DEFAULT_SUPPORT_PERCENT,
  ECENCY_SUPPORT_ACCOUNT,
  isEcencySupportBeneficiary,
  isValidSupportSettings,
} from '../../providers/ecency/supportBeneficiary';
import {
  useSupportSettingsQuery,
  useSupportSettingsMutation,
} from '../../providers/queries/settingsQueries';
import { selectCurrentAccountName } from '../../redux/selectors';

interface BeneficiarySelectionContentProps {
  draftId: string;
  setDisableDone: (value: boolean) => void;
  powerDown?: boolean;
  label?: string;
  labelStyle?: string;
  powerDownBeneficiaries?: Beneficiary[];
  encodingBeneficiaries?: Beneficiary[];
  handleSaveBeneficiary?: (beneficiaries: Beneficiary[]) => void;
  handleRemoveBeneficiary?: (beneficiary: Beneficiary) => void;
}

const BeneficiarySelectionContent = ({
  label,
  labelStyle,
  draftId,
  setDisableDone,
  powerDown,
  powerDownBeneficiaries,
  encodingBeneficiaries,
  handleSaveBeneficiary,
  handleRemoveBeneficiary,
}: BeneficiarySelectionContentProps) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const supportSettingsQuery = useSupportSettingsQuery();
  const supportSettingsMutation = useSupportSettingsMutation();

  const beneficiariesMap = useAppSelector((state) => state.editor.beneficiariesMap);
  const username = useAppSelector(selectCurrentAccountName);
  const DEFAULT_BENEFICIARY = { account: username, weight: 10000 };

  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([
    { account: username, weight: 10000, autoPowerUp: false },
  ]);

  const weightInputRef = useRef<FormInputHandle>(null);

  const [newUsername, setNewUsername] = useState('');
  const [newWeight, setNewWeight] = useState(0);
  const [newAutoPowerUp, setNewAutoPowerUp] = useState(false);
  const [isUsernameValid, setIsUsernameValid] = useState(false);
  const [isWeightValid, setIsWeightValid] = useState(false);
  const [newEditable, setNewEditable] = useState(false);

  useEffect(() => {
    if (powerDown) {
      readPowerDownBeneficiaries();
    }
  }, [powerDownBeneficiaries]);

  useEffect(() => {
    initBeneficiaries();
  }, [draftId, encodingBeneficiaries]);

  // Reconcile the saved Support Ecency setting into the visible list so the
  // modal shows exactly what publish will produce. Seeds the ecency row only
  // when the user has no explicit beneficiary list persisted for this draft;
  // an explicit list (created by any chip/add/remove action) is never touched.
  // The seeded row itself is not persisted: publish derives the same row from
  // the saved setting, and any user interaction persists the full list anyway.
  useEffect(() => {
    if (powerDown || handleSaveBeneficiary || !username || isEcencySupportBeneficiary(username)) {
      return;
    }

    // wait for a successful settings load; never seed from unknown state
    const savedPercent = supportSettingsQuery.data?.beneficiary_percent || 0;
    if (savedPercent <= 0) {
      return;
    }

    const _draftId = draftId || DEFAULT_USER_DRAFT_ID + username;
    if (beneficiariesMap && Object.prototype.hasOwnProperty.call(beneficiariesMap, _draftId)) {
      return;
    }

    const weight = savedPercent * 100;
    setBeneficiaries((prevBeneficiaries) => {
      if (
        prevBeneficiaries.some((item) => isEcencySupportBeneficiary(item.account)) ||
        !prevBeneficiaries.length ||
        prevBeneficiaries[0].account !== username ||
        prevBeneficiaries[0].weight < weight ||
        prevBeneficiaries.length - 1 >= 8
      ) {
        return prevBeneficiaries;
      }

      const next = prevBeneficiaries.map((item, index) =>
        index === 0 ? { ...item, weight: item.weight - weight } : item,
      );
      next.push({ account: ECENCY_SUPPORT_ACCOUNT, weight });
      return next;
    });
  }, [supportSettingsQuery.data, beneficiariesMap, beneficiaries, draftId, username, powerDown]);

  useEffect(() => {
    setDisableDone(newEditable);
  }, [newEditable]);

  const readPowerDownBeneficiaries = () => {
    const tempBeneficiaries = [
      { account: username, weight: 10000, autoPowerUp: false },
      ...(powerDownBeneficiaries as Beneficiary[]),
    ];

    if (isArray(tempBeneficiaries) && tempBeneficiaries.length > 0) {
      // weight correction algorithm.
      let othersWeight = 0;
      tempBeneficiaries.forEach((item, index) => {
        if (index > 0) {
          othersWeight += item.weight;
        }
      });
      tempBeneficiaries[0].weight = 10000 - othersWeight;

      setBeneficiaries([...tempBeneficiaries]);
    }
  };

  const initBeneficiaries = async () => {
    const _draftId = draftId || DEFAULT_USER_DRAFT_ID + username;

    let savedBeneficiareis: Beneficiary[] = [DEFAULT_BENEFICIARY, ...(encodingBeneficiaries || [])];

    if (beneficiariesMap && beneficiariesMap[_draftId]) {
      const _cachedBenef = beneficiariesMap[_draftId];
      const _filteredBenef = _cachedBenef.filter((bene) => !isThreeSpeakBeneficiary(bene.account));
      savedBeneficiareis = [...savedBeneficiareis, ..._filteredBenef];
    }

    if (savedBeneficiareis?.length > 1) {
      // weight correction algorithm.
      let othersWeight = 0;
      savedBeneficiareis.forEach((item, index) => {
        if (index > 0) {
          othersWeight += item.weight;
        }
      });
      savedBeneficiareis[0].weight = 10000 - othersWeight;
      setBeneficiaries(savedBeneficiareis);
    }
  };

  const _saveBeneficiaries = (value: Beneficiary[]) => {
    const filteredBeneficiaries = value.filter((item) => item.account !== username); // remove default beneficiary from array while saving
    if (handleSaveBeneficiary) {
      handleSaveBeneficiary(filteredBeneficiaries);
    } else {
      dispatch(
        setBeneficiariesAction(draftId || DEFAULT_USER_DRAFT_ID + username, filteredBeneficiaries),
      );
    }
  };

  const _onSavePress = () => {
    if (newEditable) {
      beneficiaries.push({
        account: newUsername,
        weight: newWeight,
        autoPowerUp: newAutoPowerUp,
      });
    }
    _saveBeneficiaries(beneficiaries);
    _resetInputs(false);
  };

  const _addAccount = () => {
    if (isUsernameValid && isWeightValid) {
      beneficiaries.push({
        account: newUsername,
        weight: newWeight,
      });
      setBeneficiaries([...beneficiaries]);
    }

    setIsUsernameValid(false);
    setIsWeightValid(false);
    setNewWeight(0);
    setNewUsername('');
    setNewEditable(true);
  };

  const _onWeightInputChange = (value: string) => {
    const parsed = parseInt(value, 10);
    const numericText = Number.isFinite(parsed) && parsed >= 0 ? `${parsed}` : '';
    if (numericText !== value) {
      // Filter out non-numeric / negative input by re-feeding sanitized value to the field.
      weightInputRef.current?.setText(numericText);
    }

    const sanitized = numericText === '' ? 0 : parseInt(numericText, 10);
    const _value = sanitized * 100;
    const _diff = _value - newWeight;
    const newAuthorWeight = beneficiaries[0].weight - _diff;
    beneficiaries[0].weight = newAuthorWeight;

    setNewWeight(_value);
    setIsWeightValid(_value >= 0 && newAuthorWeight >= 0);
    setBeneficiaries([...beneficiaries]);
  };

  const _lookupAccounts = debounce((username) => {
    queryClient.fetchQuery(lookupAccountsQueryOptions(username)).then((res) => {
      const isValid = res.includes(username);
      // check if username duplicates else lookup contacts, done here to avoid debounce and post call mismatch
      const notExistAlready = !beneficiaries.find((item) => item.account === username);
      setIsUsernameValid(isValid && notExistAlready);
    });
  }, 1000);

  const _onUsernameInputChange = (value) => {
    setNewUsername(value);
    _lookupAccounts(value);
  };

  const _resetInputs = (adjustWeight = true) => {
    if (newWeight && adjustWeight) {
      beneficiaries[0].weight += newWeight;
      setBeneficiaries([...beneficiaries]);
    }

    setNewWeight(0);
    setNewEditable(false);
    setIsWeightValid(false);
    setIsUsernameValid(false);
    setNewUsername('');
  };

  // one-tap voluntary Support Ecency beneficiary
  const _savedSupportPercent = supportSettingsQuery.data?.beneficiary_percent || 0;
  const _supportPercent = _savedSupportPercent > 0 ? _savedSupportPercent : DEFAULT_SUPPORT_PERCENT;
  const _ecencyBeneficiary = beneficiaries.find((item) => isEcencySupportBeneficiary(item.account));
  const isSupportActive = !!_ecencyBeneficiary;
  const _chipPercent = _ecencyBeneficiary
    ? Math.round(_ecencyBeneficiary.weight / 100)
    : _supportPercent;

  // The settings update writes BOTH fields (backend contract), so it must
  // read-modify-write from a successfully loaded payload. While settings are
  // still loading or errored, the chip only changes this post's beneficiary
  // list and skips the preference save; anything else could wipe the saved
  // curation percent or overwrite a non-default beneficiary percent.
  const _persistSupportPreference = (beneficiaryPercent: number) => {
    const _settings = supportSettingsQuery.data;
    if (!isValidSupportSettings(_settings)) {
      return;
    }
    supportSettingsMutation.mutate({
      beneficiary_percent: beneficiaryPercent,
      curation_percent: _settings.curation_percent || 0,
    });
  };

  const _onSupportEcencyPress = () => {
    if (isSupportActive) {
      const _removedWeight = beneficiaries.reduce(
        (sum, item) => (isEcencySupportBeneficiary(item.account) ? sum + item.weight : sum),
        0,
      );
      const _beneficiaries = beneficiaries.filter(
        (item) => !isEcencySupportBeneficiary(item.account),
      );
      _beneficiaries[0] = {
        ..._beneficiaries[0],
        weight: _beneficiaries[0].weight + _removedWeight,
      };
      setBeneficiaries(_beneficiaries);
      _saveBeneficiaries(_beneficiaries);
      _persistSupportPreference(0);
    } else {
      const _weight = _supportPercent * 100;
      // author row must retain non-negative weight and hive allows max 8 routes
      if (beneficiaries[0].weight < _weight || beneficiaries.length - 1 >= 8) {
        dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
        return;
      }
      const _beneficiaries = beneficiaries.map((item, index) =>
        index === 0 ? { ...item, weight: item.weight - _weight } : item,
      );
      _beneficiaries.push({ account: ECENCY_SUPPORT_ACCOUNT, weight: _weight });
      setBeneficiaries(_beneficiaries);
      _saveBeneficiaries(_beneficiaries);
      _persistSupportPreference(_supportPercent);
    }
  };

  const _renderSupportEcency = () => {
    if (powerDown || !username || isEcencySupportBeneficiary(username)) {
      return null;
    }

    return (
      <TouchableOpacity style={styles.supportEcencyContainer} onPress={_onSupportEcencyPress}>
        <CheckBox locked isChecked={isSupportActive} clicked={_onSupportEcencyPress} />
        <Text style={styles.supportEcencyLabel}>
          {intl.formatMessage({ id: 'editor.support_ecency' }, { percent: _chipPercent })}
        </Text>
      </TouchableOpacity>
    );
  };

  const _renderHeader = () => (
    <View style={styles.inputWrapper}>
      {powerDown && (
        <View style={{ ...styles.checkBoxHeader, marginTop: 4 }}>
          <Text style={styles.contentLabel}>
            {intl.formatMessage({ id: 'transfer.auto_vests' })}
          </Text>
        </View>
      )}

      <View style={{ ...styles.weightInput, marginTop: 4 }}>
        <Text style={styles.contentLabel}>
          {intl.formatMessage({
            id: 'beneficiary_modal.percent',
          })}
        </Text>
      </View>
      <View style={{ ...styles.usernameInput, marginTop: 4, marginLeft: 28 }}>
        <Text style={styles.contentLabel}>
          {intl.formatMessage({
            id: 'beneficiary_modal.username',
          })}
        </Text>
      </View>
    </View>
  );

  const _handleCheckboxClick = (value, isCheck) => {
    setNewAutoPowerUp(isCheck);
  };
  const _renderCheckBox = ({ locked, isChecked }: { locked: boolean; isChecked: boolean }) => (
    <View style={styles.checkBoxContainer}>
      <CheckBox
        locked={locked}
        isChecked={isChecked}
        clicked={_handleCheckboxClick}
        value={newAutoPowerUp}
      />
    </View>
  );

  const _renderInput = () => {
    return (
      <View style={styles.inputWrapper}>
        {powerDown && _renderCheckBox({ locked: false, isChecked: false })}
        <View style={styles.weightInput}>
          <FormInput
            ref={weightInputRef}
            isValid={isWeightValid}
            value={`${newWeight / 100}`}
            inputStyle={styles.weightFormInput}
            wrapperStyle={styles.weightFormInputWrapper}
            onChange={(value) => _onWeightInputChange(value)}
            selectTextOnFocus={true}
            autoFocus={true}
            returnKeyType="next"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.usernameInput}>
          <FormInput
            rightIconName="at"
            iconType="MaterialCommunityIcons"
            isValid={isUsernameValid}
            onChange={(value) => _onUsernameInputChange(value.trim())}
            placeholder={intl.formatMessage({
              id: 'beneficiary_modal.username',
            })}
            type="username"
            isFirstImage
            returnKeyType="done"
            value={newUsername}
            onSubmitEditing={isWeightValid && isUsernameValid && _onSavePress}
            inputStyle={styles.usernameInput}
            wrapperStyle={styles.usernameFormInputWrapper}
          />
        </View>

        {isWeightValid && isUsernameValid ? (
          <IconButton
            name="check"
            iconType="MaterialCommunityIcons"
            color={EStyleSheet.value('$white')}
            iconStyle={{ marginTop: 2 }}
            size={24}
            style={styles.doneButton}
            onPress={_onSavePress}
          />
        ) : (
          <View style={{ width: 28 }} />
        )}
      </View>
    );
  };

  const _renderFooter = () => (
    <>
      {newEditable && _renderInput()}
      <View style={{ marginTop: 20, marginBottom: 32 }}>
        <TextButton
          text={
            newEditable
              ? intl.formatMessage({
                  id: 'beneficiary_modal.cancel',
                })
              : intl.formatMessage({
                  id: 'beneficiary_modal.addAccount',
                })
          }
          onPress={newEditable ? _resetInputs : _addAccount}
          textStyle={{
            color: EStyleSheet.value('$primaryBlue'),
            fontWeight: 'bold',
            textAlign: 'left',
          }}
        />
      </View>
    </>
  );

  const _renderItem = (item, index) => {
    const _isCurrentUser = item.account === username;

    const _onRemovePress = () => {
      beneficiaries[0].weight += item.weight;
      const removedBeneficiary = beneficiaries.splice(index, 1);
      setBeneficiaries([...beneficiaries]);
      if (handleRemoveBeneficiary) {
        handleRemoveBeneficiary(removedBeneficiary[0]);
        return;
      }
      _saveBeneficiaries(beneficiaries);
    };

    return (
      <View key={`benef-${item.account}-${index}`} style={styles.inputWrapper}>
        {powerDown && _renderCheckBox({ locked: true, isChecked: item.autoPowerUp })}
        <View style={styles.weightInput}>
          <FormInput
            isValid={true}
            isEditable={false}
            value={`${item.weight / 100}`}
            inputStyle={styles.weightFormInput}
            wrapperStyle={styles.weightFormInputWrapper}
          />
        </View>

        <View style={styles.usernameInput}>
          <FormInput
            isValid={true}
            isEditable={false}
            type="username"
            isFirstImage
            value={item.account}
            inputStyle={styles.usernameInput}
            wrapperStyle={styles.usernameFormInputWrapper}
          />
        </View>
        {!_isCurrentUser && !isThreeSpeakBeneficiary(item.account) ? (
          <IconButton
            name="close"
            iconType="MaterialCommunityIcons"
            size={24}
            color={EStyleSheet.value('$primaryBlack')}
            iconStyle={{ paddingLeft: 8 }}
            onPress={_onRemovePress}
          />
        ) : (
          <View style={{ width: 30 }} />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={labelStyle || styles.settingLabel}>
        {label || intl.formatMessage({ id: 'editor.beneficiaries' })}
      </Text>

      {_renderSupportEcency()}
      {_renderHeader()}
      {beneficiaries.map(_renderItem)}
      {_renderFooter()}
    </View>
  );
};

export default BeneficiarySelectionContent;
