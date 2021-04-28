

export default (url) => {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    var videoId = (match&&match[7].length==11)? match[7] : false;

    console.log("Extracting id ", videoId, url);
    return videoId;
}