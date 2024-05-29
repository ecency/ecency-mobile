import React, { forwardRef, useImperativeHandle, useState } from 'react';


import { PollsWizardContent } from '../children/pollsWizardContent';

export interface UploadsGalleryModalRef {
    showModal: () => void;
}


interface PollsWizardModalProps {
    isPreviewActive: boolean;
}

export const PollsWizardModal = forwardRef(
    (
        {
            isPreviewActive,
        }: PollsWizardModalProps,
        ref,
    ) => {


        const [showModal, setShowModal] = useState(false);

        useImperativeHandle(ref, () => ({
            toggleModal: (value: boolean) => {

                if (value === showModal) {
                    return;
                }

                setShowModal(value);
            },
            isVisible: () => showModal
        }));



        if (isPreviewActive) {
            return null;
        }

        return (
            <>
                {showModal && (
                    <PollsWizardContent
                    />
                )}
            </>
        );
    },
);
