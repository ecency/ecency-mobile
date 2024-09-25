import React, { Ref, useState } from 'react';
import { useIntl } from 'react-intl';
import { KeyboardAvoidingView, Platform, View, SafeAreaView, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { getDefaultFilters, getFilterMap } from '../../../constants/options/filters';
import { useAppSelector } from '../../../hooks';
import {
    setCommunityTabs,
    setMainTabs,
    setOwnProfileTabs,
    setProfileTabs,
} from '../../../redux/actions/customTabsAction';
import { TextButton, ModalHeader, SelectionList, MainButton } from '../../../components';
import styles from '../styles/customiseFeedTabs.styles';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import globalStyles from '../../../globalStyles';
import { ListItem } from '../../../components/selectionList';

export interface CustomiseFiltersModalRef {
    show: () => void;
}

interface Params {
    pageType: 'main' | 'community' | 'profile' | 'ownProfile';
}

// const getFilterIndex = (filterMap: any, key: string) => Object.keys(filterMap).indexOf(key);

const CustomiseFeedTabs = ({ route, navigation }:any) => {
    const pageType = route.params.pageType;

    if (!pageType) {
        throw new Error('pageType must not be empty');
    }

    const dispatch = useDispatch();
    const intl = useIntl();

    // redux
    const savedFilters = useAppSelector((state) => {
        const defaultFilters = getDefaultFilters(pageType);
        switch (pageType) {
            case 'community':
                return state.customTabs.communityTabs || defaultFilters;
            case 'main':
                return state.customTabs.mainTabs || defaultFilters;
            case 'profile':
                return state.customTabs.profileTabs || defaultFilters;
            case 'ownProfile':
                return state.customTabs.ownProfileTabs || defaultFilters;
            default:
                return state.customTabs.mainTabs || defaultFilters;
        }
    });

    // state
    const [filterMap] = useState(getFilterMap(pageType));
    const [selectedFilters, setSelectedFilters] = useState<string[]>(savedFilters);

    /**
     * HANDLERS FUNCTIONS
     */

    // save snippet based on editor pageType
    const _onApply = () => {
        if (selectedFilters.length < 3) {
            Alert.alert(intl.formatMessage({ id: 'alert.wrong_filter_count' }));
            return;
        }
    
        switch (pageType) {
            case 'main':
                dispatch(setMainTabs(selectedFilters));
                break;
            case 'community':
                dispatch(setCommunityTabs(selectedFilters));
                break;
            case 'profile':
                dispatch(setProfileTabs(selectedFilters));
                break;
            case 'ownProfile':
                dispatch(setOwnProfileTabs(selectedFilters));
                break;
        }
        
        navigation.goBack();
    };

    /**
     * UI RENDERERS
     */

    const _renderOptions = () => {

        const data = Object.entries(filterMap).map(([key, labelId]) => ({
            id: key,
            label: intl.formatMessage({ id: labelId })
        } as ListItem));

        return (
            <SelectionList
                data={data}
                initSelectedIds={savedFilters}
                onSelectionChange={setSelectedFilters}
            />
        )
    };

    const _renderContent = (
        <View style={styles.container}>
            {_renderOptions()}
            <View style={styles.actionPanel}>
                <MainButton
                    text="APPLY"
                    onPress={_onApply}
                    textStyle={styles.btnText}
                    style={styles.button}
                />
            </View>
        </View>
    );


    return (
        <SafeAreaView style={globalStyles.container} >
            <ModalHeader
                title='Customise Filters'
                isCloseButton
                onClosePress={() => { navigation.goBack() }} />
            {_renderContent}
        </SafeAreaView>
    );
};

export default gestureHandlerRootHOC(CustomiseFeedTabs);
