/**
 * Created by Ken on 06/09/2015.
 */

function getTimeDifference(initialTime){
    var now = new Date();
    var init = new Date( initialTime );
    var diff = new Date(now - init);
    var turnToMin = diff/1000/60 +diff.getMinutes();
    return turnToMin*1000;
}
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
}
function mouseoverPass(obj) {
    document.getElementById('password').type = "text";
}
function mouseoutPass (obj) {
    document.getElementById('password').type = "password";
}
function mouseoverPass1(obj) {
    document.getElementById('password1').type = "text";
}
function mouseoutPass1 (obj) {
    document.getElementById('password1').type = "password";
}
function mouseoverPass2(obj) {
    document.getElementById('password2').type = "text";
}
function mouseoutPass2 (obj) {
    document.getElementById('password2').type = "password";
}