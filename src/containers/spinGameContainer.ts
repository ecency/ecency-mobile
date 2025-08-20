import { Component } from 'react';
import { Alert } from 'react-native';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { injectIntl } from 'react-intl';

// Providers
import { gameStatusCheck, gameClaim } from '../providers/ecency/ePoint';

class RedeemContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      score: 0,
      nextDate: null,
      gameRight: 1,
      isLoading: true,
    };
  }

  // Component Life Cycle Functions

  componentDidMount() {
    this._statusCheck();
  }

  // Component Functions
  _statusCheck = async () => {
    await gameStatusCheck('spin')
      .then((res) => {
        this.setState({
          gameRight: get(res, 'remaining', 0),
          nextDate: get(res, 'next_date', null),
          isLoading: false,
        });
      })
      .catch((err) => {
        if (err) {
          Alert.alert(get(err, 'message') || err.toString());
        }
      });
  };

  _startGame = async (type) => {
    let gameStatus;

    await gameStatusCheck(type)
      .then((res) => {
        gameStatus = res;
      })
      .catch((err) => {
        if (err) {
          Alert.alert(get(err, 'message') || err.toString());
        }
      });

    if (get(gameStatus, 'status') !== 18) {
      await gameClaim(type, get(gameStatus, 'key'))
        .then((res) => {
          this.setState(
            {
              gameRight: get(gameStatus, 'status') !== 3 ? 0 : 5,
              score: get(res, 'score'),
            },
            () => this._statusCheck(),
          );
        })
        .catch((err) => {
          if (err) {
            Alert.alert(get(err, 'message') || err.toString());
          }
        });
    } else {
      this.setState({ nextDate: get(gameStatus, 'next_date'), gameRight: 0 });
    }
  };

  render() {
    const { children } = this.props;
    const { score, gameRight, nextDate, isLoading } = this.state;

    return (
      children &&
      children({
        score,
        startGame: this._startGame,
        gameRight,
        nextDate,
        isLoading,
      })
    );
  }
}

const mapStateToProps = (state) => ({
  username: state.account.currentAccount.name,
});

export default connect(mapStateToProps)(injectIntl(RedeemContainer));
