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
  .controller('SignUpController', function ($scope, Auth, $location, $q, Ref, $timeout, lodash) {

    $scope.user = {};
    $scope.company = {};

    $scope.register = function (user, company) {
      if ($scope.form.$invalid) {
        return;
      }

      _createUser(user)
        .then(function (userRef) {
          return _createOrRetrieveCompany(company)
            .then(function (companyRef) {
              return _addUserToCompany(userRef, companyRef);
            });
        })
        .then(_redirect, _showError);
    };

    function _createUser(user) {
      return Auth.$createUser({email: user.email_address, password: user.password})
        .then(function () {
          // authenticate so we have permission to write to Firebase
          return Auth.$authWithPassword({email: user.email_address, password: user.password}, {rememberMe: true});
        })
        .then(function (authData) {
          delete user.password;

          var now = moment();
          lodash.extend(user, {
            created_date: now.format(),
            updated_date: now.format()
          });

          var userRef = Ref.child('users/' + authData.uid), def = $q.defer();
          userRef.set(user, function (error) {
            $timeout(function () {
              if (error) {
                def.reject(error);
              }
              else {
                def.resolve(userRef);
              }
            });
          });
          return def.promise;
        });
    }

    function _createOrRetrieveCompany(company) {
      var def = $q.defer();
      if (company.id !== undefined) {
        return def.resolve(Ref.child('companies/' + company.id));
      } else {
        var companiesRef = Ref.child('companies');
        var companyRef = companiesRef.push(company, function (error) {
          $timeout(function () {
            if (error) {
              def.reject(error);
            }
            else {
              def.resolve(companyRef);
            }
          });
        });
      }
      return def.promise;
    }

    function _addUserToCompany(userRef, companyRef) {
      return _updateUser().then(function () {
        var companyUserRef = companyRef.child('users' + '/' + userRef.key()), def = $q.defer();
        companyUserRef.set(true, function (error) {
          $timeout(function () {
            if (error) {
              def.reject(error);
            }
            else {
              def.resolve();
            }
          });
        });
        return def.promise
      }).then(_updateCompany);

      function _updateUser() {
        var def = $q.defer();
        userRef.update({updated_date: moment().format(), company_id: companyRef.key()}, function (error) {
          $timeout(function () {
            if (error) {
              def.reject(error);
            }
            else {
              def.resolve();
            }
          });
        });
        return def.promise;
      }

      function _updateCompany() {
        var def = $q.defer();
        userRef.update({updated_date: moment().format()}, function (error) {
          $timeout(function () {
            if (error) {
              def.reject(error);
            }
            else {
              def.resolve(companyRef);
            }
          });
        });
        return def.promise;
      }
    }

    function _redirect() {
      $location.path('/dashboard');
    }

    function _showError(error) {
      $scope.error = error;
    }
  });
