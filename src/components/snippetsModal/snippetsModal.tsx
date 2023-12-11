import React, { useRef } from 'react';
import { View, FlatList, Text, TouchableOpacity, RefreshControl } from 'react-native';
import { useIntl } from 'react-intl';
import { MainButton } from '..';
import styles from './snippetsModalStyles';

import SnippetEditorModal, {
  SnippetEditorModalRef,
} from '../snippetEditorModal/snippetEditorModal';
import SnippetItem from './snippetItem';
import { Snippet } from '../../models';
import { useAppSelector } from '../../hooks';
import { editorQueries } from '../../providers/queries';

interface SnippetsModalProps {
  handleOnSelect: (snippetText: string) => void;
}

const SnippetsModal = ({ handleOnSelect }: SnippetsModalProps) => {
  const editorRef = useRef<SnippetEditorModalRef>(null);
  const intl = useIntl();

  const isLoggedIn = useAppSelector((state) => state.application.isLoggedIn);

  const snippetsQuery = editorQueries.useSnippetsQuery();

  // render list item for snippet and handle actions;
  const _renderItem = ({ item, index }: { item: Snippet; index: number }) => {
    const _onPress = () => handleOnSelect(item.body);

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
        />
      </TouchableOpacity>
    );
  };

  // render empty list placeholder
  const _renderEmptyContent = () => {
    return (
      <>
        <Text style={styles.title}>{intl.formatMessage({ id: 'snippets.label_no_snippets' })}</Text>
      </>
    );
  };

  // renders footer with add snipept button and shows new snippet modal
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
