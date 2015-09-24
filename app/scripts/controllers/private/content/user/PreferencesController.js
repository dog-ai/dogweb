/*
 * Copyright (C) 2015 dog.ai, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

'use strict';

angular.module('dogwebApp')
  .controller('UserPreferencesController', function ($scope, auth, user, Auth, Ref, $firebaseObject, $timeout) {

    $scope.auth = auth;

    //var user = $firebaseObject(Ref.child('users/'+auth.uid));
    user.$bindTo($scope, 'user');

    $scope.changePassword = function (oldPass, newPass, confirm) {
      $scope.err = null;
      if (!oldPass || !newPass) {
        error('Please enter all fields');
      }
      else if (newPass !== confirm) {
        error('Passwords do not match');
      }
      else {
        Auth.$changePassword({email: profile.email, oldPassword: oldPass, newPassword: newPass})
          .then(function () {
            success('Password changed');
          }, error);
      }
    };

    $scope.changeEmail = function (pass, newEmail) {
      $scope.err = null;
      Auth.$changeEmail({password: pass, newEmail: newEmail, oldEmail: profile.email})
        .then(function () {
          profile.email = newEmail;
          profile.$save();
          success('Email changed');
        })
        .catch(error);
    };

    function error(err) {
    }

    function success(msg) {
    }

  });
