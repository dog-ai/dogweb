/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

'use strict';

angular.module('dogweb')
  .controller('LogInController', function ($scope, Auth, $location, Ref, $firebaseObject) {

    $scope.authenticate = function (email, password) {
      if ($scope.form.$invalid) {
        return;
      }

      Auth.$authWithPassword({email: email, password: password}, {rememberMe: true})
        .then(success, error);
    };

    function success(auth) {
      $firebaseObject(Ref.child('users/' + auth.uid)).$loaded().then(function (user) {
        if (user.is_enabled) {
          redirect();
        } else {
          Auth.$unauth();
          error('We\'re sorry, but your account is not eligible for the private beta')
        }
      }, error);
    }

    function redirect() {
      $location.path('/dashboard');
    }

    function error(error) {
      $scope.error = error;
    }
  });
