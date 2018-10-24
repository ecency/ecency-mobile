import React, { Component } from 'react';
// Constants

// Components
import { MarkdownEditor } from '../../../markdownEditor';

export default class TextAreaView extends Component {
  /* Props
    * ------------------------------------------------
    *   @prop { type }    name                - Description....
    */

  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycles

  // Component Functions

  render() {
    return <MarkdownEditor {...this.props} />;
  }
}
