import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { useIntl } from 'react-intl';
import { addImage, deleteImage, getImages } from '../../../providers/ecency/ecency';
import Modal from '../../modal';
import UploadsGalleryContent from '../children/uploadsGalleryContent';
import styles from '../children/uploadsGalleryModalStyles';


export interface UploadsGalleryModalRef {
    showModal: () => void;
}

interface MediaInsertData {
    url: string,
    hash: string,
}

interface UploadsGalleryModalProps {
    username: string;
    handleOnSelect: (data: Array<MediaInsertData>) => void;
    uploadedImage: MediaInsertData;
    isUploading: boolean;
    uploadProgress: number
}

export const UploadsGalleryModal = forwardRef(({
    username,
    handleOnSelect,
    uploadedImage,

}: UploadsGalleryModalProps, ref) => {
    const intl = useIntl();

    const [mediaUploads, setMediaUploads] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [lastAddedImageUrl, setLastAddedImageUrl] = useState(null);



    useImperativeHandle(ref, () => ({
        showModal: () => {
            setShowModal(true);
        },
    }));


    useEffect(() => {
        _getMediaUploads();
    }, []);


    useEffect(() => {
        if (uploadedImage && uploadedImage.url !== lastAddedImageUrl) {
            _addUploadedImageToGallery();
        }
    }, [uploadedImage])


    
    //save image to user gallery
    const _addUploadedImageToGallery = async () => {
        try {
            console.log("adding image to gallery", username, uploadedImage)
            setIsLoading(true);
            await addImage(uploadedImage.url);
            await _getMediaUploads();
            setLastAddedImageUrl(uploadedImage.url);
            setIsLoading(false);
        } catch (err) {
            console.warn("Failed to add image to gallery, could possibly a duplicate image", err)
            setIsLoading(false);
        }
    }


    // remove image data from user's gallery
    const _deleteMedia = async (indices) => {
        try {
            setIsLoading(true);
            for (const index of indices.keys()) {
                await deleteImage(mediaUploads[index]._id)
            }
            await _getMediaUploads();
          
            setIsLoading(false);
            return true
        } catch (err) {
            console.warn("failed to remove image from gallery", err)
            setIsLoading(false);
            return false
        }
    }


    //fetch images from server
    const _getMediaUploads = async () => {
        try {
            if (username) {
                setIsLoading(true);
                console.log("getting images for: " + username)
                const images = await getImages()
                console.log("images received", images)
                setMediaUploads(images);
                setIsLoading(false);
            }
        } catch (err) {
            console.warn("Failed to get images")
            setIsLoading(false);
        }
    }

    //inserts media items in post body
    const _insertMedia = async (map:Map<number, boolean>) => {

        const data = []
        for (const index of map.keys()) {
            console.log(index)
            const item = mediaUploads[index]
            data.push({
                url: item.url,
                hash: ""
            })

        }
        handleOnSelect(data)
        setShowModal(false);
    }

    const _renderContent = () => {
        return (
            <UploadsGalleryContent 
                mediaUploads={mediaUploads} 
                isLoading={isLoading}
                getMediaUploads={_getMediaUploads}
                deleteMedia={_deleteMedia}
                insertMedia={_insertMedia}

            />
        )
    }


    return (
        <Modal
            isOpen={showModal}
            handleOnModalClose={() => setShowModal(false)}
            isFullScreen
            isCloseButton
            presentationStyle="formSheet"
            title={intl.formatMessage({
                id: 'uploads_modal.title'
            })}
            animationType="slide"
            style={styles.modalStyle}
        >
            {showModal && _renderContent()}
        </Modal>

    );
});


