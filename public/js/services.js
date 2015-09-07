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

