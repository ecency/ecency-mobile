

export default (url) => {
    var regExp = /(?:youtube.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu.be\/)([^"&?/\s]{11})/;
    var match = url.match(regExp);
    var videoId = (match&&match[1].length==11)? match[1] : false;

    console.log("Extracting id ", videoId, url);
    return videoId;
}