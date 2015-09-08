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
            if(err.data === 'failed'){
                $scope.warning = "We can't find your account in the system";
            }
            if(err.data === 'EmailAuthentication'){
                $scope.warning = 'Please check your email and verify your account';
            }
        });
    };
});

app.controller('AuthorizationController',  function ($scope, $rootScope, $window, lodash, $state, $timeout) {
    //$scope.timeInMs = 0;
var _ = lodash;

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

            var now = new Date();
            var before = new Date($window.sessionStorage.loginTime);
            var diff = now.getTime() - before.getTime();

            if(diff/1000/60 > $window.sessionStorage.expire){
                $scope.logout();
                $state.go('signin');
            }
        } else {
            console.log('DEBUG: Nothing in session store.');
        }
    };

    $scope.updateUser = function (data) {       //For log in
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
        delete $window.sessionStorage.expire;
        delete $window.sessionStorage.loginTime;
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
            if($rootScope.timeInMs > $window.sessionStorage.expire*1000*60){
                $scope.logout();
                $('#sessionExpireModal').modal('show');
                $('#sessionExpireModal').on('hidden.bs.modal', function () {
                    $state.go('signin');
                });
            }
        }
    });
});

app.controller('LogOutCtrl', function($scope, $rootScope, $state){
    $scope.logout();
    $('#successLogOutModal').modal('show');
    $('#successLogOutModal').on('hidden.bs.modal', function () {
        $state.go('signin');
    });
});

app.controller('ApolloCtrl', function($scope){
    //@todo: test with Token
    $scope.clickTest = function(){

    };
});

app.controller('SignUpCtrl', function($scope, $rootScope, $state, UserUnauth, $window){
    $scope.formData = {
        email   :   '',
        userName:   '',
        password1:  '',
        password2:  ''
    };
    $scope.agreement = 'Lucas ipsum dolor sit amet skywalker leia solo solo yavin darth jinn gonk yoda chewbacca. Lando skywalker padmé leia grievous calrissian antilles. Owen maul wedge qui-gonn hutt antilles calrissian. K-3po calrissian darth moff coruscant jade. Lobot coruscant mustafar calrissian kenobi mandalore yavin. Dooku thrawn antilles utapau kit jade hutt dooku antilles. Kessel solo grievous antilles c-3po skywalker mon moff. Yoda watto hutt thrawn kit darth. R2-d2 kenobi maul alderaan yoda dooku. Jabba lars gonk darth c-3p0 mothma coruscant c-3po ewok.';
    var _User = UserUnauth.createRestrictedResource($window.sessionStorage.token);

    $scope.submitForm = function (isValid) {
        $scope.emailWarning = '';
        $scope.userNameWarning = '';
        if (isValid && $scope.checkPassword($scope.formData.password1, $scope.formData.password2)) {
            _User.save($scope.formData, function (data) {
                console.log('Saved user!');
                $('#emailModal').modal('show');
            }, function (err) {
                console.log('There was an error, email and or username may already exist.', err);
                if(err.data === 'Same email'){
                    console.log("same email");
                    $scope.emailWarning = "This email is used. Please try another one.";
                }
                if(err.data === 'Same userName'){
                    console.log("same userName");
                    $scope.userNameWarning = "This user name is used. Please try another one.";
                }
            });
        } else {
            console.log('DEBUG: Invalid form data.');
        }
    };

    $scope.checkPassword = function (p1, p2) {
        return p1 === p2;
    };

    $('#emailModal').on('hidden.bs.modal', function () {
        $state.go('signin');
    });
});