import React, { Component, Fragment } from 'react';

class PostFormView extends Component {
  _handleOnSubmitEditing = (returnKeyType = null, inputElement = null) => {
    const { handleOnSubmit, isFormValid } = this.props;

    if (isFormValid && handleOnSubmit && returnKeyType === 'done') {
      handleOnSubmit();
    } else if (returnKeyType === 'next' && inputElement) {
      // TODO: its accept current input but its should be next input ref
      inputElement.focus();
    }
  };

  render() {
    const { children, isFormValid, isPreviewActive } = this.props;

    return (
      <Fragment>
        {React.Children.map(children, (child) => {
          if (child) {
            return React.cloneElement(child, {
              onSubmitEditing: item => this._handleOnSubmitEditing(child.props.returnKeyType, item),
              returnKeyType: isFormValid ? 'done' : 'next',
              isPreviewActive,
            });
          }
        })}
      </Fragment>
    );
  }
}

export default PostFormView;
