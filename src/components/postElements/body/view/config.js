export default `
var images = document.getElementsByTagName("IMG");
for (i = 0; i < images.length; i++) {
  var result = {
    type: 'image',
    href: images[i].getAttribute("src") || ''
  }
  var resultStr = JSON.stringify(JSON.stringify(result)); // workaround
  var message = 'window.ReactNativeWebView.postMessage(' + resultStr + ')';
  images[i].setAttribute("onClick", message);
}

document.addEventListener('click', function(event) {
  var el = event.target;
  // A element can be wrapped with inline element. Look parent elements.
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
      href
    }
    window.ReactNativeWebView.postMessage(JSON.stringify(result));
    
    return true;
  }
  if (el.classList.contains('markdown-external-link')) {
    var href = el.getAttribute('data-href');
    var result = {
      type: 'markdown-external-link',
      href
    }
    window.ReactNativeWebView.postMessage(JSON.stringify(result));
    
    return true;
  }
  if (el.classList.contains('markdown-author-link')) {
    var author = el.getAttribute('data-author');
    var result = {
      type: 'markdown-author-link',
      author,
    }
    window.ReactNativeWebView.postMessage(JSON.stringify(result));
    return false;
  }

  if (el.classList.contains('markdown-post-link')) {
    var category = el.getAttribute('data-tag');
    var author = el.getAttribute('data-author');
    var permlink = el.getAttribute('data-permlink');
    var result = {
      type: 'markdown-post-link',
      category,
      author,
      permlink,
    }
    window.ReactNativeWebView.postMessage(JSON.stringify(result));
    return false;
  }
  if (el.classList.contains('markdown-tag-link')) {
    var tag = el.getAttribute('data-tag');
    var result = {
      type: 'markdown-tag-link',
      tag
    }
    window.ReactNativeWebView.postMessage(JSON.stringify(result));
    return false;
  }
  if (el.classList.contains('markdown-witnesses-link')) {
    
    var result = {
      type: 'markdown-witnesses-link'
    }
    window.ReactNativeWebView.postMessage(JSON.stringify(result));
    return false;
  }
  if (el.classList.contains('markdown-proposal-link')) {
    
    var proposal = el.getAttribute('data-proposal');
    var result = {
      type: 'markdown-proposal-link',
      proposal
    }
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
        videoHref
      }
      window.ReactNativeWebView.postMessage(JSON.stringify(result));
      
      return false;
    }
  }
  var author = el.getAttribute('data-author').toString();
  window.ReactNativeWebView.postMessage(JSON.stringify(author));
})
true;`;
