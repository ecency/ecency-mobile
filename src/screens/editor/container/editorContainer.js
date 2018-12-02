import React, { Component } from 'react';
import { connect } from 'react-redux';

// Services and Actions
import { postContent } from '../../../providers/steem/dsteem';
import { setDraftPost, getDraftPost } from '../../../realm/realm';
import { getDigitPinCode } from '../../../providers/steem/auth';

// Middleware

// Constants
import { default as ROUTES } from '../../../constants/routeNames';

// Utilities
import {
  generatePermlink,
  generateReplyPermlink,
  makeJsonMetadataReply,
  makeOptions
} from '../../../utils/editor';
import { decryptKey } from '../../../utils/crypto';

// Component
import EditorScreen from '../screen/editorScreen';

/*
  *            Props Name        Description                                     Value
  *@props -->  props name here   description here                                Value Type Here
  *
  */

class ExampleContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isPostSending: false,
      isDraftSaving: false,
      isDraftSaved: false,
      draftPost: null,
    };
  }

  // Component Life Cycle Functions

  componentWillMount() {
    const { currentAccount } = this.props;
    const username = currentAccount && currentAccount.name ? currentAccount.name : '';
    
    getDraftPost(username)
    .then((result) => {
      this.setState({
        draftPost: { body: result.body, title: result.title, tags: result.tags.split(',') },
      });
    })
    .catch((error) => {
      console.log(error);
    });
  }
  
  // Component Functions
  _handleOnSaveButtonPress = (fields) => {
    const { isDraftSaved } = this.state;
    if (!isDraftSaved) {
      const { currentAccount } = this.props;
      const username = currentAccount && currentAccount.name ? currentAccount.name : '';

      this.setState({ isDraftSaving: true });
      const draftField = {
        ...fields,
        tags: fields.tags.toString(),
      };

      setDraftPost(draftField, username)
        .then(() => {
          this.setState({
            isDraftSaving: false,
            isDraftSaved: true,
          });
        })
        .catch((error) => {
          alert(error);
        });
    }
  };

  _submitPost = async (fields) => {
    this.setState({ isPostSending: true });

    const { navigation, currentAccount } = this.props;
    const permlink = generatePermlink(fields.title);
    const digitPinCode = await getDigitPinCode();

    const postingKey = decryptKey(currentAccount.realm_object.postingKey, digitPinCode);

    if (currentAccount) {
      const post = {
        ...fields,
        permlink,
        author: currentAccount.name,
      };

      postContent(post, postingKey)
        .then((result) => {
          alert('Your post succesfully shared');
          navigation.navigate(ROUTES.SCREENS.HOME);
        })
        .catch((error) => {
          alert(`Opps! there is a problem${error}`);
          this.setState({ isPostSending: false });
        });
    }
  };

  _handleSubmit = (form) => {
    this._submitPost(form);
  };

  _handleFormChanged = () => {
    const { isDraftSaved } = this.state;
    isDraftSaved && this.setState({ isDraftSaved: false });
  };

  render() {
    const { isLoggedIn, isDarkTheme } = this.props;
    const {
      isPostSending, isDraftSaving, isDraftSaved, draftPost, isReply
    } = this.state;

    return (
      <EditorScreen
        draftPost={draftPost}
        handleFormChanged={this._handleFormChanged}
        handleOnSaveButtonPress={this._handleOnSaveButtonPress}
        handleOnSubmit={this._handleSubmit}
        isDarkTheme={isDarkTheme}
        isDraftSaved={isDraftSaved}
        isDraftSaving={isDraftSaving}
        isLoggedIn={isLoggedIn}
        isPostSending={isPostSending}
        isReply={isReply}
      />
    );
  }
}

const mapStateToProps = state => ({
  isLoggedIn: state.application.isLoggedIn,

  currentAccount: state.account.currentAccount,
});

export default connect(mapStateToProps)(ExampleContainer);
