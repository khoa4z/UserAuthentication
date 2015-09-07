/**
 * Created by Ken on 06/09/2015.
 */

app.controller('HomeCtrl', ['$scope', '$rootScope', '$state', function($scope, $rootScope, $state){
    $rootScope.PAGE = 'home';
    $scope.homeTest = "Example One";

    //$state.go('signin');
}]);

app.controller('LogInCtrl', function($scope, $rootScope, $state, Login, $window, $remember, $forget){
    console.log("in login Ctrl");
    console.log($state.current.name);

    $scope.formData = {
        email       :'',
        password    :''
    };

    $scope.remember = false;
    if (getCookie('email') && getCookie('password23') ) {
        $scope.remember = true;
        $scope.formData.email = getCookie('email');
        $scope.formData.password = getCookie('password23');
    }

    $scope.submitForm = function(isValid){
        console.log($scope.formData);
        $scope.warning = '';

        Login.save($scope.formData, function(data){
            //console.log('DEBUG', data);
            $window.sessionStorage.token = data.token;
            $scope.updateUser(data.user);
            $scope.error = false;

            if($scope.remember){
                $remember('email', $scope.formData.email);
                $remember('password23', $scope.formData.password);
            }
            else {
                $forget('email');
                $forget('password23');
            }

            $state.go('apollo');


        }, function(err){
            console.log('DEBUG', err);
            //@todo:Check Email Authentication
            if(err.data === 'failed'){
                $scope.warning = "We can't find your account in the system";
            }
            if(err.data === 'EmailAuthentication'){
                $scope.warning = 'Please check your email and verify your account';
            }
        });
    };
});

app.controller('AuthorizationController', ['$scope', '$rootScope', '$window', 'lodash', '$state', '$timeout', function ($scope, $rootScope, $window, _, $state, $timeout) {
    //$scope.timeInMs = 0;

    var countUp = function() {
        if ($rootScope.timeInMs > -1) {
            $rootScope.timeInMs += 500;
            $timeout(countUp, 500);
        }
    }
    if($rootScope.timeInMs > -1){
        $timeout(countUp, 500);
    }

    $scope._user = {};
    console.log('In Authorization Controller: Empty?', _.isEmpty($scope._user));

    //@TODO Really shouldn't be using two-way data binding as events ::(
    $scope._isLoggedIn = false;

    var checkSessionStore = function () {
        console.log('Checking session store for user....');
        if ($window.sessionStorage._user !== undefined) {
            $scope._user = JSON.parse($window.sessionStorage._user);
            $scope._isLoggedIn = true;
            console.log('Reassigned:', $scope._user);
        } else {
            console.log('DEBUG: Nothing in session store.');
        }
    };

    $scope.updateUser = function (data) {       //For log in
                                                // Clone data to _user
        $scope._user = _.cloneDeep(data);
        // Store in session storage
        $window.sessionStorage._user = JSON.stringify(data);
        $window.sessionStorage.expire = data.expiration;    //Check expire time
        $window.sessionStorage.loginTime = new Date();      //set current time

        $scope._isLoggedIn = true;
        $rootScope.timeInMs = 0;
        $timeout(countUp, 500);
    };

    $scope.isLoggedIn = function () {
        return _.isEmpty($scope._user) != true;
    };

    $scope.logout = function () {
        console.log('Logging user \'' + $scope._user.userName + '\' out.');
        delete $window.sessionStorage.token;
        delete $window.sessionStorage._user;
        $scope._isLoggedIn = false;
        $rootScope.timeInMs = -1;
    };

    $scope.getUserId = function () {
        console.log('getUserId', $scope._user);
        return $scope._user._id;
    };

    $scope.getUser = function () {
        if ($scope.isLoggedIn()) {
            return $scope._user;
        } else {
            return null;
        }
    };

    $scope.getName = function () {
        return $scope._user.userName;
    };

    checkSessionStore();

    $scope.$watch('timeInMs', function(){
        if($rootScope.timeInMs != null && $rootScope.timeInMs > -1){
            console.log($window.sessionStorage.expire*1000*60);
            if($rootScope.timeInMs > $window.sessionStorage.expire*1000*60){
                $scope.logout();
                $('#sessionExpireModal').modal('show');
                $('#sessionExpireModal').on('hidden.bs.modal', function () {
                    $state.go('signin');
                });
            }
        }
    });
}]);

app.controller('LogOutCtrl', function($scope, $rootScope, $state){
    $scope.logout();
    $('#successLogOutModal').modal('show');
    $('#successLogOutModal').on('hidden.bs.modal', function () {
        $state.go('signin');
    });
});
