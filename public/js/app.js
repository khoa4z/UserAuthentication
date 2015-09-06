/**
 * Created by Ken on 03/09/2015.

 (\(\
 (=':')
 (,(")(")  */


var app = angular.module('AthenApp', ['ui.router', 'ngResource', 'ngMessages', 'ngLodash', 'ngRoute']);
app.config([ '$stateProvider', '$urlRouterProvider','$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider){
    $locationProvider.html5Mode({       //ngRoute is required for this
        enabled : true,
        requireBase : false
    });
    $urlRouterProvider.otherwise('/');  //default
    $stateProvider
        .state('home',{
            url:'/',
            templateUrl: '/views/home.html',
            controller:'HomeCtrl',
            data: {authenticate: false}
        })
        .state('register',{
            url:'/register',
            templateUrl: '/views/signup.html',
            controller:'SignUpCtrl',
            data: {authenticate: false}
        })
        .state('signin',{
            url:'/signin',
            templateUrl: '/views/login.html',
            controller:'LogInCtrl',
            data: {authenticate: false}
        })
        .state('apollo',{
            url:'/apollo',
            templateUrl: '/views/apollo.html',
            //controller:'LogInCtrl',
/*-------*/ data: {authenticate: true}
        })
        .state('signout', {
            url: '/signout',
            templateUrl: '/views/logout.html',
            controller: 'LogOutCtrl',
            data: {authenticate: false}
        })
}]);

app.run(function ($rootScope, $state, $window) {
    $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams){
        if (toState.data.authenticate && $window.sessionStorage.token == undefined){
            console.log(" User isn’t authenticated ");
            console.log('Should be authenticated! Token: ', $window.sessionStorage.token !== undefined);
            $state.transitionTo("signin");
            event.preventDefault();
        } // Avoid pages
        var statesToAvoid = ['signin','register'];
        if(statesToAvoid.indexOf(toState.name)>=0 && $window.sessionStorage.token !== undefined){
            $state.go("apollo");
            event.preventDefault();
        }
    });
});

app.controller('HomeCtrl', ['$scope', '$rootScope', '$state', function($scope, $rootScope, $state){
    $rootScope.PAGE = 'home';
    $scope.homeTest = "Example One";

    $state.go('signin');
}]);

app.factory('ResourceAuthSetup', [function () {
    return function (token) {
        return {
            query:  {method: 'GET', headers: {'Authorization': 'Bearer ' + token}, isArray: true},
            get:    {method: 'GET', headers: {'Authorization': 'Bearer ' + token}},
            save:   {method: 'POST', headers: {'Authorization': 'Bearer ' + token}},
            remove: {method: 'DELETE', headers: {'Authorization': 'Bearer ' + token}},
            delete: {method: 'DELETE', headers: {'Authorization': 'Bearer ' + token}}
        }
    };
}]);

app.factory('UserUnauth', ['$resource', 'ResourceAuthSetup', function ($resource, ResourceAuthSetup) {
    return {
        createRestrictedResource: function (token) {
            return $resource('/user/:id', null, ResourceAuthSetup(token));
        }
    }
}]);

app.factory('Login', ['$resource', function ($resource) {
    return $resource('/login');
}]);

app.controller('SignUpCtrl', function($scope, $rootScope, $state, UserUnauth, $window){
    $scope.formData = {
        email   :   'kennguyen@live.com',
        userName:   '123',
        password1:  '456',
        password2:  '456'
    };
    $scope.agreement = 'Lucas ipsum dolor sit amet skywalker leia solo solo yavin darth jinn gonk yoda chewbacca. Lando skywalker padmé leia grievous calrissian antilles. Owen maul wedge qui-gonn hutt antilles calrissian. K-3po calrissian darth moff coruscant jade. Lobot coruscant mustafar calrissian kenobi mandalore yavin. Dooku thrawn antilles utapau kit jade hutt dooku antilles. Kessel solo grievous antilles c-3po skywalker mon moff. Yoda watto hutt thrawn kit darth. R2-d2 kenobi maul alderaan yoda dooku. Jabba lars gonk darth c-3p0 mothma coruscant c-3po ewok.';
    var _User = UserUnauth.createRestrictedResource($window.sessionStorage.token);

    $scope.submitForm = function (isValid) {
        if (isValid && $scope.checkPassword($scope.formData.password1, $scope.formData.password2)) {
            _User.save($scope.formData, function (data) {
                console.log('Saved user!');
            }, function (err) {
                console.log('There was an error, email and or username may already exist.', err);
            });

            $('#emailModal').modal('show');
        } else {
            console.log('DEBUG: Invalid form data.');
        }
    };

    $scope.checkPassword = function (p1, p2) {
        return p1 === p2;
    };

    $('#emailModal').on('hidden.bs.modal', function () {
        $state.go('login');
    });
});


