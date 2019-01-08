import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Alert } from 'react-native';
import { injectIntl } from 'react-intl';

// Services and Actions
import { getDrafts, removeDraft } from '../../../providers/esteem/esteem';

// Middleware

// Constants

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

  _removeDraft = (selectedDraft) => {
    const { currentAccount, intl } = this.props;

    // getDrafts(currentAccount.name)
    //   .then((data) => {
    //     const { drafts } = this.state;
    //     const newDrafts = [...drafts].filter(draft => draft._id !== item._id);

    //     Alert.alert(intl.formatMessage({ id: 'drafts.deleted' }));
    //     this.setState({ drafts: this.sortData(newDrafts) });
    //   })
    //   .catch(() => {
    //     Alert.alert(intl.formatMessage({ id: 'alert.fail' }));
    //   })
    //   .finally(() => {
    //     this._getDrafts();
    //   });
  };

  _editDraft = () => {
    alert('edit');
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
        removeDraft={this._removeDraft}
      />
    );
  }
}

const mapStateToProps = state => ({
  currentAccount: state.account.currentAccount,
});

export default connect(mapStateToProps)(injectIntl(DraftsContainer));
