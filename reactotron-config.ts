import AsyncStorage from '@react-native-async-storage/async-storage';
import Reactotron from 'reactotron-react-native';
import { reactotronRedux } from 'reactotron-redux';
import ReactotronFlipper from 'reactotron-react-native/dist/flipper';

const reactotron = Reactotron.setAsyncStorageHandler(AsyncStorage) // AsyncStorage would either come from `react-native` or `@react-native-community/async-storage` depending on where you get it from
  .configure({
    name: 'Ecency',
    // For flipper reactotron client connecting with app issue check this
    // https://github.com/infinitered/flipper-plugin-reactotron/issues/63#issuecomment-1318354958
    createSocket: (path) => new ReactotronFlipper(path),
  })
  .useReactNative() // add all built-in react native plugins
  .use(reactotronRedux())
  .connect(); // let's connect!

export default reactotron;

export const log = (...rest) => {
  Reactotron.log(...rest);
  console.log(...rest);
};
