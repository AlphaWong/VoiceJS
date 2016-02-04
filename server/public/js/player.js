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
    self.owner = undefined;
    //    self.video = encodeURIComponent(self.player.getAttribute('ng-src'));
    //    self.from = 'Alpha';
    self.from = getParameterByName('from');
    self.videoURL = getParameterByName('video');
    self.whoami = getParameterByName('whoami');
    self.video = encodeURIComponent(self.videoURL);
    self.player.src = self.videoURL;
    self.checkURL = `${protocol}//${hostName}:8080/subtitles/${self.from}/${self.video}/findOne`;
    //    self.checkURL = `${protocol}//${hostName}:8080/subtitles/${self.video}/findOne`;

    //Socket
    self.socketURL = `${protocol}//${hostName}:8080`;
    let socket = io.connect(self.socketURL);
    socket.on('status', function (data) {
        console.log(data);
        socket.on('update', function (data) {
            console.log(data);
            if (data._id === self.subtitleId) {
                clearTrack(self, () => {
                    getTrack(self, () => {
                        setTrack(data.subtitles, (self) => {
                            clearComments(self, () => {
                                self.subtitleInComment = data.subtitles.find((subtitle) => {
                                    return subtitle._id == self.currentSubtitleInCommentId;
                                });
                                $scope.$apply();
                            });
                        });
                    });
                });
            }
        });
    });

    //

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

    //RECORD RTC
    let recordRTC = undefined;
    self.isOnAir = false;
    self.getVoice = () => {
        getVoice(self, () => {

        });
    };
    self.setVoice = () => {
        setVoice(self, (res) => {
            self.currentVoiceURL = res.data.url;
            self.sendComment('voice');
        });
    };
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

    self.isVoice = (comment) => {
        return angular.isDefined(comment.url) && comment.url.length > 0;
    };

    self.sendComment = (mode) => {
        getSubtitles(self, (res) => {
            let from = self.whoami,
                bean = undefined;
            switch (mode) {
            case 'text':
                let body = self.tmpReply;
                bean = {
                    from, body
                };
                break;
            case 'voice':
                let url = self.currentVoiceURL;
                bean = {
                    from, url
                };
                break;
            }
            let target = res.data.subtitles.find((subtitle, index) => {
                if (subtitle._id === self.subtitleInComment._id) {
                    subtitle.comments.push(bean);
                    return true;
                }
            });
            setSubtitles(self, res, () => {
                self.subtitleInit();
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
        self.currentVoiceURL = undefined;
        self.tmpReply = undefined;
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
                        if (_subtitle._id === self.tmpSubtitleId) {
                            _subtitle.startTime = subtitle.startTime;
                            _subtitle.endTime = subtitle.endTime;
                            _subtitle.text = subtitle.text;
                            return true;
                        }
                    });
                    break;
                }
                setSubtitles(self, res, () => {
                    self.subtitleInit();
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
    isVaildParms(self, () => {
        isExist(self, $http, (res) => {
            isOwner(self, res, () => {
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
        });
    });


    function isVaildParms(self, cb) {
        if (self.video.length <= 0 || self.from <= 0 || self.whoami <= 0) {
            console.warn(`missing parms`);
        } else {
            if (angular.isDefined(cb)) {
                cb();
            }
        }
    }

    function clearComments(self, cb) {
        //        self.currentSubtitleInCommentId = self.subtitleInComment._id + "";
        self.currentSubtitleInCommentId = angular.isDefined(self.subtitleInComment) ? self.subtitleInComment._id + "" : undefined;
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
            return cue._id === subtitle._id;
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

        if (hours.toString().length === 1) {
            hours = "0" + hours + "";
        }
        if (minutes.toString().length === 1) {
            minutes = "0" + minutes;
        }
        if (seconds.toString().length === 1) {
            seconds = "0" + seconds + "";
        }

        if (milliseconds.toString().length === 2) {
            milliseconds = "0" + milliseconds;
        } else if (milliseconds.toString().length === 1) {
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

    function setTrack(cues, cb) {
        angular.forEach(cues, (item) => {
            getSecondFromTimeMask(item.startTime, (second) => {
                item.second = second;
            })
            self.cues = cues;
        });
        if (angular.isDefined(cb)) {
            cb(self);
        }
    }

    function setCurrentTime(cue) {
        console.info(cue.startTime);
    }

    function setReply(self, cue, cb) {
        self.subtitleInComment = cue;
        if (angular.isDefined(cb)) {
            cb(self);
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

            if (angular.isDefined(cb)) {
                cb();
            }
        }, (res) => {
            console.info(res);
        })

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

    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    function getVoice(self, cb) {
        self.isOnAir = true;
        let option = {
            audio: true
        };
        navigator.getUserMedia(option, (mediaStream) => {
            recordRTC = RecordRTC(mediaStream, {
                recorderType: StereoAudioRecorder // optionally force WebAudio API to record audio
            });
            recordRTC.startRecording();
            self.mediaStream = mediaStream;
        }, () => {
            console.log("ERROR");
        })
        if (angular.isDefined(cb)) {
            cb(self);
        }
    }

    function isOwner(self, res, cb) {
        //        self.owner = res.data.from;
        self.isOwner = self.whoami === self.from;
        console.log(self.whoami);
        if (angular.isDefined(cb)) {
            cb(self);
        }
    }

    function setVoice(self, cb) {
        self.isOnAir = false;
        recordRTC.stopRecording(function (audioURL) {
            self.mediaStream.stop();
            let url = `${protocol}//${hostName}:8080/uploads/voice`,
                formData = new FormData(),
                blob = recordRTC.getBlob();
            formData.append('voice', blob);
            $http.post(url, formData, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            }).then((res) => {
                if (angular.isDefined(cb)) {
                    cb(res);
                }
            });
        });

    }

}]);