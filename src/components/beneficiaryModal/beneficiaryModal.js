import React, { useState, useCallback } from 'react';
import { View, FlatList, Text } from 'react-native';
import { useIntl } from 'react-intl';

import { lookupAccounts } from '../../providers/steem/dsteem';

import { FormInput, MainButton, Tag } from '..';

import styles from './beneficiaryModalStyles';

const BeneficiaryModal = ({ username, handleOnSaveBeneficiaries }) => {
  const intl = useIntl();

  const [beneficiaries, setBeneficiaries] = useState([
    { account: username, weight: 10000, isValid: true },
  ]);

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

  const renderInputs = useCallback(
    ({ item, index }) => {
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
                id: 'login.username',
              })}
              type="username"
              isFirstImage
              value={item.account}
              wrapperStyle={styles.usernameFormInputWrapper}
            />
          </View>
        </View>
      );
    },
    [beneficiaries],
  );

  return (
    <View style={styles.container}>
      <View style={styles.bodyWrapper}>
        <FlatList
          data={beneficiaries}
          renderItem={renderInputs}
          ListHeaderComponent={() => (
            <View style={styles.inputWrapper}>
              <View style={[styles.weightInput, { alignItems: 'center' }]}>
                <Text>Weight(%)</Text>
              </View>
              <View style={[styles.usernameInput, { alignItems: 'center' }]}>
                <Text>Username</Text>
              </View>
            </View>
          )}
          ListFooterComponent={() => (
            <View style={{ alignItems: 'flex-end', marginTop: 20 }}>
              <Tag
                value="Add Account"
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
          text="Save"
        />
      </View>
    </View>
  );
};

export default BeneficiaryModal;
