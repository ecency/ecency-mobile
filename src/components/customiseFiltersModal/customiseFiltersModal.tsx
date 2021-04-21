import React, { forwardRef, Ref, useImperativeHandle, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { KeyboardAvoidingView, Platform, View, Text } from 'react-native';
import ActionSheet from 'react-native-actions-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import {useDispatch} from 'react-redux';

import { ThemeContainer } from '../../containers';
import { setFeedScreenFilters } from '../../redux/actions/postsAction';
import { TextButton } from '../buttons';
import styles from './customiseFiltersModalStyles';


export interface CustomiseFiltersModalRef {
    show:()=>void;
}


const CustomiseFiltersModal = (props:any, ref:Ref<CustomiseFiltersModalRef>) => {
    const sheetModalRef = useRef<ActionSheet>();
    const dispatch = useDispatch()

    const [selectedFilters, setSelectedFilters] = useState([
        'friends',
        'hot',
        'created',
    ]);

    const intl = useIntl(); 
 

    useImperativeHandle(ref, () => ({
        show: () => {
          sheetModalRef.current?.setModalVisible(true);
        },
      }));


    //save snippet based on editor type
    const _onDone = async () => {
       dispatch(setFeedScreenFilters(selectedFilters))
       sheetModalRef.current?.setModalVisible(false);
    }


    const _renderContent = (
        <ThemeContainer>
            {({isDarkTheme})=>(
                 <KeyboardAvoidingView
                    style={styles.container}
                    keyboardVerticalOffset={Platform.OS == 'ios' ? 64 : null}
                    behavior={Platform.OS === 'ios' ? 'padding' : null}
                >
                    <Text>Customise Filters</Text>
                    <View style={styles.inputContainer}>

                        {[0,0,0,0,0,0].map(()=>(
                            <Text>Filter</Text>
                        ))}
                    </View>

                   
                        <View style={styles.actionPanel}>
                            <TextButton 
                                text={'DONE'}
                                onPress={_onDone}
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
        onClose={_onDone}
        > 
        {_renderContent}
    </ActionSheet> 
     
  );
};

export default forwardRef(CustomiseFiltersModal);


