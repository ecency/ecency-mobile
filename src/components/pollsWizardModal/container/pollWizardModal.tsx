import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { PollsWizardContent } from "../children/pollsWizardContent"
import { useIntl } from 'react-intl';
import styles from '../styles/pollWizardModal.styles';
import { Modal } from '../..';

interface Props {
}

export const PollWizardModal = forwardRef(({ }: Props, ref) => {
    const intl = useIntl();

    const [showModal, setShowModal] = useState(false);
    const [draftId, setDraftId] = useState('')

    useImperativeHandle(ref, () => ({
        showModal: (_draftId: string) => {
            setShowModal(true);
            setDraftId(_draftId);
        }
    }))

    const _closeModal = () => {
        setShowModal(false)
    }


    return (
        <Modal
            isOpen={showModal}
            handleOnModalClose={_closeModal}
            isFullScreen
            isCloseButton
            presentationStyle="formSheet"
            title={intl.formatMessage({ id: 'post_poll.create_title' })}
            animationType="slide"
            style={styles.modalStyle}
        >
            <PollsWizardContent draftId={draftId} onClose={_closeModal} />
        </Modal>
    )
})


