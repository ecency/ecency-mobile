import React, { memo } from "react";
import RenderHTML, { CustomRendererProps, Element, TNode } from "react-native-render-html";
import styles from "./postHtmlRendererStyles";
import { LinkData, parseLinkData } from "./linkDataParser";
import VideoThumb from "./videoThumb";


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
      InternalRenderer,
      tnode,
      ...props
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
          <InternalRenderer
            tnode={tnode}
            onPress={isAnchored && _onPress}
            {...props}/>
        );
      }
    
    }


    /**
     * the para renderer is designd to remove margins from para
     * if it's a direct child of li tag as the added margin causes
     * a weired misalignment of bullet and content
     * @returns Default Renderer
     */
    const _paraRenderer = ({
      TDefaultRenderer,
      ...props
    }:CustomRendererProps<TNode>) => {

      props.style = props.tnode.parent.tagName === 'li'
        ? styles.pLi
        : styles.p

      return (        
        <TDefaultRenderer
          {...props}
        />
      )
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
        tr:{...styles.tr, width:contentWidth}, //center tag causes tr to have 0 width if not exclusivly set, contentWidth help avoid that
        td:styles.td,
        blockquote:styles.blockquote,
        code:styles.code,
        li:styles.li
      }}
      domVisitors={{
        onElement:_onElement
      }}
      renderers={{
        img:_imageRenderer,
        a:_anchorRenderer,
        p:_paraRenderer
      }}
      onHTMLLoaded={onLoaded && onLoaded}
      
    />
   )
  }, (next, prev)=>next.body === prev.body)
