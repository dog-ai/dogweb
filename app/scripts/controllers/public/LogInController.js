/*
 * Copyright (C) 2015 dog.ai, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

'use strict';
/**
 * @ngdoc function
 * @name dogwebApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Manages authentication to any active providers.
 */
angular.module('dogwebApp')
  .controller('LogInController', function ($scope, Auth, $location) {

    $scope.authenticate = function (email, password) {
      if ($scope.form.$invalid) {
        return;
      }

      Auth.$authWithPassword({email: email, password: password}, {rememberMe: true}).then(redirect, error);
    };

    function redirect() {
      $location.path('/dashboard');
    }

    function error(error) {
      $scope.error = error;
    }
  });
