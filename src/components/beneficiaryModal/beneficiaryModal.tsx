import React, { useState, useEffect } from 'react';
import { View, FlatList, Text } from 'react-native';
import { useIntl } from 'react-intl';
import AsyncStorage from '@react-native-community/async-storage';
import { isArray, debounce } from 'lodash';

import { lookupAccounts } from '../../providers/hive/dhive';

import { FormInput, MainButton, Tag, TextButton } from '..';

import styles from './beneficiaryModalStyles';
import EStyleSheet from 'react-native-extended-stylesheet';

const BeneficiaryModal = ({ username, handleOnSaveBeneficiaries, isDraft }) => {
  const intl = useIntl();

  const [beneficiaries, setBeneficiaries] = useState([
    { account: username, weight: 10000},
  ]);
  const [validity, setValidity] = useState([{
    weightValid:true,
    usernameValid:true
  }])

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
    setBeneficiaries([...beneficiaries, { account: '', weight: 0}]);
    setValidity([...validity, {weightValid:false, usernameValid:false}])
  };

  const _onWeightInputChange = (value, index) => {
    let _value = (parseInt(value, 10) || 0) * 100;

    const _diff = _value - beneficiaries[index].weight;
    beneficiaries[0].weight = beneficiaries[0].weight - _diff;
    beneficiaries[index].weight = _value;

    validity[index].weightValid = _value > 0 && _value <= 10000;

    setBeneficiaries(beneficiaries);
    setValidity([...validity])
  };

  const _lookupAccounts = debounce((username, index)=>{
    lookupAccounts(username).then((res) => {
      const isValid = 
        res.includes(username) 
      validity[index].usernameValid = isValid;
      setValidity([...validity]);
    });
  }, 500) 

  const _onUsernameInputChange = (value, index) => {
    _lookupAccounts(value, index);

    beneficiaries[index].account = value;
    setBeneficiaries(beneficiaries);
  };

  const _isValid = () => {
    return validity.every((item) => (item.usernameValid && item.weightValid));
  };

  const _onBlur = (item) => {
    if (item.weight === 0) {
      const newBeneficiaries = [...beneficiaries];
      const newValidity = [...validity];

      const index = newBeneficiaries.findIndex((current)=>current.account === item.account);
      if(index >= 0){
        newBeneficiaries.splice(index, 1);
        newValidity.splice(index, 1);
      }

      setBeneficiaries(newBeneficiaries);
      setValidity(newValidity);
    }
  };


  const renderInput = ({ item, index }) => {
    const _isCurrentUser = item.account === username;
    const {weightValid, usernameValid}  = validity[index];

    return (
      <View style={styles.inputWrapper}>
        <View style={styles.weightInput}>
          <FormInput
            isValid={_isCurrentUser || weightValid}
            isEditable={!_isCurrentUser}
            value={`${item.weight / 100}`}
            inputStyle={styles.weightFormInput}
            wrapperStyle={styles.weightFormInputWrapper}
            onChange={(value) => _onWeightInputChange(value, index)}
            onBlur={() => _onBlur(item)}
          />
        </View>
        <View style={styles.usernameInput}>
          <FormInput
            rightIconName="at"
            iconType="MaterialCommunityIcons"
            isValid={_isCurrentUser || usernameValid}
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


  const isAllValid = _isValid();

  return (
    <View style={styles.container}>
      <View style={styles.bodyWrapper}>
        <FlatList
          data={beneficiaries}
          renderItem={renderInput}
          extraData={validity}
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
            <View style={{marginTop: 20 }}>
              <TextButton 
                text={intl.formatMessage({
                  id: 'beneficiary_modal.addAccount',
                })}
                disabled={!isAllValid}
                onPress={_addAccount}
                textStyle={{
                  color:EStyleSheet.value(isAllValid?'$primaryBlue':"$iconColor"),
                  fontWeight:'bold'
                }}
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
