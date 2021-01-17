import {
  FETCH_COMMUNITIES,
  FETCH_COMMUNITIES_SUCCESS,
  FETCH_COMMUNITIES_FAIL,
  FETCH_SUBSCRIBED_COMMUNITIES,
  FETCH_SUBSCRIBED_COMMUNITIES_SUCCESS,
  FETCH_SUBSCRIBED_COMMUNITIES_FAIL,
  SUBSCRIBE_COMMUNITY,
  SUBSCRIBE_COMMUNITY_SUCCESS,
  SUBSCRIBE_COMMUNITY_FAIL,
  LEAVE_COMMUNITY,
  LEAVE_COMMUNITY_SUCCESS,
  LEAVE_COMMUNITY_FAIL,
} from '../constants/constants';

const initialState = {
  communities: {
    data: [],
    loading: false,
    error: false,
  },
  subscribedCommunities: {
    data: [],
    loading: false,
    error: false,
  },
  subscribingCommunitiesInFeedScreen: {
    //['name']: {
    //  isSubscribed: false,
    //  loading: false,
    //  error: false,
    //}
  },
  subscribingCommunitiesInCommunitiesScreenDiscoverTab: {
    //['name']: {
    //  isSubscribed: false,
    //  loading: false,
    //  error: false,
    //}
  },
  subscribingCommunitiesInCommunitiesScreenJoinedTab: {
    //['name']: {
    //  isSubscribed: false,
    //  loading: false,
    //  error: false,
    //}
  },
};

