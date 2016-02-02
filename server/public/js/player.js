'use strict';
var player_app = angular.module('player_app', ['ngMaterial']);
player_app.controller('playerCtrl', ['$scope', '$http', '$mdSidenav', '$filter', function ($scope, $http, $mdSidenav, $filter) {
    //TODO: Scope attributes;

    //TODO:attributes;
    const self = this,
        protocol = window.location.protocol,
        hostName = window.location.hostname;
    self.player = document.getElementById('player');
    //    self.subtitleId = '56a9b62a3804af59421c5093';
    self.subtitleId = undefined;


    //    self.video = encodeURIComponent(self.player.getAttribute('ng-src'));
    //    self.from = 'Alpha';
    self.from = getParameterByName('from');
    self.videoURL = getParameterByName('video');
    self.video = encodeURIComponent(self.videoURL);
    self.player.src = self.videoURL;
    self.checkURL = `${protocol}//${hostName}:8080/subtitles/${self.from}/${self.video}/findOne`;

    self.isEdit = false;
    self.tmpStartTime = undefined;
    self.tmpEndTime = undefined;
    self.tmpComment = undefined;
    self.tmpSubtitleId = undefined;

    self.cues = undefined;

    //Comment
    self.subtitleInComment = undefined;
    self.currentSubtitleInCommentId = undefined;
    //
    //TODO:methods;
    self.setEditor = (cue) => {
        setEditor(self, cue);
    };

    self.setCurrentTime = (cue) => {
        setCurrentTime(cue);
    };

    self.setReply = (cue) => {
        setReply(self, cue, () => {
            setComments(cue.id);
        });
    };

    self.setComments = () => {
        setComments(self);
    };

    self.setMask = (comment) => {
        let date = new Date(comment.createdAt);
        let from = comment.from;
        let hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
        let minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();

        return `${date.toLocaleDateString()} ${hours}:${minutes} \r by ${from}`;
    };

    self.sendComment = () => {
        getSubtitles(self, (res) => {
            let from = self.from,
                body = self.tmpReply,
                target = res.data.subtitles.find((subtitle, index) => {
                    if (subtitle._id == self.subtitleInComment._id) {
                        subtitle.comments.push({
                            from, body
                        });
                        return true;
                    }
                });
            setSubtitles(self, res, () => {
                clearTrack(self, () => {
                    getTrack(self, () => {
                        getSubtitles(self, (res) => {
                            setTrack(res.data.subtitles);
                            self.subtitleInit();
                            clearComments(self, () => {
                                self.subtitleInComment = res.data.subtitles.find((subtitle) => {
                                    return subtitle._id == self.currentSubtitleInCommentId;
                                });
                            });
                        });
                    });
                });
            });
        });
    };

    self.close = () => {
        setSidenav(() => {

        });
    };

    self.getVideoCurrentTime = (index) => {
        getVideoCurrentTime(() => {
            getTimeMask(self.player.currentTime, (timeMask) => {
                self[index] = timeMask;
            });
        });
    };

    self.setVideoCurrentTime = (cue) => {
        getSecondFromTimeMask(cue.startTime, (currentTime) => {
            self.player.currentTime = currentTime;
        });

    };

    self.subtitleInit = () => {
        self.tmpStartTime = undefined;
        self.tmpEndTime = undefined;
        self.tmpComment = undefined;
        self.isEdit = false;
    };

    self.sendSubtitle = (mode) => {
        getSubtitles(self, (res) => {
            getTmpSubtitle(self, (subtitle) => {
                switch (mode) {
                case 'save':
                    res.data.subtitles.push(subtitle); //TODO: main Logic;
                    break;
                case 'update':
                    let target = res.data.subtitles.find((_subtitle) => {
                        if (_subtitle._id == self.tmpSubtitleId) {
                            _subtitle.startTime = subtitle.startTime;
                            _subtitle.endTime = subtitle.endTime;
                            _subtitle.text = subtitle.text;
                            return true;
                        }
                    });
                    break;
                }
                setSubtitles(self, res, () => {
                    clearTrack(self, () => {
                        getTrack(self, () => {
                            getSubtitles(self, (res) => {
                                setTrack(res.data.subtitles);
                                self.subtitleInit();
                            });
                        });
                    });
                });
            });
        });
    };

    self.removeSubtitle = (cue) => {
        getSubtitles(self, (res) => {
            getSubutitleById(self, cue, res, (target) => {
                res.data.subtitles.splice(res.data.subtitles.indexOf(target), 1); //TODO: main Logic
                setSubtitles(self, res, () => {
                    clearTrack(self, () => {
                        getTrack(self, () => {
                            getSubtitles(self, (res) => {
                                setTrack(res.data.subtitles);
                                self.subtitleInit();
                            });
                        });
                    });
                });
            })
        });

    };
    //    

    //TODO:main
    isExist(self, $http, (res) => {
        setSelf('subtitleId', self, res.data, () => {
            clearTrack(self, () => {
                getTrack(self, () => {
                    getSubtitles(self, (res) => {
                        setTrack(res.data.subtitles);
                    });
                });
            });
        });

    });
    //

    function clearComments(self, cb) {
        self.currentSubtitleInCommentId = self.subtitleInComment._id + "";
        self.subtitleInComment = undefined;
        if (angular.isDefined(cb)) {
            cb();
        }
    };

    function clearTrack(self, cb) {
        angular.forEach(self.player.children, (track) => {
            track.remove();
        });
        if (angular.isDefined(cb)) {
            cb();
        }
    }

    function getTmpSubtitle(self, cb) {
        let subtitle = undefined;
        subtitle = {
            endTime: self.tmpEndTime,
            startTime: self.tmpStartTime,
            text: self.tmpComment
        };
        if (angular.isDefined(cb)) {
            cb(subtitle);
        }
    }

    function getSubutitleById(self, cue, res, cb) {
        let target = res.data.subtitles.filter((subtitle) => {
            return cue._id == subtitle._id;
        });
        if (angular.isDefined(cb)) {
            cb(target);
        }
    };

    function getTrack(self, cb) {
        let track = document.createElement('track'),
            track_url = `${protocol}//${hostName}:8080/subtitles/${self.subtitleId}`;
        track.src = track_url;
        track.kind = "subtitles";
        track.srclang = "en";
        track.label = "English"
        track.default = true;
        self.player.appendChild(track);
        if (angular.isDefined(cb)) {
            cb();
        }
    }

    function getSecondFromTimeMask(timeMask, cb) {
        let timeMarkArr = timeMask.split(':'),
            hours = Number.parseInt(timeMarkArr[0]),
            minutes = Number.parseInt(timeMarkArr[1]),
            seconds = Number.parseFloat(timeMarkArr[2]);
        seconds = hours * 60 * 60 + minutes * 60 + seconds;
        if (angular.isDefined(cb)) {
            cb(seconds);
        }
    }

    function getTimeMask(num, cb) {
        let sec_num = parseInt(num, 10),
            hours = Math.floor(sec_num / 3600),
            minutes = Math.floor((sec_num - (hours * 3600)) / 60),
            seconds = sec_num - (hours * 3600) - (minutes * 60),
            milliseconds = Number.parseInt(((Math.round(num * 1000) / 1000) - sec_num) * 1000);

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

    function setTrack(cues) {
        self.cues = cues;
    }

    function setCurrentTime(cue) {
        console.info(cue.startTime);
    }

    function setReply(self, cue, cb) {
        self.subtitleInComment = cue;
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

    function setSidenav(cb) {
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
        self.tmpStartTime = cue.startTime;
        self.tmpEndTime = cue.endTime;
        self.tmpSubtitleId = cue._id;
        if (angular.isDefined(cb)) {
            cb();
        }
    }

    function getSubtitles(self, cb) {
        let getLatestURL = `${protocol}//${hostName}:8080/subtitles2Json/${self.subtitleId}`;
        $http.get(getLatestURL).then((res) => {
            if (angular.isDefined(cb)) {
                cb(res);
            }
        }, (res) => {
            console.log(res);
        });
    }



    function setSubtitles(self, res, cb) {
        let url = `${protocol}//${hostName}:8080/subtitles/${self.subtitleId}`;
        $http.put(url, res.data).then((res) => {
            console.info(res);
        }, (res) => {

        })
        if (angular.isDefined(cb)) {
            cb();
        }
    }

    function setOneNewSubtitleObject(self, $http, cb) {
        let from = self.from,
            video = self.video,
            url = `${protocol}//${hostName}:8080/subtitles/`;
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

    function setSelf(key, self, data, cb) {
        self[key] = data._id;
        if (angular.isDefined(cb)) {
            cb(self);
        }
    }

    function sendComment(self, comment, cb) {
        if (angular.isDefined(cb)) {
            cb(self);
        }
    }

    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }
            }]);