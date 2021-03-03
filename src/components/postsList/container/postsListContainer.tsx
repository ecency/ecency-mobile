import React, {forwardRef, memo, useRef, useImperativeHandle, useState, useEffect} from 'react'
import PostCard from '../../postCard';
import { get } from 'lodash';
import { FlatListProps, FlatList } from 'react-native';
import { useSelector } from 'react-redux';


interface postsListContainerProps extends FlatListProps<any> {
    promotedPosts:Array<any>;
    isFeedScreen:boolean;
}

const postsListContainer = ({
    promotedPosts,
    isFeedScreen,
    ...props
}:postsListContainerProps, ref) => {
    const flatListRef = useRef(null);

    const isHideImages = useSelector((state) => state.ui.hidePostsThumbnails);
    const posts = useSelector((state) => {
      return isFeedScreen
       ? state.posts.feedPosts
       : state.posts.otherPosts
    });

    useImperativeHandle(ref, () => ({
        scrollToTop() {
            flatListRef.current?.scrollToOffset({ x: 0, y: 0, animated: true });
        },
      }));

    const _renderItem = ({ item, index }:{item:any, index:number}) => {
        const e = [];
        if (index % 3 === 0) {
          const ix = index / 3 - 1;
          if (promotedPosts[ix] !== undefined) {
            const p = promotedPosts[ix];
            if (get(p, 'author', null) && posts.filter((x) => x.permlink === p.permlink).length <= 0) {
              e.push(
                <PostCard
                  key={`${p.author}-${p.permlink}-prom`}
                  content={p}
                  isHideImage={isHideImages}
                />,
              );
            }
          }
        }
        if (get(item, 'author', null)) {
          e.push(
            <PostCard
              key={`${item.author}-${item.permlink}`}
              content={item}
              isHideImage={isHideImages}
            />,
          );
        }
        return e;
      };


    

    return (
        <FlatList
            ref={flatListRef}
            data={posts}
            showsVerticalScrollIndicator={false}
            renderItem={_renderItem}
            keyExtractor={(content) => content.permlink}
            removeClippedSubviews
            onEndReachedThreshold={1}
            maxToRenderPerBatch={3}
            initialNumToRender={3}
            windowSize={5}
            {...props}
        />
    )
}


export default memo(forwardRef(postsListContainer));
