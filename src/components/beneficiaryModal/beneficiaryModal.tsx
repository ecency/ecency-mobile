import React, { useState, useEffect } from 'react';
import { View, FlatList, Text } from 'react-native';
import { useIntl } from 'react-intl';
import { isArray, debounce } from 'lodash';

import EStyleSheet from 'react-native-extended-stylesheet';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { lookupAccounts } from '../../providers/hive/dhive';

import { FormInput, MainButton, TextButton } from '..';

import styles from './beneficiaryModalStyles';
import IconButton from '../iconButton';
import { useAppSelector } from '../../hooks';
import { Beneficiary } from '../../redux/reducers/editorReducer';
import { TEMP_DRAFT_ID } from '../../redux/constants/constants';

interface BeneficiaryModal {
  username: string;
  draftId: string;
  handleOnSaveBeneficiaries: () => void;
}

const BeneficiaryModal = ({ username, handleOnSaveBeneficiaries, draftId }) => {
  const intl = useIntl();

  const beneficiariesMap = useAppSelector((state) => state.editor.beneficiariesMap);

  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([
    { account: username, weight: 10000, isValid: true },
  ]);

  const [newUsername, setNewUsername] = useState('');
  const [newWeight, setNewWeight] = useState(0);
  const [isUsernameValid, setIsUsernameValid] = useState(false);
  const [isWeightValid, setIsWeightValid] = useState(false);
  const [newEditable, setNewEditable] = useState(false);

  useEffect(() => {
    readTempBeneficiaries();
  }, [draftId]);

  const readTempBeneficiaries = async () => {
    if (beneficiariesMap) {
      const tempBeneficiaries = beneficiariesMap[draftId || TEMP_DRAFT_ID];

      if (isArray(tempBeneficiaries)) {
        tempBeneficiaries.forEach((item) => {
          item.isValid = true;
        });
        setBeneficiaries(tempBeneficiaries);
      }
    }
  };

  const _onSavePress = () => {
    if (newEditable) {
      beneficiaries.push({
        account: newUsername,
        weight: newWeight,
      });
    }
    handleOnSaveBeneficiaries(beneficiaries);
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

  const _onWeightInputChange = (value) => {
    const _value = (parseInt(value, 10) || 0) * 100;
    const _diff = _value - newWeight;
    beneficiaries[0].weight -= _diff;
    setNewWeight(_value);
    setIsWeightValid(_value > 0 && _value <= 10000);
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

  const _isValid = () => {
    return !newEditable || (isUsernameValid && isWeightValid);
  };

  const _renderHeader = () => (
    <View style={styles.inputWrapper}>
      <View style={[styles.weightInput, { alignItems: 'center' }]}>
        <Text style={styles.text}>
          {intl.formatMessage({
            id: 'beneficiary_modal.percent',
          })}
        </Text>
      </View>
      <View style={[styles.usernameInput, { alignItems: 'center' }]}>
        <Text style={styles.text}>
          {intl.formatMessage({
            id: 'beneficiary_modal.username',
          })}
        </Text>
      </View>
    </View>
  );

  const _renderInput = () => {
    const _onCancelPress = () => {
      if (newWeight) {
        beneficiaries[0].weight += newWeight;
        setBeneficiaries([...beneficiaries]);
        setNewWeight(0);
      }
      setNewEditable(false);
      setIsWeightValid(false);
      setIsUsernameValid(false);
      setNewUsername('');
    };

    return (
      <View style={styles.inputWrapper}>
        <View style={styles.weightInput}>
          <FormInput
            isValid={isWeightValid}
            value={`${newWeight / 100}`}
            inputStyle={styles.weightFormInput}
            wrapperStyle={styles.weightFormInputWrapper}
            onChange={(value) => _onWeightInputChange(value)}
            onBlur={() => {
              console.log('pressed');
            }} // _onBlur(item)}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.usernameInput}>
          <FormInput
            rightIconName="at"
            iconType="MaterialCommunityIcons"
            isValid={isUsernameValid}
            onChange={(value) => _onUsernameInputChange(value)}
            placeholder={intl.formatMessage({
              id: 'beneficiary_modal.username',
            })}
            type="username"
            isFirstImage
            value={newUsername}
            inputStyle={styles.usernameInput}
            wrapperStyle={styles.usernameFormInputWrapper}
          />
        </View>

        <IconButton
          name="close"
          iconType="MaterialCommunityIcons"
          color={EStyleSheet.value('$primaryBlack')}
          size={24}
          iconStyle={{ paddingLeft: 8 }}
          onPress={_onCancelPress}
        />
      </View>
    );
  };

  const _renderFooter = () => (
    <>
      {newEditable && _renderInput()}
      <View style={{ marginTop: 20, marginBottom: 32 }}>
        <TextButton
          text={intl.formatMessage({
            id: 'beneficiary_modal.addAccount',
          })}
          disabled={!isAllValid}
          onPress={_addAccount}
          textStyle={{
            color: EStyleSheet.value(isAllValid ? '$primaryBlue' : '$iconColor'),
            fontWeight: 'bold',
          }}
        />
      </View>
    </>
  );

  const _renderItem = ({ item, index }) => {
    const _isCurrentUser = item.account === username;

    const _onRemovePress = () => {
      beneficiaries[0].weight += item.weight;
      beneficiaries.splice(index, 1);
      setBeneficiaries([...beneficiaries]);
    };

    return (
      <View style={styles.inputWrapper}>
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

  const isAllValid = _isValid();

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView style={styles.bodyWrapper}>
        <FlatList
          data={beneficiaries}
          renderItem={_renderItem}
          ListHeaderComponent={_renderHeader}
          showsVerticalScrollIndicator={false}
        />
        {_renderFooter()}
      </KeyboardAwareScrollView>

      <View style={styles.footerWrapper}>
        <MainButton
          style={styles.saveButton}
          isDisable={!_isValid()}
          onPress={_onSavePress}
          text={intl.formatMessage({
            id: 'beneficiary_modal.save',
          })}
        />
      </View>
    </View>
  );
};

export default BeneficiaryModal;
