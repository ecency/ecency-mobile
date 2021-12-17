import React, { memo, useState } from "react";
import RenderHTML, { CustomRendererProps, Element, TNode } from "react-native-render-html";
import styles from "./postHtmlRendererStyles";
import { LinkData, parseLinkData } from "./linkDataParser";
import VideoThumb from "./videoThumb";
import FastImage, { OnLoadEvent } from "react-native-fast-image";
import { TouchableOpacity, TouchableWithoutFeedback } from "react-native-gesture-handler";
import EStyleSheet from "react-native-extended-stylesheet";


interface PostHtmlRendererProps {
  contentWidth:number;
  body:string;
  onLoaded:()=>void;
  setSelectedImage:(imgUrl:string)=>void;
  setSelectedLink:(url:string)=>void;
  onElementIsImage:(imgUrl:string)=>void;
  handleOnPostPress:(permlink:string, authro:string)=>void;
  handleOnUserPress:(username:string)=>void;
  handleTagPress:(tag:string, filter?:string)=>void;
  handleVideoPress:(videoUrl:string)=>void;
  handleYoutubePress:(videoId:string)=>void;
}

export const PostHtmlRenderer = memo(({
    contentWidth,
    body,
    onLoaded,
    setSelectedImage,
    setSelectedLink,
    onElementIsImage,
    handleOnPostPress,
    handleOnUserPress,
    handleTagPress,
    handleVideoPress,
    handleYoutubePress,
  }:PostHtmlRendererProps) => {

     //new renderer functions
  body = body.replace(/<center>/g, '<div class="text-center">').replace(/<\/center>/g,'</div>');

  console.log("Comment body:", body);

  const _handleOnLinkPress = (data:LinkData) => {

    if(!data){
      return;
    }

    const {
      type,
      href,
      author,
      permlink,
      tag,
      filter,
      videoHref,
    } = data;

    try {

      switch (type) {
        case '_external':
        case 'markdown-external-link':
          setSelectedLink(href);
          break;
        case 'markdown-author-link':
          if (handleOnUserPress) {
            handleOnUserPress(author);
          }
          break;
        case 'markdown-post-link':
          if (handleOnPostPress) {
            handleOnPostPress(permlink, author);
          }
          break;
        case 'markdown-tag-link':
          if(handleTagPress){
            handleTagPress(tag, filter);
          }
          break;
  
        case 'markdown-video-link':
          if(handleVideoPress){
            handleVideoPress(videoHref)
          }
          break;
        case 'markdown-video-link-youtube':
          if(handleYoutubePress){
            handleYoutubePress(tag)
          }
      
          break;

        //unused cases
        // case 'markdown-witnesses-link':
        //   break;
        // case 'markdown-proposal-link':
        //   break;
        default:
          break;
      }
    } catch (error) {}
  };
  
  
    const _onElement = (element:Element) => {
      if(element.tagName === 'img' && element.attribs.src){
        const imgUrl = element.attribs.src;
        console.log("img element detected",  imgUrl);
        onElementIsImage(imgUrl)
      }
    };

  
    const _anchorRenderer = ({
      InternalRenderer,
      tnode,
      ...props
    }:CustomRendererProps<TNode>) => {
  
      const _onPress = () => {
        console.log("Link Pressed:", tnode)
        const data = parseLinkData(tnode);
        _handleOnLinkPress(data);
      };

      if(tnode.classes?.indexOf('markdown-video-link') >= 0){
        const imgElement = tnode.children.find((child)=>{
          return child.classes.indexOf('video-thumbnail') > 0 ? true:false
        })
        if(!imgElement){
          return (
            <VideoThumb contentWidth={contentWidth} onPress={_onPress}  />
          )
        }
      }
      
  
      return (
        <InternalRenderer
          tnode={tnode}
          onPress={_onPress}
          {...props}
        />
      );
    }
  
  
    const _imageRenderer = ({
      tnode,
    }:CustomRendererProps<TNode>) => {
  
      const imgUrl = tnode.attributes.src;
      const _onPress = () => {
        console.log("Image Pressed:", imgUrl)
        setSelectedImage(imgUrl);
      };
  
      const isVideoThumb = tnode.classes?.indexOf('video-thumbnail') >= 0;
      const isAnchored = !(tnode.parent?.classes?.indexOf('markdown-external-link') >= 0)
  
      if(isVideoThumb){
        return <VideoThumb contentWidth={contentWidth} uri={imgUrl}/>;
      }

      else {
        return (
          <AutoHeightImage 
            contentWidth={contentWidth} 
            imgUrl={imgUrl}
            isAnchored={isAnchored}
            onPress={_onPress}
          />
        )
      }
    
    }
  
   return (
    <RenderHTML 
      source={{ html:body }}
      contentWidth={contentWidth}
      baseStyle={{...styles.baseStyle, width:contentWidth}}
      classesStyles={{
        phishy:styles.phishy,
        'text-justify':styles.textJustify,
        'text-center':styles.textCenter
      }}
      tagsStyles={{
        body:styles.body,
        a:styles.a,
        img:styles.img,
        th:styles.th,
        tr:styles.tr,
        td:styles.td,
        blockquote:styles.blockquote,
        code:styles.code,
        p:styles.p
      }}
      domVisitors={{
        onElement:_onElement
      }}
      renderers={{
        img:_imageRenderer,
        a:_anchorRenderer,
      }}
      onHTMLLoaded={onLoaded && onLoaded}
      
    />
   )
  }, (next, prev)=>next.body === prev.body)




  const AutoHeightImage = ({
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

    const imgStyle = {
      width:imgWidth, 
      height:imgHeight, 
      backgroundColor: onLoadCalled ? 'transparent' : EStyleSheet.value('$primaryGray')
    }

    const _onLoad = (evt:OnLoadEvent) => {
      const {width, height} = evt.nativeEvent;
      const newWidth = width < contentWidth ? width : contentWidth;
      const newHeight = (height / width) * newWidth;
      setImgHeight(newHeight);
      setImgWidth(newWidth);
      setOnLoadCalled(true);
    }

    return (
      <TouchableWithoutFeedback onPress={onPress} disabled={!isAnchored}>
        <FastImage 
          style={imgStyle}
          source={{uri:imgUrl}}
          resizeMode={FastImage.resizeMode.contain}
          onLoad={_onLoad}
        />
      </TouchableWithoutFeedback>
      
    )
  }