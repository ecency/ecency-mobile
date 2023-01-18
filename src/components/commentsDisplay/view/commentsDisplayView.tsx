import React, { forwardRef, useImperativeHandle, useRef, useState, useMemo, useEffect } from 'react';
import { SectionList, View, Text, Alert, Platform } from 'react-native';
import { useIntl } from 'react-intl';
import EStyleSheet from 'react-native-extended-stylesheet';
import { useNavigation } from '@react-navigation/native';


// Components
import COMMENT_FILTER, { VALUE } from '../../../constants/options/comment';
import { Comment } from '../..';
import { FilterBar } from '../../filterBar';
import { postQueries } from '../../../providers/queries';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import ROUTES from '../../../constants/routeNames';
import { showActionModal, toastNotification } from '../../../redux/actions/uiAction';
import { writeToClipboard } from '../../../utils/clipboard';
import { postBodySummary } from '@ecency/render-helper';
import { deleteComment } from '../../../providers/hive/dhive';
import { updateCommentCache } from '../../../redux/actions/cacheActions';
import { CommentCacheStatus } from '../../../redux/reducers/cacheReducer';

const CommentsDisplayView = forwardRef(
  (
    {
      author,
      commentCount,
      permlink,
      mainAuthor,
      flatListProps,
      postContentView,
      isLoading,
      handleOnCommentsLoaded,
    },
    ref,
  ) => {
    const intl = useIntl();
    const dispatch = useAppDispatch();
    const navigation = useNavigation();

    const currentAccount = useAppSelector(state=>state.account.currentAccount);
    const pinHash = useAppSelector(state=>state.application.pin);

    const discussionQuery = postQueries.useDiscussionQuery(author, permlink);
    const postsCachePrimer = postQueries.usePostsCachePrimer();

    const writeCommentRef = useRef(null);

    const [selectedFilter, setSelectedFilter] = useState('trending');
    const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);

    const [sectionsToggleMap, setSectionsToggleMap] = useState<Map<string, boolean>>(new Map());

    const sortedSections = useMemo(() => _sortComments(selectedFilter, discussionQuery.sectionedData), [discussionQuery.sectionedData, selectedFilter])



    useImperativeHandle(ref, () => ({
      bounceCommentButton: () => {
        console.log('bouncing comment button');
        if (writeCommentRef.current) {
          writeCommentRef.current.bounce();
        }
      },
    }));

    useEffect(()=>{
      if(!discussionQuery.isLoading){
        handleOnCommentsLoaded()
      }

      if(discussionQuery.sectionedData){
        discussionQuery.sectionedData.forEach(item=>{
          sectionsToggleMap.set(item.sectionKey, true);
        })
        setSectionsToggleMap(new Map(sectionsToggleMap));
      }
    },[discussionQuery.isLoading, discussionQuery.sectionedData])

    const _handleOnDropdownSelect = (option, index) => {
      setSelectedFilter(option);
      setSelectedOptionIndex(index);
    };


    const _handleOnVotersPress = (activeVotes, content) => {
      navigation.navigate({
        name: ROUTES.SCREENS.VOTERS,
        params: {
          activeVotes,
          content,
        },
        key: content.permlink,
      });
    };
  
    const _handleOnEditPress = (item) => {
      navigation.navigate({
        name: ROUTES.SCREENS.EDITOR,
        key: `editor_edit_reply_${item.permlink}`,
        params: {
          isEdit: true,
          isReply: true,
          post: item,
        },
      });
    };
  
    const _handleDeleteComment = (_permlink) => {
  
      deleteComment(currentAccount, pinHash, _permlink).then(() => {
        let deletedItem = null;
  
        const _applyFilter = (item) => {
          if (item.permlink === _permlink) {
            deletedItem = item;
            return false;
          }
          return true;
        };

  
        // remove cached entry based on parent
        if (deletedItem) {
          const cachePath = `${deletedItem.parent_author}/${deletedItem.parent_permlink}`;
          deletedItem.status = CommentCacheStatus.DELETED;
          delete deletedItem.updated;
          dispatch(updateCommentCache(cachePath, deletedItem, { isUpdate: true }));
        }
      });
    };
  
    const _openReplyThread = (comment) => {
      postsCachePrimer.cachePost(comment);
      navigation.navigate({
        name: ROUTES.SCREENS.POST,
        key: comment.permlink,
        params: {
          author: comment.author,
          permlink: comment.permlink,
        },
      });
    };

    const _handleShowOptionsMenu = (comment) => {

      const _showCopiedToast = () => {
        dispatch(
          toastNotification(
            intl.formatMessage({
              id: 'alert.copied',
            }),
          ),
        );
      };
  

      const _copyCommentLink = () =>  writeToClipboard(`https://ecency.com${comment.url}`).then(_showCopiedToast);
      
      const _copyCommentBody = () => {
        const body = postBodySummary(comment.markdownBody, undefined, Platform.OS);
        writeToClipboard(body).then(_showCopiedToast);
      } 
      
      const _openThread = () => _openReplyThread(comment)

      dispatch(showActionModal({
        title:"Title",
        body:"body",
        buttons:[
          {
            text:'option 1',
            onPress:_copyCommentLink
          },
          {
            text:'option 2',
            onPress:_copyCommentBody
          },
          {
            text:'option 3',
            onPress:_openThread
          }
        ]
      }))
    }


    const _handleOnToggleReplies = (sectionKey, toggleFlag) => {
      // sectionsToggleMap.set(sectionKey, toggleFlag);
      // setSectionsToggleMap(new Map(sectionsToggleMap));
    }


    const _postContentView = (
      <>
        {postContentView && postContentView}
        {!isLoading && (
          <FilterBar
            dropdownIconName="arrow-drop-down"
            options={VALUE.map((val) => intl.formatMessage({ id: `comment_filter.${val}` }))}
            defaultText={intl.formatMessage({ id: `comment_filter.${VALUE[0]}` })}
            onDropdownSelect={(selectedIndex) =>
              _handleOnDropdownSelect(COMMENT_FILTER[selectedIndex], selectedIndex)
            }
            selectedOptionIndex={selectedOptionIndex}
          />
        )}
      </>
    );



    const _renderComment = (item, backgroundColor:string = EStyleSheet.value('$primaryBackgroundColor')) => {
      return (
        <View style={{backgroundColor}}>
          <Comment
            mainAuthor={mainAuthor}
            comment={item}
            
            //TODO: decided flags to toggle or remove
            hideManyCommentsButton={true}

            handleDeleteComment={_handleDeleteComment}
            handleOnEditPress={_handleOnEditPress}
            handleOnVotersPress={_handleOnVotersPress}
            handleOnLongPress={_handleShowOptionsMenu}
            openReplyThread={_openReplyThread}
            handleOnToggleReplies={_handleOnToggleReplies}
  
          />
        </View>

      );
    };


    const _renderMainComment = ({ section }) => {
      return _renderComment(section)
    }

    const _renderReply = ({ item }) => {
      const toggle = sectionsToggleMap.get(item.sectionKey);
      if(toggle){
   
        return _renderComment(item, EStyleSheet.value('$primaryLightBackground'))
      }

      return null;
 
    }

    return (
      <SectionList
        style={{ flex: 1 }}
        ListHeaderComponent={_postContentView}
        sections={sortedSections}
        renderSectionHeader={_renderMainComment}
        renderItem={_renderReply}
        extraData={[sectionsToggleMap]}
        keyExtractor={(item, index) => item + index}
        stickySectionHeadersEnabled={false}
        {...flatListProps}
      />
    );
  },
);

