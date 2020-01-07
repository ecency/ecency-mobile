import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Alert } from 'react-native';
import { injectIntl } from 'react-intl';

// Services and Actions
import {
  getDrafts,
  removeDraft,
  getSchedules,
  removeSchedule,
  moveSchedule,
} from '../../../providers/esteem/esteem';
import { toastNotification } from '../../../redux/actions/uiAction';

// Middleware

// Constants
import { default as ROUTES } from '../../../constants/routeNames';

// Utilities

// Component
import DraftsScreen from '../screen/draftsScreen';

const DraftsContainer = ({ currentAccount, intl, navigation, dispatch }) => {
  const [drafts, setDrafts] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    _getDrafts();
    _getSchedules();
  }, []);

  // Component Functions

  const _getSchedules = () => {
    setIsLoading(true);

    getSchedules(currentAccount.name)
      .then(data => {
        setSchedules(_sortDataS(data));
        setIsLoading(false);
      })
      .catch(() => {
        Alert.alert(intl.formatMessage({ id: 'drafts.load_error' }));
        setIsLoading(false);
      });
  };

  const _getDrafts = () => {
    setIsLoading(true);

    getDrafts(currentAccount.name)
      .then(data => {
        setDrafts(_sortData(data));
        setIsLoading(false);
      })
      .catch(() => {
        Alert.alert(intl.formatMessage({ id: 'drafts.load_error' }));
        setIsLoading(false);
      });
  };

  const _removeDraft = id => {
    removeDraft(currentAccount.name, id)
      .then(() => {
        const newDrafts = [...drafts].filter(draft => draft._id !== id);
        setDrafts(_sortData(newDrafts));
      })
      .catch(() => {
        Alert.alert(intl.formatMessage({ id: 'alert.fail' }));
      });
  };

  const _removeSchedule = id => {
    removeSchedule(currentAccount.name, id)
      .then(res => {
        const newSchedules = [...schedules].filter(schedule => schedule._id !== id);

        setSchedules(_sortDataS(newSchedules));
      })
      .catch(() => {
        Alert.alert(intl.formatMessage({ id: 'alert.fail' }));
      });
  };

  const _moveScheduleToDraft = id => {
    moveSchedule(id, currentAccount.name)
      .then(res => {
        dispatch(
          toastNotification(
            intl.formatMessage({
              id: 'alert.success_moved',
            }),
          ),
        );

        _getDrafts();
        _getSchedules();
      })
      .catch(() => {
        dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
      });
  };

  const _editDraft = id => {
    const selectedDraft = drafts.find(draft => draft._id === id);

    navigation.navigate({
      routeName: ROUTES.SCREENS.EDITOR,
      params: {
        draft: selectedDraft,
        fetchPost: _getDrafts,
      },
    });
  };

  const _sortData = data =>
    data.sort((a, b) => {
      const dateA = new Date(a.created).getTime();
      const dateB = new Date(b.created).getTime();

      return dateB > dateA ? 1 : -1;
    });

  const _sortDataS = data =>
    data.sort((a, b) => {
      const dateA = new Date(a.schedule).getTime();
      const dateB = new Date(b.schedule).getTime();

      return dateB > dateA ? 1 : -1;
    });

  return (
    <DraftsScreen
      isLoading={isLoading}
      editDraft={_editDraft}
      currentAccount={currentAccount}
      drafts={drafts}
      schedules={schedules}
      removeDraft={_removeDraft}
      moveScheduleToDraft={_moveScheduleToDraft}
      removeSchedule={_removeSchedule}
    />
  );
};

const mapStateToProps = state => ({
  currentAccount: state.account.currentAccount,
});

export default injectIntl(connect(mapStateToProps)(DraftsContainer));
