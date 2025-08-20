const customBodyScript = `
let images = document.getElementsByTagName("IMG");
let imageUrls = [];
for (let k = 0; k < images.length; k++) {  
  let src = images[k].getAttribute("src") || '';
  if (src) {
    imageUrls.push({url: src});
  }
}
for (let i = 0; i < images.length; i++) {  
  let result = {
    type: 'image',
    images: imageUrls,
    image: images[i].getAttribute("src") || ''
  };
  let resultStr = JSON.stringify(JSON.stringify(result));
  let message = 'window.ReactNativeWebView.postMessage(' + resultStr + ')';
  if (!images[i].classList.contains("video-thumbnail") && !images[i].parentNode.classList.contains("markdown-external-link")) {
    images[i].setAttribute("onclick", message);
  }
}
document.addEventListener('click', function(event) {
  let el = event.target;
  while (el.tagName !== 'A') {
    if (!el.parentNode) {
      break;
    }
    el = el.parentNode;
  }
  if (!el || el.tagName !== 'A') {
    return;
  }
  if (el.getAttribute('target') === '_external') {
    event.preventDefault();
    let href = el.getAttribute('href');
    let result = {
      type: '_external',
      href: href
    };
    window.ReactNativeWebView.postMessage(JSON.stringify(result));
    return true;
  }
  if (el.classList.contains('markdown-external-link')) {
    event.preventDefault();
    let href = el.getAttribute('data-href');
    let result = {
      type: 'markdown-external-link',
      href: href
    };
    window.ReactNativeWebView.postMessage(JSON.stringify(result));
    return true;
  }
  if (el.classList.contains('markdown-author-link')) {
    let author = el.getAttribute('data-author');
    let result = {
      type: 'markdown-author-link',
      author: author
    };
    window.ReactNativeWebView.postMessage(JSON.stringify(result));
    return false;
  }
  if (el.classList.contains('markdown-post-link')) {
    let category = el.getAttribute('data-tag');
    let author = el.getAttribute('data-author');
    let permlink = el.getAttribute('data-permlink');


    let result = {
      type: 'markdown-post-link',
      category: category,
      author: author,
      permlink: permlink
    };
    window.ReactNativeWebView.postMessage(JSON.stringify(result));
    return false;
  }
  if (el.classList.contains('markdown-tag-link')) {
    let tag = el.getAttribute('data-tag');
    let filter = el.getAttribute('data-filter');
    let result = {
      type: 'markdown-tag-link',
      filter: filter,
      tag: tag
    };
    window.ReactNativeWebView.postMessage(JSON.stringify(result));
    return false;
  }
  if (el.classList.contains('markdown-witnesses-link')) {
    let result = {
      type: 'markdown-witnesses-link'
    };
    window.ReactNativeWebView.postMessage(JSON.stringify(result));
    return false;
  }
  if (el.classList.contains('markdown-proposal-link')) {
    let proposal = el.getAttribute('data-proposal');
    let result = {
      type: 'markdown-proposal-link',
      proposal: proposal
    };
    window.ReactNativeWebView.postMessage(JSON.stringify(result));
    return false;
  }

  if (el.classList.contains('markdown-video-link-youtube')) {
    let embedUrl = el.getAttribute('data-embed-src');

    if (embedUrl) {
  
      let result = {
        type: 'markdown-video-link-youtube',
        tag: embedUrl
      };
      window.ReactNativeWebView.postMessage(JSON.stringify(result));
      return false;
    }
  }

  if (el.classList.contains('markdown-video-link')) {
    let embedSrc = '<iframe frameborder="0" allowfullscreen src="' + el.getAttribute('data-embed-src') + '"></iframe>';
    if (embedSrc) {
      el.innerHTML = embedSrc;
      return;
    }
    let videoHref = el.getAttribute('data-video-href');
    if (videoHref) {
      let result = {
        type: 'markdown-video-link',
        videoHref: videoHref
      };
      window.ReactNativeWebView.postMessage(JSON.stringify(result));
      return false;
    }
  }
  

  let author = el.getAttribute('data-author').toString();
  window.ReactNativeWebView.postMessage(JSON.stringify(author));
});
true;
`;

