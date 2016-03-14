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
  .controller('SignUpController', function ($scope, invite, Auth, $location, $q, Ref, $timeout, lodash) {

    $scope.invite = invite;
    $scope.user = {
      email_address: invite && invite.email_address || undefined
    };
    $scope.company = {
      id: invite && invite.$ref().parent().key() || undefined
    };

    $scope.register = function (user, company) {
      if ($scope.form.$invalid) {
        return;
      }

      _createUser(user)
        .then(function (userRef) {
          return _createOrRetrieveCompany(company)
            .then(function (companyRef) {
              return _addUserToCompany(userRef, companyRef)
                .then(function () {
                  if (invite) {
                    return _deleteCompanyInvite(companyRef, invite);
                  }
                });
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
        $timeout(function () {
          def.resolve(Ref.child('companies/' + company.id));
        });
      } else {
        delete company.id;

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
        return def.promise;
      }).then(_updateCompany);

      function _updateUser() {
        var def = $q.defer();

        var data = {updated_date: moment().format(), companies: {}};
        data.companies[companyRef.key()] = true;

        userRef.update(data, function (error) {
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
        companyRef.update({updated_date: moment().format()}, function (error) {
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

    function _deleteCompanyInvite(companyRef, invite) {
      return Ref.child('company_invites/' + companyRef.key() + '/' + invite.$id).remove();
    }

    function _redirect() {
      $location.path('/dashboard');
    }

    function _showError(error) {
      $scope.error = error;
    }
  });
