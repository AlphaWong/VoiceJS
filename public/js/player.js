var player_app = angular.module('player_app', ['ngMaterial']);
player_app.controller('playerCtrl', ['$scope', '$http', function ($scope, $http) {
    var self = this;
    self.vtt = "";
    getVtt(self,$http,function(res){
        self.vtt=res.data;
//        $scope.$apply;
    });
    function getVtt(self, $http, cb) {
        $http.get('/tracks/track.vtt').then(function (res) {
            console.log(res);
            if (angular.isDefined(cb)) {
                cb(res)
            }
        });
    }
}]);