const customCommentScript = `
let longpress = 1500;
let delay;
let images = document.getElementsByTagName("IMG");
let imageUrls = [];
for (let k = 0; k < images.length; k++) {  
  let src = images[k].getAttribute("src") || '';
  if (src) {
    imageUrls.push({url: src});
  }
}
for (let i = 0; i < images.length; i++) {  
  let result = {
    type: 'image',
    images: imageUrls,
    image: images[i].getAttribute("src") || ''
  };
  let resultStr = JSON.stringify(JSON.stringify(result));
  let message = 'window.ReactNativeWebView.postMessage(' + resultStr + ')';
  if (!images[i].classList.contains("video-thumbnail") && !images[i].parentNode.classList.contains("markdown-external-link")) {
    images[i].setAttribute("onclick", message);
  }
}
document.addEventListener('mousedown', function(event) {
  delay = setTimeout(check, longpress);
  function check() {
    let result = {
      type: 'longpress',
    };
    window.ReactNativeWebView.postMessage(JSON.stringify(result));
    return true;
  }
}, true);
document.addEventListener('mouseup', function (e) {
  clearTimeout(delay);
});
document.addEventListener('mouseout', function (e) {
  clearTimeout(delay);
});
document.addEventListener('click', function(event) {
  let el = event.target;
  while (el.tagName !== 'A') {
    if (!el.parentNode) {
      break;
    }
    el = el.parentNode;
  }
  if (!el || el.tagName !== 'A') {
    return;
  }
  if (el.getAttribute('target') === '_external') {
    event.preventDefault();
    let href = el.getAttribute('href');
    let result = {
      type: '_external',
      href: href
    };
    window.ReactNativeWebView.postMessage(JSON.stringify(result));
    return true;
  }
  if (el.classList.contains('markdown-external-link')) {
    event.preventDefault();
    let href = el.getAttribute('data-href');
    let result = {
      type: 'markdown-external-link',
      href: href
    };
    window.ReactNativeWebView.postMessage(JSON.stringify(result));
    return true;
  }
  if (el.classList.contains('markdown-author-link')) {
    let author = el.getAttribute('data-author');
    let result = {
      type: 'markdown-author-link',
      author: author
    };
    window.ReactNativeWebView.postMessage(JSON.stringify(result));
    return false;
  }
  if (el.classList.contains('markdown-post-link')) {
    let category = el.getAttribute('data-tag');
    let author = el.getAttribute('data-author');
    let permlink = el.getAttribute('data-permlink');
    let result = {
      type: 'markdown-post-link',
      category: category,
      author: author,
      permlink: permlink
    };
    window.ReactNativeWebView.postMessage(JSON.stringify(result));
    return false;
  }
  if (el.classList.contains('markdown-tag-link')) {
    let tag = el.getAttribute('data-tag');
    let result = {
      type: 'markdown-tag-link',
      tag: tag
    };
    window.ReactNativeWebView.postMessage(JSON.stringify(result));
    return false;
  }
  if (el.classList.contains('markdown-witnesses-link')) {
    let result = {
      type: 'markdown-witnesses-link'
    };
    window.ReactNativeWebView.postMessage(JSON.stringify(result));
    return false;
  }
  if (el.classList.contains('markdown-proposal-link')) {
    let proposal = el.getAttribute('data-proposal');
    let result = {
      type: 'markdown-proposal-link',
      proposal: proposal
    };
    window.ReactNativeWebView.postMessage(JSON.stringify(result));
    return false;
  }

  if (el.classList.contains('markdown-video-link-youtube')) {
    let embedUrl = el.getAttribute('data-embed-src');

    if (embedUrl) {


      let result = {
        type: 'markdown-video-link-youtube',
        tag: embedUrl
      };
      window.ReactNativeWebView.postMessage(JSON.stringify(result));
      return false;
    }
  }


  if (el.classList.contains('markdown-video-link')) {
    let embedSrc = '<iframe frameborder="0" allowfullscreen src="' + el.getAttribute('data-embed-src') + '"></iframe>';
    if (embedSrc) {
      el.innerHTML = embedSrc;
      return;
    }
    let videoHref = el.getAttribute('data-video-href');
    if (videoHref) {
      let result = {
        type: 'markdown-video-link',
        videoHref: videoHref
      };
      window.ReactNativeWebView.postMessage(JSON.stringify(result));
      return false;
    }
  }

});
true;
`;

export { customBodyScript, customCommentScript };
