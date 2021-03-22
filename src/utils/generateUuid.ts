export default ({short}:{short:boolean} = {short:false}): string => {
    var d = new Date().getTime(); //Timestamp
    var d2 = 0;
    const variant = short
      ? 'xxxx-4xxx-yxxx'
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
    return variant.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16; //random number between 0 and 16
      if (d > 0) {
        //Use timestamp until depleted
        r = (d + r) % 16 | 0;
        d = Math.floor(d / 16);
      } else {
        //Use microseconds since page-load if supported
        r = (d2 + r) % 16 | 0;
        d2 = Math.floor(d2 / 16);
      }
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  };