export default function (state = initialState, action) {
  switch (action.type) {
    case FETCH_COMMUNITIES:
      return {
        ...state,
        communities: {
          data: [],
          loading: true,
          error: false,
        },
      };
    case FETCH_COMMUNITIES_SUCCESS:
      return {
        ...state,
        communities: {
          data: action.payload,
          loading: false,
          error: false,
        },
      };
    case FETCH_COMMUNITIES_FAIL:
      return {
        ...state,
        communities: {
          data: [],
          loading: false,
          error: action.payload,
        },
      };
    case FETCH_SUBSCRIBED_COMMUNITIES:
      return {
        ...state,
        subscribedCommunities: {
          data: [],
          loading: true,
          error: false,
        },
      };
    case FETCH_SUBSCRIBED_COMMUNITIES_SUCCESS:
      return {
        ...state,
        subscribedCommunities: {
          data: action.payload,
          loading: false,
          error: false,
        },
      };
    case FETCH_SUBSCRIBED_COMMUNITIES_FAIL:
      return {
        ...state,
        subscribedCommunities: {
          data: [],
          loading: false,
          error: action.payload,
        },
      };
    case SUBSCRIBE_COMMUNITY:
      switch (action.payload.screen) {
        case 'communitiesScreenDiscoverTab':
          return {
            ...state,
            subscribingCommunitiesInCommunitiesScreenDiscoverTab: {
              ...state.subscribingCommunitiesInCommunitiesScreenDiscoverTab,
              [action.payload.communityId]: {
                isSubscribed: false,
                loading: true,
                error: false,
              },
            },
          };
        case 'communitiesScreenJoinedTab':
          return {
            ...state,
            subscribingCommunitiesInCommunitiesScreenJoinedTab: {
              ...state.subscribingCommunitiesInCommunitiesScreenJoinedTab,
              [action.payload.communityId]: {
                isSubscribed: false,
                loading: true,
                error: false,
              },
            },
          };
        case 'feedScreen':
          return {
            ...state,
            subscribingCommunitiesInFeedScreen: {
              ...state.subscribingCommunitiesInFeedScreen,
              [action.payload.communityId]: {
                isSubscribed: false,
                loading: true,
                error: false,
              },
            },
          };
        default:
          return state;
      }
    case SUBSCRIBE_COMMUNITY_SUCCESS:
      switch (action.payload.screen) {
        case 'communitiesScreenDiscoverTab':
          return {
            ...state,
            subscribingCommunitiesInCommunitiesScreenDiscoverTab: {
              ...state.subscribingCommunitiesInCommunitiesScreenDiscoverTab,
              [action.payload.communityId]: {
                isSubscribed: true,
                loading: false,
                error: false,
              },
            },
          };
        case 'communitiesScreenJoinedTab':
          return {
            ...state,
            subscribingCommunitiesInCommunitiesScreenJoinedTab: {
              ...state.subscribingCommunitiesInCommunitiesScreenJoinedTab,
              [action.payload.communityId]: {
                isSubscribed: true,
                loading: false,
                error: false,
              },
            },
          };
        case 'feedScreen':
          return {
            ...state,
            subscribingCommunitiesInFeedScreen: {
              ...state.subscribingCommunitiesInFeedScreen,
              [action.payload.communityId]: {
                isSubscribed: true,
                loading: false,
                error: false,
              },
            },
          };
        default:
          return state;
      }
    case SUBSCRIBE_COMMUNITY_FAIL:
      switch (action.payload.screen) {
        case 'communitiesScreenDiscoverTab':
          return {
            ...state,
            subscribingCommunitiesInCommunitiesScreenDiscoverTab: {
              ...state.subscribingCommunitiesInCommunitiesScreenDiscoverTab,
              [action.payload.communityId]: {
                isSubscribed: false,
                loading: false,
                error: true,
              },
            },
          };
        case 'communitiesScreenJoinedTab':
          return {
            ...state,
            subscribingCommunitiesInCommunitiesScreenJoinedTab: {
              ...state.subscribingCommunitiesInCommunitiesScreenJoinedTab,
              [action.payload.communityId]: {
                isSubscribed: false,
                loading: false,
                error: true,
              },
            },
          };
        case 'feedScreen':
          return {
            ...state,
            subscribingCommunitiesInFeedScreen: {
              ...state.subscribingCommunitiesInFeedScreen,
              [action.payload.communityId]: {
                isSubscribed: false,
                loading: false,
                error: true,
              },
            },
          };
        default:
          return state;
      }
    case LEAVE_COMMUNITY:
      switch (action.payload.screen) {
        case 'communitiesScreenDiscoverTab':
          return {
            ...state,
            subscribingCommunitiesInCommunitiesScreenDiscoverTab: {
              ...state.subscribingCommunitiesInCommunitiesScreenDiscoverTab,
              [action.payload.communityId]: {
                isSubscribed: true,
                loading: true,
                error: false,
              },
            },
          };
        case 'communitiesScreenJoinedTab':
          return {
            ...state,
            subscribingCommunitiesInCommunitiesScreenJoinedTab: {
              ...state.subscribingCommunitiesInCommunitiesScreenJoinedTab,
              [action.payload.communityId]: {
                isSubscribed: true,
                loading: true,
                error: false,
              },
            },
          };
        case 'feedScreen':
          return {
            ...state,
            subscribingCommunitiesInFeedScreen: {
              ...state.subscribingCommunitiesInFeedScreen,
              [action.payload.communityId]: {
                isSubscribed: true,
                loading: true,
                error: false,
              },
            },
          };
        default:
          return state;
      }
    case LEAVE_COMMUNITY_SUCCESS:
      switch (action.payload.screen) {
        case 'communitiesScreenDiscoverTab':
          return {
            ...state,
            subscribingCommunitiesInCommunitiesScreenDiscoverTab: {
              ...state.subscribingCommunitiesInCommunitiesScreenDiscoverTab,
              [action.payload.communityId]: {
                isSubscribed: false,
                loading: false,
                error: false,
              },
            },
          };
        case 'communitiesScreenJoinedTab':
          return {
            ...state,
            subscribingCommunitiesInCommunitiesScreenJoinedTab: {
              ...state.subscribingCommunitiesInCommunitiesScreenJoinedTab,
              [action.payload.communityId]: {
                isSubscribed: false,
                loading: false,
                error: false,
              },
            },
          };
        case 'feedScreen':
          return {
            ...state,
            subscribingCommunitiesInFeedScreen: {
              ...state.subscribingCommunitiesInFeedScreen,
              [action.payload.communityId]: {
                isSubscribed: false,
                loading: false,
                error: false,
              },
            },
          };
        default:
          return state;
      }
    case LEAVE_COMMUNITY_FAIL:
      switch (action.payload.screen) {
        case 'communitiesScreenDiscoverTab':
          return {
            ...state,
            subscribingCommunitiesInCommunitiesScreenDiscoverTab: {
              ...state.subscribingCommunitiesInCommunitiesScreenDiscoverTab,
              [action.payload.communityId]: {
                isSubscribed: true,
                loading: false,
                error: true,
              },
            },
          };
        case 'communitiesScreenJoinedTab':
          return {
            ...state,
            subscribingCommunitiesInCommunitiesScreenJoinedTab: {
              ...state.subscribingCommunitiesInCommunitiesScreenJoinedTab,
              [action.payload.communityId]: {
                isSubscribed: true,
                loading: false,
                error: true,
              },
            },
          };
        case 'feedScreen':
          return {
            ...state,
            subscribingCommunitiesInFeedScreen: {
              ...state.subscribingCommunitiesInFeedScreen,
              [action.payload.communityId]: {
                isSubscribed: true,
                loading: false,
                error: true,
              },
            },
          };
        default:
          return state;
      }
    default:
      return state;
  }
}
