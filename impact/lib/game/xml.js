ig.baked = true;
ig.module('game.xml').defines(function() {
    ig.xml = function(url, data, callback) {
        var post = [];
        if (data) {
            for (var key in data) {
                post.push(key + '=' + encodeURIComponent(data[key]));
            }
        }
        var postString = post.join('&');
        var xml = new XMLHttpRequest();
        if (callback) {
            xml.onreadystatechange = function() {
                if (xml.readyState == 4) {
                    callback(JSON.parse(xml.responseText));
                }
            }
            ;
        }
        xml.open('POST', url);
        xml.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xml.send(postString);
    }
    ;
});