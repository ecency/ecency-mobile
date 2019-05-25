import React, { Component } from 'react';
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

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

class DraftsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      drafts: [],
      schedules: [],
      isLoading: false,
    };
  }

  // Component Life Cycle Functions
  componentDidMount() {
    this._getDrafts();
    this._getSchedules();
  }

  // Component Functions

  _getSchedules = () => {
    const { currentAccount, intl } = this.props;
    this.setState({ isLoading: true });

    getSchedules(currentAccount.name)
      .then(data => {
        this.setState({ schedules: this._sortData(data, true), isLoading: false });
      })
      .catch(() => {
        Alert.alert(intl.formatMessage({ id: 'drafts.load_error' }));
        this.setState({ isLoading: false });
      });
  };

  _getDrafts = () => {
    const { currentAccount, intl } = this.props;
    this.setState({ isLoading: true });

    getDrafts(currentAccount.name)
      .then(data => {
        this.setState({ drafts: this._sortData(data), isLoading: false });
      })
      .catch(() => {
        Alert.alert(intl.formatMessage({ id: 'drafts.load_error' }));
        this.setState({ isLoading: false });
      });
  };

  _removeDraft = id => {
    const { currentAccount, intl } = this.props;

    removeDraft(currentAccount.name, id)
      .then(() => {
        const { drafts } = this.state;
        const newDrafts = [...drafts].filter(draft => draft._id !== id);

        this.setState({ drafts: this._sortData(newDrafts) });
      })
      .catch(() => {
        Alert.alert(intl.formatMessage({ id: 'alert.fail' }));
      });
  };

  _removeSchedule = id => {
    const { currentAccount, intl } = this.props;

    removeSchedule(currentAccount.name, id)
      .then(res => {
        const { schedules } = this.state;
        const newSchedules = [...schedules].filter(schedule => schedule._id !== id);

        this.setState({ schedules: this._sortData(newSchedules, true) });
      })
      .catch(() => {
        Alert.alert(intl.formatMessage({ id: 'alert.fail' }));
      });
  };

  _moveScheduleToDraft = id => {
    const { currentAccount, dispatch, intl } = this.props;

    moveSchedule(id, currentAccount.name)
      .then(res => {
        dispatch(
          toastNotification(
            intl.formatMessage({
              id: 'alert.success_moved',
            }),
          ),
        );

        this._getDrafts();
        this._getSchedules();
      })
      .catch(() => {
        dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
      });
  };

  _editDraft = id => {
    const { navigation } = this.props;
    const { drafts } = this.state;
    const selectedDraft = drafts.find(draft => draft._id === id);

    navigation.navigate({
      routeName: ROUTES.SCREENS.EDITOR,
      params: {
        draft: selectedDraft,
        fetchPost: this._getDrafts,
      },
    });
  };

  _sortData = (data, isSchedule) =>
    data.sort((a, b) => {
      const dateA = new Date(isSchedule ? a.schedule : a.created).getTime();
      const dateB = new Date(isSchedule ? a.schedule : b.created).getTime();

      return dateB > dateA ? 1 : -1;
    });

  render() {
    const { isLoading, drafts, schedules } = this.state;
    const { currentAccount } = this.props;

    return (
      <DraftsScreen
        isLoading={isLoading}
        editDraft={this._editDraft}
        currentAccount={currentAccount}
        drafts={drafts}
        schedules={schedules}
        removeDraft={this._removeDraft}
        moveScheduleToDraft={this._moveScheduleToDraft}
        removeSchedule={this._removeSchedule}
      />
    );
  }
}

const mapStateToProps = state => ({
  currentAccount: state.account.currentAccount,
});

export default injectIntl(connect(mapStateToProps)(DraftsContainer));
