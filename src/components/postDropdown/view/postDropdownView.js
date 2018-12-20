import React, { PureComponent } from 'react';

// Constants
// Components
import { DropdownButton } from '../../dropdownButton';

class PostDropdownView extends PureComponent {
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
    const { handleOnDropdownSelect, options } = this.props;

    return (
      <DropdownButton
        isHasChildIcon
        iconName="md-more"
        // options={['BOOKMARK', 'REBLOG', 'REPLY']}
        options={options}
        onSelect={handleOnDropdownSelect}
        noHighlight
      />
    );
  }
}

export default PostDropdownView;
