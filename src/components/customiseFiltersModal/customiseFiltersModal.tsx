import React, { forwardRef, Ref, useImperativeHandle, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { TouchableOpacity } from 'react-native';
import { KeyboardAvoidingView, Platform, View, Text } from 'react-native';
import ActionSheet from 'react-native-actions-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import {useDispatch} from 'react-redux';
import { CheckBox } from '..';
import { DEFAULT_FEED_FILTERS, FEED_SCREEN_FILTER_MAP } from '../../constants/options/filters';

import { ThemeContainer } from '../../containers';
import { useAppSelector } from '../../hooks';
import { setMainTabs } from '../../redux/actions/customTabsAction';
import { setFeedScreenFilters } from '../../redux/actions/postsAction';
import { TextButton } from '../buttons';
import styles from './customiseFiltersModalStyles';


export interface CustomiseFiltersModalRef {
    show:()=>void;
}


const getFeedScreenFilterIndex = (key:string) => Object.keys(FEED_SCREEN_FILTER_MAP).indexOf(key)


const CustomiseFiltersModal = (props:any, ref:Ref<CustomiseFiltersModalRef>) => {
    const dispatch = useDispatch();
    const intl = useIntl(); 

    //refs
    const sheetModalRef = useRef<ActionSheet>();

    //redux
    const mainTabs = useAppSelector(state => state.customTabs.mainTabs || DEFAULT_FEED_FILTERS);

    //state
    const [selectedFilters, setSelectedFilters] = useState<Map<string, number>>(
        new Map(mainTabs.map((key:string)=>[
            key,
            getFeedScreenFilterIndex(key)
        ]))   
    );

    //external calls
    useImperativeHandle(ref, () => ({
        show: () => {
          sheetModalRef.current?.setModalVisible(true);
        },
      }));


    //actions
    const _onClose = () => {
        sheetModalRef.current?.setModalVisible(false);
    }

    //save snippet based on editor type
    const _onApply = () => {
        if(selectedFilters.size !== 3){
            alert(intl.formatMessage({id:'alert.wrong_filter_count'}));
            return;
        }
        const entries = Array.from(selectedFilters.entries());
        entries.sort((a, b)=>a[1]<b[1]?-1:1);

       dispatch(setMainTabs(entries.map((e)=>e[0])));
       _onClose();
    }


    /**
     * UI RENDERERS
     */

    const _renderOptions = () => {
        const options = [];
        for(const key in FEED_SCREEN_FILTER_MAP){
            if(FEED_SCREEN_FILTER_MAP.hasOwnProperty(key)){
                const isSelected = selectedFilters.has(key);
            
                const _onPress = () => {
                    if(isSelected){
                        selectedFilters.delete(key);
                    }else{
                        var index = getFeedScreenFilterIndex(key);
                        selectedFilters.set(key, index);
                    }
                    setSelectedFilters(new Map([...selectedFilters]));
                }

                options.push((
                    <TouchableOpacity key={key} onPress={_onPress}>
                        <View style={styles.checkView}>
                            <Text style={styles.informationText}>
                                {intl.formatMessage({
                                    id:FEED_SCREEN_FILTER_MAP[key]
                                })}
                            </Text>
                            <CheckBox locked isChecked={isSelected} />
                        </View>
                    </TouchableOpacity>
                ))
            }
        }

        return (
            <View style={styles.textContainer}>
                {options}
            </View>
        )
    }


    const _renderContent = (
        <ThemeContainer>
            {({isDarkTheme})=>(
                 <KeyboardAvoidingView
                    style={styles.container}
                    keyboardVerticalOffset={Platform.OS == 'ios' ? 64 : null}
                    behavior={Platform.OS === 'ios' ? 'padding' : null}
                >
                    <Text style={styles.title}>Customise Filters</Text>
                   
                   {_renderOptions()}
                   

                   
                    <View style={styles.actionPanel}>
                        <TextButton 
                            text={'APPLY'}
                            onPress={_onApply}
                            textStyle={styles.btnText}
                            style={styles.button}
                        />
                    </View>
                    
                </KeyboardAvoidingView>
            )}
            </ThemeContainer>
        )

  return (
    <ActionSheet 
        ref={sheetModalRef}
        containerStyle={styles.sheetContent}
        indicatorColor={EStyleSheet.value('$primaryWhiteLightBackground')}
        onClose={_onClose}
        > 
        {_renderContent}
    </ActionSheet> 
     
  );
};

export default forwardRef(CustomiseFiltersModal);


