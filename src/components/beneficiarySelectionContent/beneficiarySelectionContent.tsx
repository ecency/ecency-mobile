import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, TouchableOpacity } from 'react-native';
import { useIntl } from 'react-intl';
import { isArray, debounce } from 'lodash';

import EStyleSheet from 'react-native-extended-stylesheet';
import styles from './styles';

import { useAppDispatch, useAppSelector } from '../../hooks';
import { BeneficiaryModal, CheckBox, FormInput, IconButton, TextButton } from '..';
import { Beneficiary } from '../../redux/reducers/editorReducer';
import { lookupAccounts } from '../../providers/hive/dhive';
import { TEMP_BENEFICIARIES_ID } from '../../redux/constants/constants';
import {
  removeBeneficiaries,
  setBeneficiaries as setBeneficiariesAction,
} from '../../redux/actions/editorActions';

interface BeneficiarySelectionContentProps {
  draftId: string;
  setDisableDone: (value: boolean) => void;
  powerDown?: boolean;
  label?: string;
  labelStyle?: string;
  powerDownBeneficiaries?: Beneficiary[];
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
  handleSaveBeneficiary,
  handleRemoveBeneficiary,
}: BeneficiarySelectionContentProps) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const beneficiariesMap = useAppSelector((state) => state.editor.beneficiariesMap);
  const username = useAppSelector((state) => state.account.currentAccount.name);
  const DEFAULT_BENEFICIARY = { account: username, weight: 10000 };

  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([
    { account: username, weight: 10000, autoPowerUp: false },
  ]);

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
    if (draftId) {
      readTempBeneficiaries();
    }
  }, [draftId]);

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

  const readTempBeneficiaries = async () => {
    if (beneficiariesMap) {
      const savedBeneficiareis = beneficiariesMap[draftId || TEMP_BENEFICIARIES_ID];
      const tempBeneficiaries =
        savedBeneficiareis && savedBeneficiareis.length
          ? [DEFAULT_BENEFICIARY, ...beneficiariesMap[draftId || TEMP_BENEFICIARIES_ID]]
          : [DEFAULT_BENEFICIARY];

      if (isArray(tempBeneficiaries) && tempBeneficiaries.length > 0) {
        // weight correction algorithm.
        let othersWeight = 0;
        tempBeneficiaries.forEach((item, index) => {
          if (index > 0) {
            othersWeight += item.weight;
          }
        });
        tempBeneficiaries[0].weight = 10000 - othersWeight;
        setBeneficiaries(tempBeneficiaries);
      }
    }
  };

  const _saveBeneficiaries = (value: Beneficiary[]) => {
    const filteredBeneficiaries = value.filter((item) => item.account !== username); // remove default beneficiary from array while saving
    if (handleSaveBeneficiary) {
      handleSaveBeneficiary(filteredBeneficiaries);
    } else {
      dispatch(setBeneficiariesAction(draftId || TEMP_BENEFICIARIES_ID, filteredBeneficiaries));
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
    const _value = (parseInt(value, 10) || 0) * 100;

    const _diff = _value - newWeight;
    const newAuthorWeight = beneficiaries[0].weight - _diff;
    beneficiaries[0].weight = newAuthorWeight;

    setNewWeight(_value);
    setIsWeightValid(_value >= 0 && newAuthorWeight >= 0);
    setBeneficiaries([...beneficiaries]);
  };

  const _lookupAccounts = debounce((username) => {
    lookupAccounts(username).then((res) => {
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
      beneficiaries[0].weight = beneficiaries[0].weight + newWeight;
      setBeneficiaries([...beneficiaries]);
    }

    setNewWeight(0);
    setNewEditable(false);
    setIsWeightValid(false);
    setIsUsernameValid(false);
    setNewUsername('');
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

  const _renderItem = ({ item, index }) => {
    const _isCurrentUser = item.account === username;

    const _onRemovePress = () => {
      beneficiaries[0].weight = beneficiaries[0].weight + item.weight;
      const removedBeneficiary = beneficiaries.splice(index, 1);
      setBeneficiaries([...beneficiaries]);
      if (handleRemoveBeneficiary) {
        handleRemoveBeneficiary(removedBeneficiary[0]);
        return;
      }
      _saveBeneficiaries(beneficiaries);
    };

    return (
      <View style={styles.inputWrapper}>
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
        {!_isCurrentUser ? (
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
      <FlatList
        data={beneficiaries}
        renderItem={_renderItem}
        ListHeaderComponent={_renderHeader}
        showsVerticalScrollIndicator={false}
      />
      {_renderFooter()}
    </View>
  );
};

export default BeneficiarySelectionContent;
