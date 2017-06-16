"use strict";
exports.__esModule = true;
/**
 * CALLBACKS EXPECTS ARGUMENTS IN THE FORM OF:
 * DATA,
 * FUNCTION TO CALL WITH PREVIOUSLY MENTIONED DATA,
 * RESPONSE OBJECT FROM A REQUEST
 */
function callback() {
    var _this = this;
    var body = '';
    //Convert arguments to an actual array.
    //let args = [...arguments];
    var args = Array.prototype.slice.call(arguments);
    //The last argument is always the "response" object from any request (currently Http).
    var response = args.pop();
    //The last argument after that is the function that actually wants the data.
    var passData = args.pop();
    //The data from our requests might be returned in chunks. We add these together.
    response.on('data', function (chunk) {
        body += chunk;
    });
    //In the end we pass the received data and any additional parameters to the function.
    response.on('end', function () {
        passData.apply(_this, [body].concat(args));
    });
}
exports.callback = callback;
function basicLogCallback(response) {
    var body = '';
    response.on('data', function (chunk) {
        body += chunk;
    });
    response.on('end', function () {
        // console.log("Received data: " + (response));
    });
}
exports.basicLogCallback = basicLogCallback;
