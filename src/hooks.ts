import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './redux/store/store';
import persistAccountGenerator from './utils/persistAccountGenerator';
import { addOtherAccount, setPrevLoggedInUsers, updateCurrentAccount } from './redux/actions/accountAction';
import { fetchSubscribedCommunities } from './redux/actions/communitiesAction';
import ROUTES from './constants/routeNames';
import { useNavigation } from '@react-navigation/native';
import { useIntl } from 'react-intl';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;



export const usePostLoginActions = () => {
    const intl = useIntl();
    const dispatch = useDispatch();
    const navigation = useNavigation();

    const isPinCodeOpen = useAppSelector((state) => state.application.isPinCodeOpen)
    const prevLoggedInUsers = useAppSelector((state) => state.account.prevLoggedInUsers)


    // update previously loggedin users list,
    const _updatePrevLoggedInUsersList = (username) => {
        if (prevLoggedInUsers && prevLoggedInUsers.length > 0) {
            const userIndex = prevLoggedInUsers.findIndex((el) => el?.username === username);
            if (userIndex > -1) {
                const updatedPrevLoggedInUsers = [...prevLoggedInUsers];
                updatedPrevLoggedInUsers[userIndex] = { username, isLoggedOut: false };
                dispatch(setPrevLoggedInUsers(updatedPrevLoggedInUsers));
            } else {
                const u = { username, isLoggedOut: false };
                dispatch(setPrevLoggedInUsers([...prevLoggedInUsers, u]));
            }
        } else {
            const u = { username, isLoggedOut: false };
            dispatch(setPrevLoggedInUsers([u]));
        }
    };

    const updateAccountsData = (accountData) => {

        if (accountData) {
            const persistAccountData = persistAccountGenerator(accountData);

            dispatch(updateCurrentAccount({ ...accountData }));
            dispatch(fetchSubscribedCommunities(result.username));
            dispatch(addOtherAccount({ ...persistAccountData }));
            dispatch(loginAction(true));
            _updatePrevLoggedInUsersList(accountData.username);

            if (isPinCodeOpen) {
                navigation.navigate({
                    name: ROUTES.SCREENS.PINCODE,
                    params: {
                        accessToken: accountData.accessToken,
                        navigateTo: ROUTES.DRAWER.MAIN,
                    },
                });
            } else {
                navigation.navigate({
                    name: ROUTES.DRAWER.MAIN,
                    params: { accessToken: accountData.accessToken },
                });
            }
        } else {
            throw new Error('alert.unknow_error');
 
        }
    }


    return {
        updateAccountsData
    }
}
function loginAction(arg0: boolean): any {
    throw new Error('Function not implemented.');
}

