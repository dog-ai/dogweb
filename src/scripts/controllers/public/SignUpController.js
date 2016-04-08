/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

'use strict';

angular.module('dogweb')

  .controller('SignUpController', function ($scope, auth, Auth, emailAddress, User, $q, Ref, $timeout, lodash, $state, $stateParams) {
    $scope.$stateParams = $stateParams;

    $scope.user = {
      email_address: emailAddress
    };

    $scope.register = function (user) {
      if ($scope.form.$invalid) {
        return;
      }

      _createUser(user)
        .then(function () {
          var stateName = $stateParams.to || 'private.content.dashboard';

          $state.go(stateName, $stateParams);
        })
        .catch(function (error) {

          $scope.error = error;
        });
    };

    function _createUser(user) {
      return Auth.$createUser({email: user.email_address, password: user.password})
        .then(function () {

          // authenticate so we have permission to write to Firebase
          return Auth.$authWithPassword({email: user.email_address, password: user.password}, {rememberMe: true});
        })
        .then(function (auth) {
          var _user = new User(auth.uid);
          lodash.extend(_user, user);
          delete _user.password;

          var now = moment();
          _user.created_date = now.format();
          _user.is_enabled = true;

          return _user.$save();
        });
    }

  });
