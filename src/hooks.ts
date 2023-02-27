import { useEffect, useState } from 'react';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { CacheStatus } from './redux/reducers/cacheReducer';
import type { RootState, AppDispatch } from './redux/store/store';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;


export const useInjectVotesCache = (_posts) => {

    const votesCollection = useAppSelector((state) => state.cache.votesCollection);
    const lastUpdate = useAppSelector((state) => state.cache.lastUpdate);
    const [retPosts, setRetPosts] = useState<any[]>([]);

    useEffect(() => {
        setRetPosts(_posts.map((item) => {
            if (item) {
                const _path = `${item.author}/${item.permlink}`;
                const voteCache = votesCollection[_path]

                return _injectionFunc(item, voteCache);
            }
        }))
    }, [_posts])


    useEffect(() => {
        if (retPosts.length > 0 && lastUpdate.type === 'vote') {
            const _postPath = lastUpdate.postPath;
            const _voteCache = votesCollection[_postPath];
            const _postIndex = retPosts.findIndex((item) => _postPath === `${item.author}/${item.permlink}`);
            if (_postIndex > -1) {
               retPosts[_postIndex] = _injectionFunc(retPosts[_postIndex], _voteCache);
               setRetPosts([...retPosts]);
            }
        }

    }, [votesCollection])


    const _injectionFunc = (post, voteCache) => {
        
        if (voteCache && (voteCache.status !== CacheStatus.FAILED || voteCache.status !== CacheStatus.DELETED)) {
            const _voteIndex = post.active_votes.findIndex(i => i.voter === voteCache.voter);
            if (_voteIndex < 0) {
                post.total_payout += voteCache.amount * (voteCache.isDownvote ? -1 : 1);
                post.active_votes = [...post.active_votes, {
                    voter: voteCache.voter,
                    rshares: voteCache.isDownvote ? -1000 : 1000
                }]
            } else {
                post.active_votes[_voteIndex].rshares = voteCache.isDownvote ? -1000 : 1000;
                post.active_votes = [...post.active_votes];
            }
        }


        return post

    }
    return retPosts || _posts;

}
