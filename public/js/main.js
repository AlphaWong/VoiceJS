var recordRTC = undefined;
var setRecord2Stop = undefined;
//    var getUserMedia = (navigator.getUserMedia ||
//        navigator.webkitGetUserMedia ||
//        navigator.mozGetUserMedia);
var constraints = {
    audio: true
};

function setRecord2Start() {
    navigator.getUserMedia(constraints, function (mediaStream) {
        recordRTC = RecordRTC(mediaStream, {
            recorderType: StereoAudioRecorder // optionally force WebAudio API to record audio
        });
        recordRTC.startRecording();

        setRecord2Stop = function () {
            recordRTC.stopRecording(function (audioURL) {
                var mediaElement = document.getElementById("player");
                recordRTC.getDataURL(function (audioURLs) {
                    mediaElement.src = (audioURL);
                    mediaStream.stop();
                    ajax("POST", "http://127.0.0.1:3000/uploads/voice", recordRTC.getBlob(), function (res) {
                        console.log(res);
                    });
                });
            });
        }
    }, function () {
        console.log("ERROR");
    })
}

function ajax(method, url, blob, cb) {
    var http = new XMLHttpRequest();
    var formData = new FormData();
    formData.append("voice", blob);
    http.open(method, url, true);
    http.onreadystatechange = function () { //Call a function when the state changes.
        if (http.readyState == 4 && http.status == 200) {
            cb(http.responseText)
        }
    }
    http.send(formData);
}