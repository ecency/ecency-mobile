import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { useRef } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput } from 'react-native';
import ActionSheet from 'react-native-actions-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Video } from 'react-native-image-crop-picker';
import styles from '../styles/speakUploaderModal.styles';
import { MainButton } from '../../mainButton';
import { uploadFile, uploadVideoInfo } from '../../../providers/speak/speak';
import { useAppSelector } from '../../../hooks';

export const SpeakUploaderModal = forwardRef(({}, ref) => {
  const sheetModalRef = useRef();

  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const pinHash = useAppSelector((state) => state.application.pin);

  const [selectedThumb, setSelectedThumb] = useState(null);
  const [title, setTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [selectedVido, setSelectedVideo] = useState<Video | null>(null);

  useImperativeHandle(ref, () => ({
    showUploader: (_video: Video) => {
      if (sheetModalRef.current) {
        setSelectedVideo(_video);
        sheetModalRef.current.setModalVisible(true);
      }
    },
  }));

  const _startUpload = async () => {
    if (!selectedVido || isUploading) {
      return;
    }

    setIsUploading(true);

    try {
      const { filename, size, duration } = selectedVido;

      const _onProgress = (progress) => {
        console.log('Upload progress', progress);
        setUploadProgress(progress);
      };

      const videoId = await uploadFile(selectedVido, _onProgress);

      let thumbId: any = '';
      if (selectedThumb) {
        thumbId = await uploadFile(selectedThumb, _onProgress);
      }

      console.log('updating video information', videoId, thumbId);

      const response = await uploadVideoInfo(
        currentAccount,
        pinHash,
        filename,
        size,
        videoId,
        thumbId,
        duration,
      );

      console.log('response after updating video information', response);
    } catch (err) {
      console.warn('Video upload failed', err);
    }

    setIsUploading(false);
  };

  const _onClose = () => {};

  const _renderProgressContent = () => {};

  const _renderFormContent = () => {
    return (
      <View style={styles.contentContainer}>
        <View style={styles.titleBox}>
          <Text style={styles.label}>Selection</Text>
          <TextInput style={styles.titleInput} editable={false} value={selectedVido?.filename} />
        </View>

        <View style={styles.titleBox}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="Add title to video (optional)"
            placeholderTextColor={EStyleSheet.value('$borderColor')}
            onChangeText={(text) => setTitle(text)}
            value={title}
          />
        </View>

        <View style={styles.imageContainer}>
          <Text style={styles.label}>Select Thumbnail</Text>
          <TouchableOpacity onPress={() => handleImageUpload(2)}>
            <Image source={{}} style={styles.thumbnail} />
          </TouchableOpacity>
        </View>

        <MainButton
          style={styles.uploadButton}
          onPress={_startUpload}
          text="START UPLOAD"
          isLoading={isUploading}
        />
      </View>
    );
  };

  return (
    <ActionSheet
      ref={sheetModalRef}
      gestureEnabled={true}
      hideUnderlay
      containerStyle={styles.sheetContent}
      indicatorColor={EStyleSheet.value('$iconColor')}
      onClose={_onClose}
    >
      {_renderFormContent()}
    </ActionSheet>
  );
});
