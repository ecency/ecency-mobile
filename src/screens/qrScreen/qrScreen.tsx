import React, { Fragment, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { View, Text, ScrollView, Button, TouchableOpacity, Dimensions } from 'react-native';
import { BasicHeader, MainButton } from '../../components';
import QRCodeScanner from 'react-native-qrcode-scanner';

// styles
import styles from './qrScreenStyle';
import { useAppSelector } from '../../hooks';
import postUrlParser from '../../utils/postUrlParser';
import { getPost, getUser } from '../../providers/hive/dhive';
import ROUTES from '../../constants/routeNames';
import get from 'lodash/get';
import parseAuthUrl from '../../utils/parseAuthUrl';
import { navigate } from '../../navigation/service';

const screenWidth = Dimensions.get('screen').width;
const QRScreen = () => {
  const intl = useIntl();
  const currentAccount = useAppSelector((state) => state.account.currentAccount);

  const [isActive, setIsActive] = useState(true);
  const [scanResult, setScanResult] = useState(null);
  const scannerRef = useRef(null);
  const onSuccess = (e) => {
    setScanResult(e.data);
    setIsActive(false);
  };

  const _handleOpen = () => {
    console.log('scanResult : ', scanResult);
    _handleDeepLink(scanResult)
  };

  const _handleDeepLink = async (url = '') => {
    if (!url || url.indexOf('ShareMedia://') >= 0) return;

    let routeName;
    let params;
    let content;
    let profile;
    let keey;
    
    const postUrl = postUrlParser(url);
    const { author, permlink, feedType, tag } = postUrl || {};

    try {
      if (author) {
        if (
          !permlink ||
          permlink === 'wallet' ||
          permlink === 'points' ||
          permlink === 'comments' ||
          permlink === 'replies' ||
          permlink === 'posts'
        ) {
          let deepLinkFilter;
          if (permlink) {
            deepLinkFilter = permlink === 'points' ? 'wallet' : permlink;
          }

          profile = await getUser(author);
          routeName = ROUTES.SCREENS.PROFILE;
          params = {
            username: get(profile, 'name'),
            reputation: get(profile, 'reputation'),
            deepLinkFilter, //TODO: process this in profile screen
          };
          keey = get(profile, 'name');
        } else if (permlink === 'communities') {
          routeName = ROUTES.SCREENS.WEB_BROWSER;
          params = {
            url: url,
          };
          keey = 'WebBrowser';
        } else if (permlink) {
          content = await getPost(author, permlink, currentAccount.name);
          routeName = ROUTES.SCREENS.POST;
          params = {
            content,
          };
          keey = `${author}/${permlink}`;
        }
      }

      if (feedType === 'hot' || feedType === 'trending' || feedType === 'created') {
        if (!tag) {
          routeName = ROUTES.SCREENS.TAG_RESULT;
        } else if (/hive-[1-3]\d{4,6}$/.test(tag)) {
          routeName = ROUTES.SCREENS.COMMUNITY;
        } else {
          routeName = ROUTES.SCREENS.TAG_RESULT;
        }
        params = {
          tag,
          filter: feedType,
        };
        keey = `${feedType}/${tag || ''}`;
      }
    } catch (error) {
      // this._handleAlert('deep_link.no_existing_user');
      console.log('No existing user!');
    }

    if (!routeName) {
      const { mode, referredUser } = parseAuthUrl(url);
      if (mode === 'SIGNUP') {
        routeName = ROUTES.SCREENS.REGISTER;
        params = {
          referredUser,
        };
        keey = `${mode}/${referredUser || ''}`;
      }
    }

    if (routeName && keey) {
      navigate({
        routeName,
        params,
        key: keey,
      });
    }else{
      console.log('unable to open url');
      
    }
  };

  const _renderBottomContent = () => {
    return (
      <View style={styles.bottomContent}>
        <Text>Detected URL:</Text>
        <Text>{scanResult}</Text>

        <MainButton
          // isLoading={isLoading}
          isDisable={isActive}
          style={styles.mainButton}
          height={50}
          onPress={_handleOpen}
        >
          <View style={styles.mainButtonWrapper}>
            <Text style={styles.openText}>
              {intl.formatMessage({
                id: 'qr.open',
              })}
            </Text>
          </View>
        </MainButton>
      </View>
    );
  };
  return (
    <Fragment>
      <BasicHeader
        title={intl.formatMessage({
          id: 'qr.qr_scan',
        })}
      />
      <View style={styles.mainContainer}>
        <QRCodeScanner
          reactivate={isActive}
          showMarker={true}
          ref={scannerRef}
          onRead={onSuccess}
          topViewStyle={{ display: 'none' }}
          bottomContent={_renderBottomContent()}
          containerStyle={styles.scannerContainer}
          cameraContainerStyle={styles.cameraContainer}
          cameraStyle={{ alignSelf: 'center', justifyContent: 'center', width: 200 }}
          cameraProps={{}}
        />
      </View>
    </Fragment>
  );
};

export default QRScreen;
