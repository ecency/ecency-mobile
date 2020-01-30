const customBodyScript = `
var images = document.getElementsByTagName("IMG");
var imageUrls = [];
for (var k = 0; k < images.length; k++) {  
  var src = images[k].getAttribute("src") || '';
  if (src) {
    imageUrls.push({url: src});
  }
}
for (var i = 0; i < images.length; i++) {  
  var result = {
    type: 'image',
    images: imageUrls,
    image: images[i].getAttribute("src") || ''
  };
  var resultStr = JSON.stringify(JSON.stringify(result));
  var message = 'window.ReactNativeWebView.postMessage(' + resultStr + ')';
  if (!images[i].classList.contains("video-thumbnail") && !images[i].parentNode.classList.contains("markdown-external-link")) {
    images[i].setAttribute("onClick", message);
  }
}
document.addEventListener('click', function(event) {
  var el = event.target;
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
    var href = el.getAttribute('href');
    var result = {
      type: '_external',
      href: href
    };
    window.ReactNativeWebView.postMessage(JSON.stringify(result));
    return true;
  }
  if (el.classList.contains('markdown-external-link')) {
    var href = el.getAttribute('data-href');
    var result = {
      type: 'markdown-external-link',
      href: href
    };
    window.ReactNativeWebView.postMessage(JSON.stringify(result));
    return true;
  }
  if (el.classList.contains('markdown-author-link')) {
    var author = el.getAttribute('data-author');
    var result = {
      type: 'markdown-author-link',
      author: author
    };
    window.ReactNativeWebView.postMessage(JSON.stringify(result));
    return false;
  }
  if (el.classList.contains('markdown-post-link')) {
    var category = el.getAttribute('data-tag');
    var author = el.getAttribute('data-author');
    var permlink = el.getAttribute('data-permlink');
    var result = {
      type: 'markdown-post-link',
      category: category,
      author: author,
      permlink: permlink
    };
    window.ReactNativeWebView.postMessage(JSON.stringify(result));
    return false;
  }
  if (el.classList.contains('markdown-tag-link')) {
    var tag = el.getAttribute('data-tag');
    var result = {
      type: 'markdown-tag-link',
      tag: tag
    };
    window.ReactNativeWebView.postMessage(JSON.stringify(result));
    return false;
  }
  if (el.classList.contains('markdown-witnesses-link')) {
    var result = {
      type: 'markdown-witnesses-link'
    };
    window.ReactNativeWebView.postMessage(JSON.stringify(result));
    return false;
  }
  if (el.classList.contains('markdown-proposal-link')) {
    var proposal = el.getAttribute('data-proposal');
    var result = {
      type: 'markdown-proposal-link',
      proposal: proposal
    };
    window.ReactNativeWebView.postMessage(JSON.stringify(result));
    return false;
  }
  if (el.classList.contains('markdown-video-link')) {
    var embedSrc = '<iframe frameborder="0" allowfullscreen src="' + el.getAttribute('data-embed-src') + '"></iframe>';
    if (embedSrc) {
      el.innerHTML = embedSrc;
      return;
    }
    var videoHref = el.getAttribute('data-video-href');
    if (videoHref) {
      var result = {
        type: 'markdown-video-link',
        videoHref: videoHref
      };
      window.ReactNativeWebView.postMessage(JSON.stringify(result));
      return false;
    }
  }
  var author = el.getAttribute('data-author').toString();
  window.ReactNativeWebView.postMessage(JSON.stringify(author));
});
true;
`;

const customCommentScript = `
var images = document.getElementsByTagName("IMG");
var imageUrls = [];
for (var k = 0; k < images.length; k++) {  
  var src = images[k].getAttribute("src") || '';
  if (src) {
    imageUrls.push({url: src});
  }
}
for (var i = 0; i < images.length; i++) {  
  var result = {
    type: 'image',
    images: imageUrls,
    image: images[i].getAttribute("src") || ''
  };
  var resultStr = JSON.stringify(JSON.stringify(result));
  var message = 'window.ReactNativeWebView.postMessage(' + resultStr + ')';
  if (!images[i].classList.contains("video-thumbnail") && !images[i].parentNode.classList.contains("markdown-external-link")) {
    images[i].setAttribute("onTouchStart", message);
  }
}
document.addEventListener('touchstart', function(event) {
  event.preventDefault();
  var el = event.target;
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
    var href = el.getAttribute('href');
    var result = {
      type: '_external',
      href: href
    };
    window.ReactNativeWebView.postMessage(JSON.stringify(result));
    return true;
  }
  if (el.classList.contains('markdown-external-link')) {
    var href = el.getAttribute('data-href');
    var result = {
      type: 'markdown-external-link',
      href: href
    };
    window.ReactNativeWebView.postMessage(JSON.stringify(result));
    return true;
  }
  if (el.classList.contains('markdown-author-link')) {
    var author = el.getAttribute('data-author');
    var result = {
      type: 'markdown-author-link',
      author: author
    };
    window.ReactNativeWebView.postMessage(JSON.stringify(result));
    return false;
  }
  if (el.classList.contains('markdown-post-link')) {
    var category = el.getAttribute('data-tag');
    var author = el.getAttribute('data-author');
    var permlink = el.getAttribute('data-permlink');
    var result = {
      type: 'markdown-post-link',
      category: category,
      author: author,
      permlink: permlink
    };
    window.ReactNativeWebView.postMessage(JSON.stringify(result));
    return false;
  }
  if (el.classList.contains('markdown-tag-link')) {
    var tag = el.getAttribute('data-tag');
    var result = {
      type: 'markdown-tag-link',
      tag: tag
    };
    window.ReactNativeWebView.postMessage(JSON.stringify(result));
    return false;
  }
  if (el.classList.contains('markdown-witnesses-link')) {
    var result = {
      type: 'markdown-witnesses-link'
    };
    window.ReactNativeWebView.postMessage(JSON.stringify(result));
    return false;
  }
  if (el.classList.contains('markdown-proposal-link')) {
    var proposal = el.getAttribute('data-proposal');
    var result = {
      type: 'markdown-proposal-link',
      proposal: proposal
    };
    window.ReactNativeWebView.postMessage(JSON.stringify(result));
    return false;
  }
  if (el.classList.contains('markdown-video-link')) {
    var embedSrc = '<iframe frameborder="0" allowfullscreen src="' + el.getAttribute('data-embed-src') + '"></iframe>';
    if (embedSrc) {
      el.innerHTML = embedSrc;
      return;
    }
    var videoHref = el.getAttribute('data-video-href');
    if (videoHref) {
      var result = {
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
