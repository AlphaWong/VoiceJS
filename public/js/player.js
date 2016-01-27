var player_app = angular.module('player_app', ['ngMaterial']);
player_app.controller('playerCtrl', ['$scope', '$http', '$mdSidenav', '$filter', function ($scope, $http, $mdSidenav, $filter) {
    //TODO:attributes;
    var self = this;
    self.track_url = 'tracks/track.vtt';
    self.vtt = "";
    self.cues = undefined;
    self.video = document.getElementById('video');
    self.isEdit = false;
    self.tmpStartTime = undefined;
    self.tmpEndTime = undefined;
    self.tmpComment = undefined;
    //
    //TODO:methods;
    //    self.setVideo=function(player){
    //        self.video=player;  
    //    };
    self.setTrack = function (track) {
        setTrack(track.track.cues);
    };
    self.setCurrentTime = function (cue) {
        setCurrentTime(cue);
    };
    self.setReply = function (cue) {
        setReply(self, function () {
            setComments(cue.id);
        });
    };
    self.setEdit = function () {
        setEdit(self);
    };
    self.setComments = function () {
        setComments(self);
    };
    self.close = function () {
        setSidenav();
    };
    self.getVideoCurrentTime = function (index) {
        getRoundDown(self.video.currentTime, function (time) {
            self[index] = time;
        });

    };
    self.setVideoCurrentTime = function (cue) {
        self.video.currentTime = cue.startTime;
    };
    self.subtitleInit = function () {
        self.tmpStartTime = undefined;
        self.tmpEndTime = undefined;
        self.tmpComment = undefined;
    };
    //
    //TODO main
    getVtt(self, $http, function (res) {
        self.vtt = res.data;
    });
    //
    function getRoundDown(num, cb) {
        var sec_num = parseInt(num, 10); // don't forget the second param
        var hours = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);
        var milliseconds = (sec_num - Math.round(num * 1000) / 1000)*1000;
        
        if (hours.toString().length=1) {
            hours = "0" + hours+"";
        }
        if (minutes.toString().length=1) {
            minutes = "0" + minutes;
        }
        if (seconds.toString().length=1) {
            seconds = "0" + seconds+"";
        }
        
        if (milliseconds.toString().length=2) {
            milliseconds = "0" + milliseconds;
        }else if(milliseconds.toString().length=1){
            milliseconds = "00" + milliseconds+"";
        }
        

        if (angular.isDefined(cb)) {
            cb(num);
        }
    }

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

    function setEdit(self) {
        self.isEdit = !self.isEdit;
    }

    function setCurrentTime(cue) {
        console.info(cue.startTime);
    }

    function setReply(self, cb) {
        console.info(self);
        if (angular.isDefined(cb)) {
            cb();
        }
    }

    function setComments(self, cb) {
        $mdSidenav('comments_view').open();
        if (angular.isDefined(cb)) {
            cb();
        }
    }

    function setSidenav(cd) {
        $mdSidenav('comments_view').close()
        if (angular.isDefined(cb)) {
            cb();
        }
    }

    function getComment(cb) {
        if (angular.isDefined(cb)) {
            cb();
        }
    }

    function getVideoCurrentTime(cb) {
        if (angular.isDefined(cb)) {
            cb();
        }
    }
}]);