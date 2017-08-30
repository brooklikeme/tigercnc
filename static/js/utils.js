/**
 * Created by josh on 17/8/30.
 */
/* utils.js */

function invokeAPI(url, data, type, callback) {
  $.ajax({
    url : url,
    data : data,
    type : type,
    contentType : 'application/json',
    dataType: 'json'
  }).done(function(data) {
    if (callback) {
      callback(data);
    }
    // console.log(type + " success!");
  });
}
//
function getURLParameter(name) {
    return decodeURIComponent(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
    );
}
