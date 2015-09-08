/**
 * Created by Ken on 06/09/2015.
 */

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

app.factory('$remember', function() {
    return function(name, values) {
        var cookie = name + '=';
        cookie += values + ';';
        var date = new Date();
        date.setDate(date.getDate() + 365);
        cookie += 'expires=' + date.toString() + ';';
        document.cookie = cookie;
    }
});

app.factory('$forget', function() {
    return function(name) {
        var cookie = name + '=;';
        cookie += 'expires=' + (new Date()).toString() + ';';
        document.cookie = cookie;
    }
});

app.factory('Mission', ['$resource', function ($resource) {
    var map = function (token) {
        return {
            query:  {method: 'GET',     headers: {'Authorization': 'Bearer ' + token}, isArray: false},
            get:    {method: 'GET',     headers: {'Authorization': 'Bearer ' + token}},
            save:   {method: 'POST',    headers: {'Authorization': 'Bearer ' + token}},
            remove: {method: 'DELETE',  headers: {'Authorization': 'Bearer ' + token}},
            delete: {method: 'DELETE',  headers: {'Authorization': 'Bearer ' + token}}
        };
    };
    return {
        createRestrictedResource: function (token) {
            return $resource('/api/v1/mission/:id', null, map(token));
        }
    }
}]);