import React, { PureComponent, Fragment } from 'react';
import { debounce } from 'lodash';

class PostFormView extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  _handleOnSubmitEditing = (returnKeyType = null, inputElement = null) => {
    const { handleOnSubmit, isFormValid } = this.props;

    if (isFormValid && handleOnSubmit && returnKeyType === 'done') {
      handleOnSubmit();
    } else if (returnKeyType === 'next' && inputElement) {
      // TODO: its accept current input but its should be next input ref
      inputElement.focus();
    }
  };

  _handleOnChange = (componentID, value, isValid = null) => {
    const { handleFormUpdate, handleBodyChange } = this.props;
    console.log('update fields state :', componentID, value);
    handleFormUpdate(componentID, value, !!isValid || !!value);
    if (componentID === 'body') {
      handleBodyChange(value);
    }
  };

  render() {
    const { children, isFormValid, isPreviewActive } = this.props;

    return (
      <Fragment>
        {React.Children.map(children, (child) => {
          if (child) {
            return React.cloneElement(child, {
              onSubmitEditing: (item) =>
                this._handleOnSubmitEditing(child.props.returnKeyType, item),
              onChange: debounce(
                (value) => this._handleOnChange(child.props.componentID, value),
                500,
              ),
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
