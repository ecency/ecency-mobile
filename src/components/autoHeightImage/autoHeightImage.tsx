import React, { useEffect, useState } from "react";
import { Image } from "react-native";
import EStyleSheet from "react-native-extended-stylesheet";
import FastImage from "react-native-fast-image";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";



  export const AutoHeightImage = ({
    contentWidth, 
    imgUrl, 
    isAnchored, 
    onPress
  }:{
    contentWidth:number, 
    imgUrl:string,
    isAnchored:boolean,
    onPress:()=>void,
  }) => {


    const [imgWidth, setImgWidth] = useState(contentWidth);
    const [imgHeight, setImgHeight] = useState(imgWidth * (9/16))
    const [onLoadCalled, setOnLoadCalled] = useState(false);

    useEffect(() => {
      _fetchImageBounds();
    }, [])

    const _fetchImageBounds = () => {
        Image.getSize(imgUrl, (width, height)=>{
          const newWidth = width < contentWidth ? width : contentWidth;
          const newHeight = (height / width) * newWidth;
          setImgHeight(newHeight);
          setImgWidth(newWidth);
        })
    }

    const imgStyle = {
      width:imgWidth - 10, 
      height:imgHeight, 
      backgroundColor: onLoadCalled ? 'transparent' : EStyleSheet.value('$primaryGray')
    }

    const _onLoad = () => {
      setOnLoadCalled(true);
    }

    return (
      <TouchableWithoutFeedback onPress={onPress} disabled={isAnchored}>
        <FastImage 
          style={imgStyle}
          source={{uri:imgUrl}}
          resizeMode={FastImage.resizeMode.contain}
          onLoad={_onLoad}
        />
      </TouchableWithoutFeedback>
      
    )
  }