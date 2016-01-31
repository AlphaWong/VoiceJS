'use strict';
var player_app = angular.module('player_app', ['ngMaterial']);
player_app.controller('playerCtrl', ['$scope', '$http', '$mdSidenav', '$filter', function ($scope, $http, $mdSidenav, $filter) {
    //TODO:attributes;
    const self = this,
        protocol = window.location.protocol,
        hostName = window.location.hostname;
    self.player = document.getElementById('player');
    self.subtitleId = '56a9b62a3804af59421c5093';

    self.video = encodeURIComponent(self.player.getAttribute('ng-src'));
    self.from = 'Alpha';
    self.checkURL = `${protocol}//${hostName}:3000/subtitles/${self.from}/${self.video}/findOne`;

    self.isEdit = false;
    self.tmpStartTime = undefined;
    self.tmpEndTime = undefined;
    self.tmpComment = undefined;

    self.cues = undefined;
    //
    //TODO:methods;
    self.setEditor = (cue) => {
        setEditor(self, cue);
    };

    self.setCurrentTime = (cue) => {
        setCurrentTime(cue);
    };

    self.setReply = (cue) => {
        setReply(self, () => {
            setComments(cue.id);
        });
    };

    self.setComments = () => {
        setComments(self);
    };

    self.close = () => {
        setSidenav();
    };

    self.getVideoCurrentTime = (index) => {
        getVideoCurrentTime(() => {
            getTimeMask(self.player.currentTime, (timeMask) => {
                self[index] = timeMask;
            });
        });
    };

    self.setVideoCurrentTime = (cue) => {
        self.player.currentTime = cue.startTime;
    };

    self.subtitleInit = () => {
        self.tmpStartTime = undefined;
        self.tmpEndTime = undefined;
        self.tmpComment = undefined;
        self.isEdit = false;
    };

    self.sendSubtitle = () => {
        getSubtitles(self, (res) => {
            setSubtitles(self, res, () => {
                clearTrack(self, () => {
                    getTrack(self, () => {
                        self.subtitleInit();
                    });
                });
            });
        });
    };
    //    

    //TODO:main
    isExist(self, $http, (res) => {
        setSubtitleId(self, res.data, () => {
            clearTrack(self, () => {
                getTrack(self, () => {

                });
            });
        });

    });
    //

    function clearTrack(self, cb) {
        angular.forEach(self.player.children, (track) => {
            track.remove();
        });
        if (angular.isDefined(cb)) {
            cb();
        }
    }

    function getTrack(self, cb) {
        let track = document.createElement('track'),
            track_url = `${protocol}//${hostName}:3000/subtitles/${self.subtitleId}`;
        track.src = track_url;
        track.kind = "subtitles";
        track.srclang = "en";
        track.label = "English"
        track.default = true;
        track.onload = (event) => {
            setTrack(event.target.track.cues);
        };
        self.player.appendChild(track);
        if (angular.isDefined(cb)) {
            cb();
        }
    }

    function getTimeMask(num, cb) {
        let sec_num = parseInt(num, 10); // don't forget the second param
        let hours = Math.floor(sec_num / 3600);
        let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        let seconds = sec_num - (hours * 3600) - (minutes * 60);
        let milliseconds = Number.parseInt(((Math.round(num * 1000) / 1000) - sec_num) * 1000);

        if (hours.toString().length == 1) {
            hours = "0" + hours + "";
        }
        if (minutes.toString().length == 1) {
            minutes = "0" + minutes;
        }
        if (seconds.toString().length == 1) {
            seconds = "0" + seconds + "";
        }

        if (milliseconds.toString().length == 2) {
            milliseconds = "0" + milliseconds;
        } else if (milliseconds.toString().length == 1) {
            milliseconds = "00" + milliseconds + "";
        }

        let timeMask = `${hours}:${minutes}:${seconds}.${milliseconds}`;
        if (angular.isDefined(cb)) {
            cb(timeMask);
        }
    }

    function isExist(self, $http, cb) {
        $http.get(self.checkURL).then((res) => {
            if (angular.isDefined(cb)) {
                cb(res);
            }

        }, (res) => {
            setOneNewSubtitleObject(self, $http, (res) => {
                if (angular.isDefined(cb)) {
                    cb(res);
                }
            });
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

    function setEditor(self, cue, cb) {
        self.isEdit = true;
        self.tmpComment = cue.text;
        getTimeMask(cue.startTime, (startTime) => {
            self.tmpStartTime = startTime;
            getTimeMask(cue.endTime, (endTime) => {
                self.tmpEndTime = endTime;
            });
        });
        if (angular.isDefined(cb)) {
            cb();
        }
    }

    function getSubtitles(self, cb) {
        let method = undefined;
        let subtitle = undefined;
        let getLatestURL = `${protocol}//${hostName}:3000/subtitles2Json/${self.subtitleId}`;
        $http.get(getLatestURL).then((res) => {
            if (angular.isDefined(cb)) {
                cb(res);
            }
        }, (res) => {
            console.log(res);
        });
    }

    function setSubtitles(self, res, cb) {
        let subtitle = undefined;
        let url = `${protocol}//${hostName}:3000/subtitles/${self.subtitleId}`;
        subtitle = {
            endTime: self.tmpEndTime,
            startTime: self.tmpStartTime,
            text: self.tmpComment
        };
        res.data.subtitles.push(subtitle);
        $http.put(url, res.data).then((res) => {
            console.log(res);
        }, (res) => {

        })
        if (angular.isDefined(cb)) {
            cb();
        }
    }

    function setOneNewSubtitleObject(self, $http, cb) {
        let from = self.from,
            video = self.video;
        let url = `${protocol}//${hostName}:3000/subtitles/`;
        $http.post(url, {
            from,
            video
        }).then((res) => {
            if (angular.isDefined(cb)) {
                cb(res);
            }
        }, (res) => {
            console.log(res);
        })

    }

    function setSubtitleId(self, data, cb) {
        self.subtitleId = data._id;
        if (angular.isDefined(cb)) {
            cb(self);
        }
    }
}]);