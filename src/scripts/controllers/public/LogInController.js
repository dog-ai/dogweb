/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

'use strict';

angular.module('dogweb')
  .controller('LogInController', function ($scope, Auth, User, $state, $stateParams) {
    $scope.$stateParams = $stateParams;

    $scope.authenticate = function (email, password) {
      if ($scope.form.$invalid) {
        return;
      }

      Auth.$authWithPassword({email: email, password: password}, {rememberMe: true})
        .then(function (auth) {
          return User(auth.uid).$loaded();
        })
        .then(function (user) {
          if (user.is_enabled) {
            var stateName = $stateParams.to || 'private.content.dashboard';
            $state.go(stateName, $stateParams);

          } else {

            Auth.$unauth();
            $scope.error = 'We\'re sorry, but your account is not eligible for the private beta';
          }
        })
        .catch(function (error) {
          $scope.error = error;
        })
    };

  });
