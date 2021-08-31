import { TNode } from "react-native-render-html";

export interface LinkData {
        type:string,
        href?:string,
        images?:string[],
        image?:string,
        author?:string,
        permlink?:string,
        tag?:string,
        proposal?:string,
        videoHref?:string,
}

export const parseLinkData = (tnode:TNode):LinkData => {
    if(!tnode){
        return null;
    }

    if(tnode.classes.includes('markdown-external-link')){
        return {
          type:'markdown-external-link',
          href: tnode.attributes['data-href']
        }
    }


    if (tnode.classes.includes('markdown-author-link')) {
        var author = tnode.attributes['data-author'];
        return {
            type: 'markdown-author-link',
            author: author
        };
    }


  if (tnode.classes.includes('markdown-post-link')) {
    var author = tnode.attributes['data-author'];
    var permlink = tnode.attributes['data-permlink'];
    return {
      type: 'markdown-post-link',
      author: author,
      permlink: permlink
    };
  }


  if (tnode.classes.includes('markdown-tag-link')) {
    var tag = tnode.attributes['data-tag'];
    return {
      type: 'markdown-tag-link',
      tag: tag
    };
  }


  if (tnode.classes.includes('markdown-witnesses-link')) {
   return {
      type: 'markdown-witnesses-link'
    };

  }

  
  if (tnode.classes.includes('markdown-proposal-link')) {
    var proposal = tnode.attributes['data-proposal'];
    return {
      type: 'markdown-proposal-link',
      proposal: proposal
    };

  }

  if (tnode.classes.includes('markdown-video-link-youtube')) {
    var embedUrl = tnode.attributes['data-embed-src'];

    if (embedUrl) {
      return {
        type: 'markdown-video-link-youtube',
        tag: embedUrl
      };
    }
  }


  if (tnode.classes.includes('markdown-video-link')) {
    var videoHref = tnode.attributes['data-embed-src'] || tnode.attributes['data-video-href'];
    if (videoHref) {
      return {
        type: 'markdown-video-link',
        videoHref: videoHref
      };
    }
  }
}

