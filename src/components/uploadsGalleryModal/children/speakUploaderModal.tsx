import React, { forwardRef, useImperativeHandle, useState } from "react";
import { useRef } from "react";
import { View, Text, TouchableOpacity, Image, TextInput } from "react-native";
import ActionSheet from "react-native-actions-sheet";
import EStyleSheet from "react-native-extended-stylesheet";
import styles from "../styles/speakUploaderModal.styles";
import { MainButton } from "../../mainButton";


export const SpeakUploaderModal = forwardRef(({ }, ref) => {

  const sheetModalRef = useRef();

  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [title, setTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useImperativeHandle(ref, () => ({
    showUploader: () => {
      if (sheetModalRef.current) {
        sheetModalRef.current.setModalVisible(true);
      }
    }
  }))

  const _onClose = () => {

  }

  const _renderProgressContent = () => {

  }

  const _renderFormContent = () => {


    // Function to handle image upload
    const handleImageUpload = (imageNumber) => {
      // You can implement your logic for image upload here
      // For example, using ImagePicker or any other method
      // This example simply sets a placeholder image

      //Upload video and thumbnail if selected
    };

    return (
      <View style={styles.contentContainer}>

        <View style={styles.titleBox}>
          <Text style={styles.label}>Selection</Text>
          <TextInput
            style={styles.titleInput}
            editable={false}
            value={"Revoling World .mp4"}
          />
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
          <Text style={styles.label} >Select Thumbnail</Text>
          <TouchableOpacity onPress={() => handleImageUpload(2)}>
            <Image
              source={{}}
              style={styles.thumbnail}
            />
          </TouchableOpacity>
        </View>

        <MainButton
          style={styles.uploadButton}
          onPress={() => {/* Handle upload */ }}

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
})