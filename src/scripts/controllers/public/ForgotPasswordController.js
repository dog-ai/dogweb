/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

'use strict';
/**
 * @ngdoc function
 * @name dogweb.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Manages authentication to any active providers.
 */
angular.module('dogweb')
  .controller('ForgotPasswordController', function ($scope, Auth) {

    $scope.reset = function (email) {
      if ($scope.form.$invalid) {
        return;
      }

      Auth.$resetPassword({email: email}).then(
        function () {
          message('We\'ve sent an e-mail to you with instructions on how to reset your password');
        }, error);
    };

    function message(message) {
      $scope.message = message;
    }

    function error(error) {
      $scope.error = error;
    }
  });
