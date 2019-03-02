exports.ddMMyyyyhhmmss = function(offset){
    if(!offset) {
      offset = 0;
    }
    var today = new Date();
    var date = new Date(today.getTime() + offset*24*60*60*1000);
    var dd = date.getDate();
    var mm = date.getMonth()+1;
    var yyyy = date.getFullYear();

    if(dd<10) {
      dd='0'+dd;
    }

    var hh = date.getHours();
    var MM = date.getMinutes();
    var ss = date.getSeconds();

    if(hh<10) {
      hh='0'+hh;
    }

    if(MM<10) {
      MM='0'+MM;
    }

    if(ss<10) {
      ss='0'+ss;
    }


    var finalDate = dd+"-"+mm+"-"+yyyy+" "+hh+":"+MM+":"+ss+"."+date.getMilliseconds();
    return finalDate;
}
exports.getLoggerDate = function() {
  var date = new Date();
  return date.toLocaleDateString() + 'T' + date.toTimeString();
}