app.factory('$remember', function() {
    function fetchValue(name) {
        var gCookieVal = document.cookie.split("; ");
        for (var i=0; i < gCookieVal.length; i++)
        {
            // a name/value pair (a crumb) is separated by an equal sign
            var gCrumb = gCookieVal[i].split("=");
            if (name === gCrumb[0])
            {
                var value = '';
                try {
                    value = angular.fromJson(gCrumb[1]);
                } catch(e) {
                    value = unescape(gCrumb[1]);
                }
                return value;
            }
        }
        // a cookie with the requested name does not exist
        return null;
    }
    return function(name, values) {
        if(arguments.length === 1) return fetchValue(name);
        var cookie = name + '=';
        if(typeof values === 'object') {
            var expires = '';
            cookie += (typeof values.value === 'object') ? angular.toJson(values.value) + ';' : values.value + ';';
            if(values.expires) {
                var date = new Date();
                date.setTime( date.getTime() + (values.expires * 24 *60 * 60 * 1000));
                expires = date.toGMTString();
            }
            cookie += (!values.session) ? 'expires=' + expires + ';' : '';
            cookie += (values.path) ? 'path=' + values.path + ';' : '';
            cookie += (values.secure) ? 'secure;' : '';
        } else {
            cookie += values + ';';
        }
        document.cookie = cookie;
    }
});

app.controller('LogInCtrl', function($scope, $rootScope, $state, Login, $window, $remember){
    console.log("in login Ctrl");
    console.log($state.current.name);

    $scope.formData = {
        email       :'kennguyen@live.com',
        password    :'456'
    };

    $scope.remember = false;
    if ($remember('username') && $remember('password') ) {
        console.log('remember');
        $scope.remember = true;
        $scope.formData.email = $remember('username');
        $scope.formData.password = $remember('password');
    }
    $scope.rememberMe = function() {
        if ($scope.remember) {
            console.log("storing");
            $remember('username', $scope.formData.email);
            $remember('password', $scope.formData.password);
        } else {
            console.log("not Storing");
            $remember('username', '');
            $remember('password', '');
        }
    };

    $scope.submitForm = function(isValid){
        console.log($scope.formData);

        Login.save($scope.formData, function(data){
            console.log('DEBUG', data);
            $window.sessionStorage.token = data.token;
            $scope.updateUser(data.user);
            $scope.error = false;
            $state.go('apollo');
        }, function(err){

        });
    };
});

app.controller('AuthorizationController', ['$scope', '$rootScope', '$window', 'lodash', '$state', function ($scope, $rootScope, $window, _, $state) {

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
            var init = new Date( $window.sessionStorage.loginTime);
            //var data = $window.sessionStorage.token;
            //console.log(data);
            //data = JSON.parse(data);
            //console.log(data);
            //
            var expirationInMinutes = $window.sessionStorage.expire;

            //expiration.setMinutes();
            //console.log(expirationInMinutes);

            console.log (now);
            console.log($window.sessionStorage.loginTime);

            var diff = now - init;
            diff = new Date(diff);
            //alert(diff);
            console.log(diff/1000/60/60);
            console.log(diff.getMinutes());
            console.log(diff.getSeconds());

            // ditch the content if too old
            //if (now.getTime() > expiration.getTime()) {
            //    data = false;
            //    $scope.logout();
            //}


        } else {
            console.log('DEBUG: Nothing in session store.');
        }
    };

    $scope.updateUser = function (data) {
        console.log(data);
        // Clone data to _user
        $scope._user = _.cloneDeep(data);
        console.log('updateUser', $scope._user);
        // Store in session storage
        $window.sessionStorage._user = JSON.stringify(data);
        $window.sessionStorage.expire = data.expiration;    //Check expire time
        $window.sessionStorage.loginTime = new Date();      //set current time
        $scope._isLoggedIn = true;
    };

    $scope.isLoggedIn = function () {
        return _.isEmpty($scope._user) != true;
    };

    $scope.logout = function () {
        console.log('Logging user \'' + $scope._user.userName + '\' out.');
        delete $window.sessionStorage.token;
        delete $window.sessionStorage._user;
        $scope._isLoggedIn = false;
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
}]);

app.controller('LogOutCtrl', function($scope, $rootScope, $state){
    $scope.logout();
    $('#successLogOutModal').modal('show');
    $('#successLogOutModal').on('hidden.bs.modal', function () {
        $state.go('signin');
    });
});



function mouseoverPass(obj) {
    document.getElementById('password').type = "text";
}
function mouseoutPass (obj) {
    document.getElementById('password').type = "password";
}
function mouseoverPass1(obj) {
    document.getElementById('password1').type = "text";
}
function mouseoutPass1 (obj) {
    document.getElementById('password1').type = "password";
}
function mouseoverPass2(obj) {
    document.getElementById('password2').type = "text";
}
function mouseoutPass2 (obj) {
    document.getElementById('password2').type = "password";
}