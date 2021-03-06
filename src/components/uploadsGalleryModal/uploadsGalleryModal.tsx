import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { useIntl } from 'react-intl';
import {Text, View, FlatList, RefreshControl, TouchableOpacity, Alert, Platform } from 'react-native';
import FastImage from 'react-native-fast-image';
import { IconButton } from '..';
import { UploadedMedia } from '../../models';
import { addImage, deleteImage, getImages } from '../../providers/ecency/ecency';
import Modal from '../modal';
import styles from './uploadsGalleryModalStyles';
import { proxifyImageSrc } from '@ecency/render-helper';


export interface UploadsGalleryModalRef {
    showModal:()=>void;
}

interface MediaInsertData {
    url:string,
    hash:string,
}

interface UploadsGalleryModalProps {
    username:string;
    handleOnSelect:(data:MediaInsertData)=>void;
    uploadedImage:MediaInsertData;
}

export const UploadsGalleryModal =  forwardRef(({username, handleOnSelect, uploadedImage}: UploadsGalleryModalProps, ref) => {
    const intl = useIntl();

    const [mediaUploads, setMediaUploads] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);   
  

    useImperativeHandle(ref, () => ({
        showModal: () => {
          setShowModal(true);
        },
      }));
      

    useEffect(() => {
        _getMediaUploads();
    }, []);

    useEffect(() => {
        if(uploadedImage){
            _addUploadedImageToGallery();
        }
    }, [uploadedImage])


    //save image to user gallery
    const _addUploadedImageToGallery = async () => {
        try{
            console.log("adding image to gallery",username, uploadedImage )
            setIsLoading(true);
            await addImage(uploadedImage.url);
            await _getMediaUploads();
            setIsLoading(false);
        }catch(err){
            console.warn("Failed to add image to gallery, could possibly a duplicate image", err)
            setIsLoading(false);
        }
    }


    // remove image data from user's gallery
    const _deleteMediaItem = async (id:string) => {
        try{
            setIsLoading(true);
            await deleteImage(id)
            await _getMediaUploads();
            setIsLoading(false);
        } catch(err){
            console.warn("failed to remove image from gallery", err)
            setIsLoading(false);
        }
    }
   

    //fetch images from server
    const _getMediaUploads = async () => {
        try{
            if (username) {
                setIsLoading(true);
                console.log("getting images for: " + username )
                const images = await getImages()
                console.log("images received", images)
                setMediaUploads(images);
                setIsLoading(false);
            }
        }catch(err){
            console.warn("Failed to get snippets")
            setIsLoading(false);
        }
    }



  //render list item for snippet and handle actions;
  const _renderItem = ({ item }:{item:UploadedMedia, index:number}) => {

    const _onPress = () => {
        
        const data = {
            url:item.url,
            hash:item.url.split('/').pop()
        }

        handleOnSelect(data)
        setShowModal(false);
    }

    const _onRemovePress = async () => {
        const _onConfirm = () => {
            _deleteMediaItem(item._id)
        }
        Alert.alert(
            intl.formatMessage({id:'alert.delete'}),
            intl.formatMessage({id:'alert.remove_alert'}),
            [{
                text:intl.formatMessage({id:'alert.cancel'}),
                style:'cancel'
            },{
                text:intl.formatMessage({id:'alert.confirm'}),
                onPress:_onConfirm
            }]
        )
       
    }

    const thumbUrl = proxifyImageSrc(item.url, 600, 500, Platform.OS === 'ios' ? 'match' : 'webp');

    return (
      <TouchableOpacity onPress={_onPress}>
        <FastImage 
            source={{uri:thumbUrl}}
            style={styles.mediaItem}
        />
        <View style={styles.removeItemContainer}>
            <IconButton
                iconStyle={styles.itemIcon}
                style={styles.itemIconWrapper}
                iconType="MaterialCommunityIcons"
                name="delete"
                onPress={_onRemovePress}
                size={20}
            />
        </View>
        
      </TouchableOpacity>
    )
  };


    //render empty list placeholder
    const _renderEmptyContent = () => {
        return (
          <>
            <Text style={styles.title}>{intl.formatMessage({id:'uploads_modal.label_no_images'})}</Text>
          </>
        );
    };





    const _renderContent = (
        <View style={styles.container}>
            <View style={styles.bodyWrapper}>
            <FlatList
                data={mediaUploads}
                keyExtractor={(item) => `item_${item.url}`}
                renderItem={_renderItem}
                ListEmptyComponent={_renderEmptyContent}
                numColumns={2}
                refreshControl={
                    <RefreshControl 
                        refreshing={isLoading}
                        onRefresh={_getMediaUploads}
                    />
                }
            />
            </View>
        </View>
    )


  return (
    <Modal 
        isOpen={showModal}
        handleOnModalClose={() => setShowModal(false)}
        isFullScreen
        isCloseButton
        presentationStyle="formSheet"
        title={intl.formatMessage({
            id:'uploads_modal.title'
        })}
        animationType="slide"
        style={styles.modalStyle}
    >
    {_renderContent}
    </Modal>
     
  );
});


