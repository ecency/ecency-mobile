import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Alert } from 'react-native';
import { injectIntl } from 'react-intl';

// Services and Actions
import { getDrafts, removeDraft } from '../../../providers/esteem/esteem';

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
      isLoading: false,
    };
  }

  // Component Life Cycle Functions
  componentDidMount() {
    this._getDrafts();
  }

  // Component Functions
  _getDrafts = () => {
    const { currentAccount, intl } = this.props;
    this.setState({ isLoading: true });

    getDrafts(currentAccount.name)
      .then((data) => {
        this.setState({ drafts: this._sortData(data) });
      })
      .catch(() => {
        Alert.alert(intl.formatMessage({ id: 'drafts.load_error' }));
      })
      .finally(() => {
        this.setState({ isLoading: false });
      });
  };

  _removeDraft = (id) => {
    const { currentAccount, intl } = this.props;

    removeDraft({ username: currentAccount.name, draftId: id })
      .then((data) => {
        const { drafts } = this.state;
        const newDrafts = [...drafts].filter(draft => draft._id !== id);

        // Alert.alert(intl.formatMessage({ id: 'drafts.deleted' }));
        this.setState({ drafts: this._sortData(newDrafts) });
      })
      .catch(() => {
        Alert.alert(intl.formatMessage({ id: 'alert.fail' }));
      });
  };

  _handleRemoveDraft = (id) => {
    this._removeDraft(id);
  };

  _editDraft = (id) => {
    const { navigation } = this.props;
    const { drafts } = this.state;
    const selectedDraft = drafts.find(draft => draft._id === id);
    console.log(selectedDraft);
    navigation.navigate({
      routeName: ROUTES.SCREENS.EDITOR,
      params: {
        draft: selectedDraft,
        fetchPost: this._getDrafts,
      },
    });
  };

  _sortData = data => data.sort((a, b) => {
    const dateA = new Date(a.created).getTime();
    const dateB = new Date(b.created).getTime();

    return dateB > dateA ? 1 : -1;
  });

  render() {
    const { isLoading, drafts } = this.state;
    const { currentAccount } = this.props;

    return (
      <DraftsScreen
        isLoading={isLoading}
        editDraft={this._editDraft}
        currentAccount={currentAccount}
        drafts={drafts}
        removeDraft={this._handleRemoveDraft}
      />
    );
  }
}

const mapStateToProps = state => ({
  currentAccount: state.account.currentAccount,
});

export default connect(mapStateToProps)(injectIntl(DraftsContainer));
