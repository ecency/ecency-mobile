import React, { PureComponent } from 'react';

// Constants
// Components
import { DropdownButton } from '../../dropdownButton';
import styles from './postDropdownStyles';

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
        iconName="more-vert"
        options={options}
        onSelect={handleOnDropdownSelect}
        noHighlight
        iconStyle={styles.icon}
      />
    );
  }
}

export default PostDropdownView;
