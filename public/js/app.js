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
