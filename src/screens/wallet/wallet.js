import React from "react";
import { StatusBar, Text, Picker } from "react-native";
import {
    Container,
    Header,
    Left,
    Body,
    Right,
    Button,
    Icon,
    Title,
    Content,
    Card,
    Input,
    Form,
} from "native-base";
import { getUserData, getAuthStatus } from "../../realm/Realm";
import { getUser, transferToken } from "../../providers/steem/Dsteem";
import { decryptKey } from "../../utils/Crypto";

class WalletPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            receiver: "",
            amount: "",
            asset: "STEEM",
            memo: "",
            user: {},
        };
    }
    async componentWillMount() {
        let isLoggedIn;
        let user;
        let userData;

        await getAuthStatus().then(res => {
            isLoggedIn = res;
        });

        if (isLoggedIn == true) {
            await getUserData().then(res => {
                userData = Array.from(res);
            });

            user = await getUser(userData[0].username);

            this.setState({
                user: user,
            });
        }
    }

    sendSteem = async () => {
        let userData;
        let activeKey;

        transferData = {
            from: this.state.user.name,
            to: this.state.receiver,
            amount: this.state.amount + " " + this.state.asset,
            memo: this.state.memo,
        };

        await getUserData()
            .then(result => {
                userData = Array.from(result);
                activeKey = userData[0].activeKey;
                console.log(userData);
                console.log(activeKey);
            })
            .then(() => {
                activeKey = decryptKey(activeKey, "pinCode");
                transferToken(transferData, activeKey);
            })
            .catch(error => {
                console.log(error);
            });
    };

    render() {
        return (
            <Container style={{ top: StatusBar.currentHeight }}>
                <Header>
                    <Left>
                        <Button transparent>
                            <Icon name="menu" />
                        </Button>
                    </Left>
                    <Body>
                        <Title>Wallet</Title>
                    </Body>
                    <Right />
                </Header>
                <Content>
                    <Card>
                        <Text>STEEM Balance: {this.state.user.balance}</Text>
                    </Card>
                    <Card>
                        <Text>SBD Balance: {this.state.user.sbd_balance}</Text>
                    </Card>
                    <Card>
                        <Text>
                            STEEM Power: {this.state.user.steem_power} SP
                        </Text>
                        <Text>
                            Received STEEM Power:{" "}
                            {this.state.user.received_steem_power} SP
                        </Text>
                        <Text>
                            Delegated Power Power:{" "}
                            {this.state.user.delegated_steem_power} SP
                        </Text>
                    </Card>
                    <Card>
                        <Text>
                            Saving STEEM Balance:{" "}
                            {this.state.user.savings_balance}
                        </Text>
                        <Text>
                            Saving STEEM Balance:{" "}
                            {this.state.user.savings_sbd_balance}
                        </Text>
                    </Card>

                    <Card>
                        <Input
                            autoCapitalize="none"
                            placeholder="Recipient"
                            onChangeText={user =>
                                this.setState({ receiver: user })
                            }
                            value={this.state.receiver}
                        />
                        <Input
                            placeholder="amount"
                            onChangeText={amount =>
                                this.setState({ amount: amount })
                            }
                            value={this.state.amount}
                        />
                        <Input
                            placeholder="memo"
                            onChangeText={memo => this.setState({ memo: memo })}
                            value={this.state.memo}
                        />
                        <Picker
                            note
                            mode="dropdown"
                            style={{ width: 120 }}
                            selectedValue={this.state.asset}
                            onValueChange={(itemValue, itemIndex) =>
                                this.setState({ asset: itemValue })
                            }
                        >
                            <Picker.Item label="STEEM" value="STEEM" />
                            <Picker.Item label="SBD" value="SBD" />
                        </Picker>
                        <Button onPress={this.sendSteem} style={{ margin: 10 }}>
                            <Text style={{ color: "white" }}>Send</Text>
                        </Button>
                    </Card>
                </Content>
            </Container>
        );
    }
}
export default WalletPage;
