import React, { useRef } from 'react';
import { View, FlatList, Text, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useIntl } from 'react-intl';
import { deleteFragment } from '../../providers/ecency/ecency';
import { MainButton } from '..';
import styles from './snippetsModalStyles';

import SnippetEditorModal, {
  SnippetEditorModalRef,
} from '../snippetEditorModal/snippetEditorModal';
import SnippetItem from './snippetItem';
import { Snippet } from '../../models';
import { useAppSelector } from '../../hooks';
import { useSnippetsQuery } from '../../providers/queries';

interface SnippetsModalProps {
  handleOnSelect: (snippetText: string) => void;
}

const SnippetsModal = ({ handleOnSelect }: SnippetsModalProps) => {
  const editorRef = useRef<SnippetEditorModalRef>(null);
  const intl = useIntl();

  const isLoggedIn = useAppSelector((state) => state.application.isLoggedIn);

  const snippetsQuery = useSnippetsQuery();

  //removes snippet from users snippet collection on user confirmation
  const _removeSnippet = async (id: string) => {
    try {
      // setIsLoading(true);
      const snips = await deleteFragment(id);
      // setSnippets(snips);
      // setIsLoading(false);
    } catch (err) {
      console.warn('Failed to get snippets');
      // setIsLoading(false);
    }
  };

  //render list item for snippet and handle actions;
  const _renderItem = ({ item, index }: { item: Snippet; index: number }) => {
    const _onPress = () => handleOnSelect(item.body);

    //asks for remvoe confirmation and run remove routing upon confirming
    const _onRemovePress = () => {
      Alert.alert(
        intl.formatMessage({ id: 'snippets.title_remove_confirmation' }),
        intl.formatMessage({ id: 'snippets.message_remove_confirmation' }),
        [
          {
            text: intl.formatMessage({ id: 'snippets.btn_cancel' }),
            style: 'cancel',
          },
          {
            text: intl.formatMessage({ id: 'snippets.btn_confirm' }),
            onPress: () => _removeSnippet(item.id),
          },
        ],
      );
    };

    const _onEditPress = () => {
      if (editorRef.current) {
        editorRef.current.showEditModal(item);
      }
    };

    return (
      <TouchableOpacity onPress={_onPress}>
        <SnippetItem
          id={item.id}
          title={item.title}
          body={item.body}
          index={index}
          onEditPress={_onEditPress}
          onRemovePress={_onRemovePress}
        />
      </TouchableOpacity>
    );
  };

  //render empty list placeholder
  const _renderEmptyContent = () => {
    return (
      <>
        <Text style={styles.title}>{intl.formatMessage({ id: 'snippets.label_no_snippets' })}</Text>
      </>
    );
  };

  //renders footer with add snipept button and shows new snippet modal
  const _renderFloatingButton = () => {
    if (!isLoggedIn) {
      return null;
    }

    const _onPress = () => {
      if (editorRef.current) {
        editorRef.current.showNewModal();
      }
    };
    return (
      <View style={styles.floatingContainer}>
        <MainButton
          style={{ width: 150 }}
          onPress={_onPress}
          iconName="plus"
          iconType="MaterialCommunityIcons"
          iconColor="white"
          text={intl.formatMessage({ id: 'snippets.btn_add' })}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.bodyWrapper}>
        <FlatList
          data={snippetsQuery.data}
          keyExtractor={(item, index) => index.toString()}
          renderItem={_renderItem}
          ListEmptyComponent={_renderEmptyContent}
          refreshControl={
            <RefreshControl
              refreshing={snippetsQuery.isFetching}
              onRefresh={snippetsQuery.refetch}
            />
          }
        />
        {_renderFloatingButton()}
      </View>

      <SnippetEditorModal ref={editorRef} />
    </View>
  );
};

export default SnippetsModal;