export default CommentsDisplayView;



const _sortComments = (sortOrder = 'trending', _comments) => {
  const sortedComments = _comments;

  const absNegative = (a) => a.net_rshares < 0;

  const sortOrders = {
    trending: (a, b) => {
      if (absNegative(a)) {
        return 1;
      }

      if (absNegative(b)) {
        return -1;
      }

      const apayout = a.total_payout;
      const bpayout = b.total_payout;

      if (apayout !== bpayout) {
        return bpayout - apayout;
      }

      return 0;
    },
    reputation: (a, b) => {
      const keyA = a.author_reputation;
      const keyB = b.author_reputation;

      if (keyA > keyB) {
        return -1;
      }
      if (keyA < keyB) {
        return 1;
      }

      return 0;
    },
    votes: (a, b) => {
      const keyA = a.active_votes.length;
      const keyB = b.active_votes.length;

      if (keyA > keyB) {
        return -1;
      }
      if (keyA < keyB) {
        return 1;
      }

      return 0;
    },
    age: (a, b) => {
      if (absNegative(a)) {
        return 1;
      }

      if (absNegative(b)) {
        return -1;
      }

      const keyA = Date.parse(a.created);
      const keyB = Date.parse(b.created);

      if (keyA > keyB) {
        return -1;
      }
      if (keyA < keyB) {
        return 1;
      }

      return 0;
    },
  };

  sortedComments.sort(sortOrders[sortOrder]);

  return sortedComments;
};