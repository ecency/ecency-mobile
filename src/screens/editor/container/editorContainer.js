import React, { Component } from 'react';
import { connect } from 'react-redux';

// Services and Actions
import { postContent } from '../../../providers/steem/dsteem';
import { getUserData, setDraftPost, getDraftPost } from '../../../realm/realm';
import { getDigitPinCode } from '../../../providers/steem/auth';

// Middleware

// Constants
import { default as ROUTES } from '../../../constants/routeNames';

// Utilities
import { generatePermlink } from '../../../utils/editor';
import { decryptKey } from '../../../utils/crypto';

// Component
import { EditorScreen } from '../screen/editorScreen';

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

  // Component Functions
  async componentDidMount() {
    const { currentAccount } = this.props;
    const username = currentAccount && currentAccount.name ? currentAccount.name : '';

    await getDraftPost(username)
      .then((result) => {
        console.log(result);
        this.setState({
          draftPost: { text: result.text, title: result.title, tags: result.tags.split(',') },
        });
        console.log({ text: result.text, title: result.title, tags: result.tags.split(',') });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  _handleOnSaveButtonPress = (form) => {
    const { isDraftSaved } = this.state;
    if (!isDraftSaved) {
      const { currentAccount } = this.props;
      const title = form.formFields['title-area'] ? form.formFields['title-area'].content : '';
      const text = form.formFields['text-area'] ? form.formFields['text-area'].content : '';
      const tags = form.tags ? form.tags.toString() : '';
      const username = currentAccount && currentAccount.name ? currentAccount.name : '';
      const formProperties = {
        title,
        tags,
        text,
      };

      this.setState({ isDraftSaving: true });

      setDraftPost(formProperties, username)
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

  _submitPost = async (form) => {
    const { navigation } = this.props;
    let userData;
    let postingKey;
    const title = form.formFields['title-area'].content;
    const permlink = generatePermlink(title);
    this.setState({ isPostSending: true });

    const digitPinCode = await getDigitPinCode();

    await getUserData().then((res) => {
      userData = res && Array.from(res)[0];

      postingKey = decryptKey(userData.postingKey, digitPinCode);
    });

    if (userData) {
      const post = {
        body: form.formFields['text-area'].content,
        title,
        author: userData.username,
        permlink: permlink && permlink,
        tags: form.tags,
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
    const { isLoggedIn } = this.props;
    const {
      isPostSending, isDraftSaving, isDraftSaved, draftPost,
    } = this.state;

    return (
      <EditorScreen
        handleOnSaveButtonPress={this._handleOnSaveButtonPress}
        isPostSending={isPostSending}
        handleFormChanged={this._handleFormChanged}
        isDraftSaving={isDraftSaving}
        isDraftSaved={isDraftSaved}
        draftPost={draftPost}
        isLoggedIn={isLoggedIn}
        handleOnSubmit={this._handleSubmit}
      />
    );
  }
}

const mapStateToProps = state => ({
  isLoggedIn: state.application.isLoggedIn,
  currentAccount: state.account.currentAccount,
});

export default connect(mapStateToProps)(ExampleContainer);
