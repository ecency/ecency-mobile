import React, {memo, useRef} from 'react'
import PostCard from '../../postCard';
import { get } from 'lodash';
import { FlatListProps, FlatList } from 'react-native';
import { useSelector } from 'react-redux';


interface postsListContainerProps extends FlatListProps<any> {
    promotedPosts:Array<any>;
}

const postsListContainer = ({
    promotedPosts,
    ...props
}:postsListContainerProps) => {

    const isHideImages = useSelector((state) => state.ui.hidePostsThumbnails);
    const posts = useSelector((state) => state.posts.feedPosts);


    const _renderItem = ({ item, index }) => {
        const e = [];
        if (index % 3 === 0) {
          const ix = index / 3 - 1;
          if (promotedPosts[ix] !== undefined) {
            const p = promotedPosts[ix];
            if (get(p, 'author', null) && posts.filter((x) => x.permlink === p.permlink).length <= 0) {
              e.push(
                <PostCard
                  key={`${p.author}-${p.permlink}-prom`}
                  isRefresh={false}
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
              isRefresh={false}
              content={item}
              isHideImage={isHideImages}
            />,
          );
        }
        return e;
      };

    return (
        <FlatList
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

//render only is posts list item are different;
// const _checkEquality = (prevProps:postsListContainerProps, nextProps:postsListContainerProps) => {
//     console.log("equality check: ", prevProps, nextProps)

//     if(prevProps.posts.length == nextProps.posts.length){
//         let samePosts = true;
//         for(var i = 0; i < nextProps.posts.length; i++){
            
//             if(nextProps.posts[i].post_id !== prevProps.posts[i].post_id){
//                 samePosts = false;
//                 break;
//             }
//         }
//         return samePosts;
//     }

//     return false;
// }

export default memo(postsListContainer);
