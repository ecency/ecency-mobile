export default `
const images = document.getElementsByTagName("IMG");
for (i = 0; i < images.length; i++) {
  const result = {
    type: 'image',
    href: images[i].getAttribute("src") || ''
  }
  const resultStr = JSON.stringify(JSON.stringify(result)); // workaround
  const message = 'window.ReactNativeWebView.postMessage(' + resultStr + ')';
  images[i].setAttribute("onClick", message);
}

document.addEventListener('click', function(event) {
  let el = event.target;
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
    const href = el.getAttribute('href');
    const result = {
      type: '_external',
      href
    }
    window.ReactNativeWebView.postMessage(JSON.stringify(result));
    
    return true;
  }
  if (el.classList.contains('markdown-external-link')) {
    const href = el.getAttribute('data-href');
    const result = {
      type: 'markdown-external-link',
      href
    }
    window.ReactNativeWebView.postMessage(JSON.stringify(result));
    
    return true;
  }
  if (el.classList.contains('markdown-author-link')) {
    const author = el.getAttribute('data-author');
    const result = {
      type: 'markdown-author-link',
      author,
    }
    window.ReactNativeWebView.postMessage(JSON.stringify(result));
    return false;
  }

  if (el.classList.contains('markdown-post-link')) {
    let category = el.getAttribute('data-tag');
    let author = el.getAttribute('data-author');
    let permlink = el.getAttribute('data-permlink');
    const result = {
      type: 'markdown-post-link',
      category,
      author,
      permlink,
    }
    window.ReactNativeWebView.postMessage(JSON.stringify(result));
    return false;
  }
  if (el.classList.contains('markdown-tag-link')) {
    let tag = el.getAttribute('data-tag');
    const result = {
      type: 'markdown-tag-link',
      tag
    }
    window.ReactNativeWebView.postMessage(JSON.stringify(result));
    return false;
  }
  if (el.classList.contains('markdown-witnesses-link')) {
    
    const result = {
      type: 'markdown-witnesses-link'
    }
    window.ReactNativeWebView.postMessage(JSON.stringify(result));
    return false;
  }
  if (el.classList.contains('markdown-proposal-link')) {
    
    let proposal = el.getAttribute('data-proposal');
    const result = {
      type: 'markdown-proposal-link',
      proposal
    }
    window.ReactNativeWebView.postMessage(JSON.stringify(result));
    return false;
  }
  if (el.classList.contains('markdown-video-link')) {
    const embedSrc = '<iframe frameborder="0" allowfullscreen src="' + el.getAttribute('data-embed-src') + '"></iframe>';
    if (embedSrc) {
      el.innerHTML = embedSrc;
      return;
    }
    const videoHref = el.getAttribute('data-video-href');
    if (videoHref) {
      const result = {
        type: 'markdown-video-link',
        videoHref
      }
      window.ReactNativeWebView.postMessage(JSON.stringify(result));
      
      return false;
    }
  }
  const author = el.getAttribute('data-author').toString();
  window.ReactNativeWebView.postMessage(JSON.stringify(author));
})
true;`;
