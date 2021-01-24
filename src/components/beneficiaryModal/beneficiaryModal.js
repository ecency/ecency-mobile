import React, { useState, useCallback, useEffect } from 'react';
import { View, FlatList, Text } from 'react-native';
import { useIntl } from 'react-intl';
import AsyncStorage from '@react-native-community/async-storage';
import { isArray, remove } from 'lodash';

import { lookupAccounts } from '../../providers/hive/dhive';

import { FormInput, MainButton, Tag } from '..';

import styles from './beneficiaryModalStyles';

const BeneficiaryModal = ({ username, handleOnSaveBeneficiaries, isDraft }) => {
  const intl = useIntl();

  const [beneficiaries, setBeneficiaries] = useState([
    { account: username, weight: 10000, isValid: true },
  ]);

  useEffect(() => {
    if (!isDraft) {
      readTempBeneficiaries();
    }
  }, []);

  const readTempBeneficiaries = async () => {
    const tempBeneficiariesString = await AsyncStorage.getItem('temp-beneficiaries');
    const tempBeneficiaries = JSON.parse(tempBeneficiariesString);

    if (isArray(tempBeneficiaries)) {
      tempBeneficiaries.forEach((item) => {
        item.isValid = true;
      });

      setBeneficiaries(tempBeneficiaries);
    }
  };

  const _addAccount = () => {
    setBeneficiaries([...beneficiaries, { account: '', weight: 0, isValid: false }]);
  };

  const _onWeightInputChange = (value, index) => {
    let _value = (parseInt(value, 10) || 0) * 100;

    const _diff = _value - beneficiaries[index].weight;
    beneficiaries[0].weight = beneficiaries[0].weight - _diff;
    beneficiaries[index].weight = _value;

    setBeneficiaries([...beneficiaries]);
  };

  const _onUsernameInputChange = (value, index) => {
    beneficiaries[index].account = value;

    setBeneficiaries([...beneficiaries]);

    lookupAccounts(value).then((res) => {
      const isValid =
        res.includes(value) &&
        beneficiaries[index].weight !== 0 &&
        beneficiaries[index].weight <= 10000;
      beneficiaries[index].isValid = isValid;
      setBeneficiaries([...beneficiaries]);
    });
  };

  const _isValid = () => {
    return beneficiaries.every((item) => item.isValid);
  };

  const _onBlur = (item, index) => {
    if (item.weight === 0) {
      const newBeneficiaries = [...beneficiaries];
      remove(newBeneficiaries, (current) => {
        return current.account === item.account;
      });

      setBeneficiaries(newBeneficiaries);
    }
  };

  const renderInputs = ({ item, index }) => {
    const _isCurrentUser = item.account === username;

    return (
      <View style={styles.inputWrapper}>
        <View style={styles.weightInput}>
          <FormInput
            isValid={_isCurrentUser || (item.weight !== 0 && item.weight <= 10000)}
            isEditable={!_isCurrentUser}
            value={`${item.weight / 100}`}
            inputStyle={styles.weightFormInput}
            wrapperStyle={styles.weightFormInputWrapper}
            onChange={(value) => _onWeightInputChange(value, index)}
            onBlur={() => _onBlur(item, index)}
          />
        </View>
        <View style={styles.usernameInput}>
          <FormInput
            rightIconName="at"
            iconType="MaterialCommunityIcons"
            isValid={_isCurrentUser || item.isValid}
            //isEditable={!_isCurrentUser}
            onChange={(value) => _onUsernameInputChange(value, index)}
            placeholder={intl.formatMessage({
              id: 'beneficiary_modal.username',
            })}
            type="username"
            isFirstImage
            value={item.account}
            inputStyle={styles.usernameInput}
            wrapperStyle={styles.usernameFormInputWrapper}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.bodyWrapper}>
        <FlatList
          data={beneficiaries}
          renderItem={renderInputs}
          ListHeaderComponent={() => (
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
          )}
          ListFooterComponent={() => (
            <View style={{ alignItems: 'flex-end', marginTop: 20 }}>
              <Tag
                value={intl.formatMessage({
                  id: 'beneficiary_modal.addAccount',
                })}
                isFilter
                disabled={!_isValid()}
                isPin={_isValid()}
                onPress={_addAccount}
              />
            </View>
          )}
        />
      </View>
      <View style={styles.footerWrapper}>
        <MainButton
          style={styles.saveButton}
          isDisable={!_isValid()}
          onPress={() => handleOnSaveBeneficiaries(beneficiaries)}
          text={intl.formatMessage({
            id: 'beneficiary_modal.save',
          })}
        />
      </View>
    </View>
  );
};

export default BeneficiaryModal;
