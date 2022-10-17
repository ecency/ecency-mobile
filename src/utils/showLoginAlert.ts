import { Alert } from 'react-native';
import ROUTES from '../constants/routeNames';
import { navigate } from '../navigation/service';

const showLoginAlert = ({ intl }) => {
  return Alert.alert(
    intl.formatMessage({ id: 'login.not_loggedin_alert' }),
    intl.formatMessage({ id: 'login.not_loggedin_alert_desc' }),
    [
      {
        text: intl.formatMessage({ id: 'login.cancel' }),
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: intl.formatMessage({ id: 'login.login' }),
        onPress: () => {
          navigate({ routeName: ROUTES.SCREENS.LOGIN });
        },
      },
    ],
  );
};

export default showLoginAlert;
