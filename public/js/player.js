var player_app = angular.module('player_app', ['ngMaterial']);
player_app.controller('playerCtrl', ['$scope', '$http', function ($scope, $http) {
    //TODO:attributes;
    var self = this;
    self.track_url = 'tracks/track.vtt';
    self.vtt = "";
    self.cues = undefined;
    self.isEdit=false;
    //
    //TODO:methods;
    self.setTrack = function (track) {
        setTrack(track.track.cues);
    };
    self.setCurrentTime = function (cue) {
        setCurrentTime(cue);
    };
    self.setReply=function($event){
        $event.stopPropagation();
        setReply(self);
    };
    self.setEdit=function(){
        setEdit(self);
    }
    //
    //TODO main
    getVtt(self, $http, function (res) {
        self.vtt = res.data;

    });
    //
    function getVtt(self, $http, cb) {
        $http.get(self.track_url).then(function (res) {
            if (angular.isDefined(cb)) {
                cb(res);
            }
        });
    }

    function setSubtitles(self, cb) {
        if (angular.isDefined(cb)) {
            cb();
        }
    }

    function setTrack(cues) {
        self.cues = cues;
        $scope.$apply();
    }
    
    function setEdit(self){
        self.isEdit=!self.isEdit;
    }

    function setCurrentTime(cue) {
        console.info(cue.startTime);
    }
    
    function setReply(self){
        console.info(self);
    }

}]);