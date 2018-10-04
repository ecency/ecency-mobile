import React, { Component } from 'react';
import { Text, Picker, View } from 'react-native';
import Slider from 'react-native-slider';
import {
  Container, Button, Content, Card, Input,
} from 'native-base';
import { getUserData, getAuthStatus } from '../../realm/realm';
import {
  getUser,
  transferToken,
  delegate,
  globalProps,
  transferToVesting,
  withdrawVesting,
} from '../../providers/steem/dsteem';
import { decryptKey } from '../../utils/crypto';

class WalletPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      receiver: '',
      amount: '',
      asset: 'STEEM',
      memo: '',
      user: {},
      avail: '',
      globalProps: '',
      vestSteem: '',
      percent: 0.05,
      value: 0.0,
    };
  }

  async componentDidMount() {
    let isLoggedIn;
    let user;
    let userData;
    let avail;
    let vestSteem;
    let globalProperties;

    await getAuthStatus().then((res) => {
      isLoggedIn = res;
    });

    if (isLoggedIn) {
      await getUserData().then((res) => {
        userData = Array.from(res);
      });

      user = await getUser(userData[0].username);

      await this.setState({
        user,
      });

      globalProperties = await globalProps();
      avail = parseFloat(this.state.user.vesting_shares)
        - (parseFloat(this.state.user.to_withdraw)
          - parseFloat(this.state.user.withdrawn))
          / 1e6
        - parseFloat(this.state.user.delegated_vesting_shares);
      vestSteem = parseFloat(
        parseFloat(globalProperties.total_vesting_fund_steem)
          * (parseFloat(avail)
            / parseFloat(globalProperties.total_vesting_shares)),
        6,
      );

      console.log(avail);
      console.log(vestSteem);
      console.log(globalProperties);

      console.log(
        (parseFloat(globalProperties.total_vesting_fund_steem)
          / parseFloat(globalProperties.total_vesting_shares))
          * parseFloat(avail * this.state.value),
      );
      await this.setState({
        avail,
        vestSteem,
        globalProps: globalProperties,
      });
    }
  }

  sendSteem = async () => {
    let userData;
    let activeKey;

    transferData = {
      from: this.state.user.name,
      to: this.state.receiver,
      amount: `${this.state.amount} ${this.state.asset}`,
      memo: this.state.memo,
    };

    await getUserData()
      .then((result) => {
        userData = Array.from(result);
        activeKey = userData[0].activeKey;
        console.log(userData);
        console.log(activeKey);
      })
      .then(() => {
        activeKey = decryptKey(activeKey, 'pinCode');
        transferToken(transferData, activeKey);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  delegateSP = async () => {
    let userData;
    let activeKey;

    vestSteem = parseFloat(
      parseFloat(this.state.globalProps.total_vesting_fund_steem)
        * (parseFloat(this.state.avail * this.state.value)
          / parseFloat(this.state.globalProps.total_vesting_shares)),
      6,
    );
    const toWithdraw = (vestSteem * 1e6)
      / (parseFloat(this.state.globalProps.total_vesting_fund_steem)
        / (parseFloat(this.state.globalProps.total_vesting_shares) / 1e6));
    console.log(toWithdraw);
    data = {
      delegator: this.state.user.name,
      delegatee: 'demo',
      vesting_shares: `${toWithdraw.toFixed(6)} VESTS`,
    };
    await getUserData().then((res) => {
      userData = Array.from(res);
    });

    activeKey = decryptKey(userData[0].activeKey, 'pinCode');

    delegate(data, activeKey)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  powerUpSteem = async () => {
    let userData;
    let activeKey;

    await getUserData().then((res) => {
      userData = Array.from(res);
    });

    activeKey = decryptKey(userData[0].activeKey, 'pinCode');

    const data = {
      from: this.state.user.name,
      to: 'hsynterkr',
      amount: '001.000 STEEM',
    };

    transferToVesting(data, activeKey)
      .then((res) => {
        console.log(res);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  powerDownSteem = async () => {
    let userData;
    let activeKey;
    let avail;

    await getUserData().then((res) => {
      userData = Array.from(res);
    });

    activeKey = decryptKey(userData[0].activeKey, 'pinCode');

    avail = parseFloat(this.state.user.vesting_shares)
      - (parseFloat(this.state.user.to_withdraw)
        - parseFloat(this.state.user.withdrawn))
        / 1e6
      - parseFloat(this.state.user.delegated_vesting_shares);
    const vestSteem = parseFloat(
      parseFloat(this.state.globalProps.total_vesting_fund_steem)
        * (parseFloat(avail * this.state.value)
          / parseFloat(this.state.globalProps.total_vesting_shares)),
      6,
    );
    const toWithdraw = (vestSteem * 1e6)
      / (parseFloat(this.state.globalProps.total_vesting_fund_steem)
        / (parseFloat(this.state.globalProps.total_vesting_shares) / 1e6));

    const data = {
      account: this.state.user.name,
      vesting_shares: `${toWithdraw.toFixed(6)} VESTS`,
    };

    withdrawVesting(data, activeKey)
      .then((result) => {
        console.log(result);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  render() {
    return (
      <Container>
        <Content>
          <Card>
            <Text>
STEEM Balance:
              {this.state.user.balance}
            </Text>
          </Card>
          <Card>
            <Text>
SBD Balance:
              {this.state.user.sbd_balance}
            </Text>
          </Card>
          <Card>
            <Text>
STEEM Power:
              {this.state.user.steem_power}
              {' '}
SP
            </Text>
            <Text>
              Received STEEM Power:
              {' '}
              {this.state.user.received_steem_power}
              {' '}
SP
            </Text>
            <Text>
              Delegated Power Power:
              {' '}
              {this.state.user.delegated_steem_power}
              {' '}
SP
            </Text>
          </Card>
          <Card>
            <Text>
Saving STEEM Balance:
              {this.state.user.savings_balance}
            </Text>
            <Text>
              Saving STEEM Balance:
              {' '}
              {this.state.user.savings_sbd_balance}
            </Text>
          </Card>

          <Card>
            <Input
              style={{
                borderColor: 'lightgray',
                borderWidth: 1,
                borderRadius: 20,
                margin: 10,
              }}
              autoCapitalize="none"
              placeholder="Recipient"
              onChangeText={user => this.setState({ receiver: user })}
              value={this.state.receiver}
            />
            <Input
              style={{
                borderColor: 'lightgray',
                borderWidth: 1,
                borderRadius: 20,
                margin: 10,
              }}
              placeholder="amount"
              onChangeText={amount => this.setState({ amount })}
              value={this.state.amount}
            />
            <Input
              style={{
                borderColor: 'lightgray',
                borderWidth: 1,
                borderRadius: 20,
                margin: 10,
              }}
              placeholder="memo"
              onChangeText={memo => this.setState({ memo })}
              value={this.state.memo}
            />
            <View style={{ flexDirection: 'row' }}>
              <Picker
                note
                mode="dropdown"
                style={{ width: 120, flex: 0.5 }}
                selectedValue={this.state.asset}
                onValueChange={(itemValue, itemIndex) => this.setState({ asset: itemValue })
                }
              >
                <Picker.Item label="STEEM" value="STEEM" />
                <Picker.Item label="SBD" value="SBD" />
              </Picker>
              <Button onPress={this.sendSteem} style={{ margin: 10 }}>
                <Text style={{ color: 'white' }}>Send</Text>
              </Button>
            </View>

            <View
              style={{
                margin: 5,
                padding: 5,
                borderWidth: 1,
                borderColor: 'gray',
                borderRadius: 10,
              }}
            >
              <Slider
                style={{ flex: 0.75 }}
                minimumTrackTintColor="#13a9d6"
                trackStyle={{ height: 2, borderRadius: 1 }}
                thumbStyle={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: 'white',
                  shadowColor: 'black',
                  shadowOffset: { width: 0, height: 2 },
                  shadowRadius: 2,
                  shadowOpacity: 0.35,
                }}
                thumbTintColor="#007ee5"
                value={this.state.value}
                onValueChange={(value) => {
                  this.setState({
                    value,
                    percent: Math.floor(value.toFixed(2) * 100),
                  });
                }}
              />
              <Text>
                Total:
                {' '}
                {(parseInt(this.state.vestSteem) * this.state.percent) / 100}
                {' '}
SP
              </Text>
              <Text>
                {Math.floor(this.state.value * 100)}
%
              </Text>
              <Button
                onPress={this.delegateSP}
                style={{ margin: 10, alignSelf: 'flex-end' }}
              >
                <Text style={{ color: 'white' }}>Delegate</Text>
              </Button>
            </View>

            <View
              style={{
                margin: 5,
                padding: 5,
                borderWidth: 1,
                borderColor: 'gray',
                borderRadius: 10,
              }}
            >
              <Button
                onPress={this.powerUpSteem}
                style={{ margin: 10, alignSelf: 'flex-start' }}
              >
                <Text style={{ color: 'white' }}>Power Up</Text>
              </Button>
            </View>

            <View
              style={{
                margin: 5,
                padding: 5,
                borderWidth: 1,
                borderColor: 'gray',
                borderRadius: 10,
              }}
            >
              <Slider
                style={{ flex: 0.75 }}
                minimumTrackTintColor="#13a9d6"
                trackStyle={{ height: 2, borderRadius: 1 }}
                thumbStyle={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: 'white',
                  shadowColor: 'black',
                  shadowOffset: { width: 0, height: 2 },
                  shadowRadius: 2,
                  shadowOpacity: 0.35,
                }}
                thumbTintColor="#007ee5"
                value={this.state.value}
                onValueChange={(value) => {
                  this.setState(
                    {
                      value,
                      percent: Math.floor(value.toFixed(2) * 100),
                    },
                    () => {
                      const avail = parseFloat(this.state.user.vesting_shares)
                        - (parseFloat(this.state.user.to_withdraw)
                          - parseFloat(this.state.user.withdrawn))
                          / 1e6
                        - parseFloat(this.state.user.delegated_vesting_shares);
                      const vestSteem = parseFloat(
                        parseFloat(
                          this.state.globalProps.total_vesting_fund_steem,
                        )
                          * (parseFloat(avail * this.state.value)
                            / parseFloat(
                              this.state.globalProps.total_vesting_shares,
                            )),
                        6,
                      );
                      console.log(vestSteem);
                      console.log(
                        (vestSteem * 1e6)
                          / (parseFloat(
                            this.state.globalProps.total_vesting_fund_steem,
                          )
                            / (parseFloat(
                              this.state.globalProps.total_vesting_shares,
                            )
                              / 1e6)),
                      );
                    },
                  );
                }}
              />
              <Text>
                Total Steem Power:
                {' '}
                {(parseInt(this.state.vestSteem) * this.state.percent) / 100}
                {' '}
SP
              </Text>
              <Text>
                Estimated Weekly:
                {' '}
                {Math.floor(
                  ((
                    (parseInt(this.state.vestSteem) * this.state.percent)
                    / 100
                  ).toFixed(0)
                    / 13)
                    * 100,
                ) / 100}
                {' '}
                SP
              </Text>
              <Text>
                {Math.floor(this.state.value * 100)}
%
              </Text>
              <Button
                onPress={this.powerDownSteem}
                style={{ margin: 10, alignSelf: 'flex-end' }}
              >
                <Text style={{ color: 'white' }}>Power Down</Text>
              </Button>
            </View>
          </Card>
        </Content>
      </Container>
    );
  }
}
export default WalletPage;
