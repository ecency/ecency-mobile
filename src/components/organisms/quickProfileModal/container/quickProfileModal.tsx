import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { QuickProfileContent } from '../children/quickProfileContent';
import styles from '../children/quickProfileStyles';
import { useAppDispatch, useAppSelector } from '../../../../hooks';
import { hideProfileModal } from '../../../../redux/actions/uiAction';
import Modal from '../../../modal';

export const QuickProfileModal = () => {
  const intl = useIntl();
  const [showModal, setShowModal] = useState(false);
  const dispatch = useAppDispatch();

  const profileModalUsername = useAppSelector((state) => state.ui.profileModalUsername);

  useEffect(() => {
    if (profileModalUsername) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [profileModalUsername]);

  const _onClose = () => {
    dispatch(hideProfileModal());
  };

  return (
    <Modal
      isOpen={showModal}
      handleOnModalClose={() => {
        setShowModal(false);
      }}
      presentationStyle="formSheet"
      animationType="slide"
      style={styles.modalStyle}
    >
      <QuickProfileContent username={profileModalUsername} onClose={_onClose} />
    </Modal>
  );
};
