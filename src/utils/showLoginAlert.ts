import { Alert } from 'react-native';
import ROUTES from '../../src/constants/routeNames';

const showLoginAlert = ({ navigation, intl }) => {
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
          navigation.navigate(ROUTES.SCREENS.LOGIN);
        },
      },
    ],
  );
};

export default showLoginAlert;
