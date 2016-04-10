/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

'use strict';

angular.module('dogweb')
  .filter('size', function (lodash) {
    return function (el) {
      return lodash.size(el);
    };
  })

  .controller('NavigationController', function ($scope, user, company, apps, Ref, $firebaseObject, Auth, $uibModal, lodash, $state) {
    $scope.user = user;
    $scope.company = company;

    $scope.logout = function () {
      $state.go('public.login', {logout: true});
    };

    $scope.openSwitchCompanyModal = function () {
      if (lodash.keys(user.companies).length <= 1) {
        return;
      }

      $uibModal.open({
        animation: true,
        templateUrl: '/views/private/header/modal/switch-company.html',
        controller: 'SwitchCompanyModalController',
        size: 'sm',
        resolve: {
          user: user,
          company: company,
          userCompanies: ['Ref', '$firebaseArray', function (Ref, $firebaseArray) {
            return $firebaseArray(Ref.child('users/' + user.$id + '/companies')).$loaded().then(function (userCompanies) {
              return userCompanies;
            });
          }]
        }
      }).result.finally(function () {

      });
    };

    $scope.openChangePasswordModal = function () {
      return $uibModal.open({
        animation: true,
        templateUrl: '/views/private/header/modal/change-password.html',
        controller: 'ChangePasswordModalController',
        size: 'sm',
        resolve: {
          user: user
        }
      }).result.finally(function () {

      });
    };

    $scope.openChangeEmailAddressModal = function () {
      return $uibModal.open({
        animation: true,
        templateUrl: '/views/private/header/modal/change-email-address.html',
        controller: 'ChangeEmailAddressModalController',
        size: 'sm',
        resolve: {
          user: user
        }
      }).result.finally(function () {

      });
    };

  })

  .controller('SwitchCompanyModalController', function ($scope, user, company, userCompanies, Ref, $firebaseObject, $state, $stateParams, $timeout, $uibModalInstance, lodash) {
    $scope.companies = [];
    $scope.selectedCompany = {};

    userCompanies.$watch(function (event) {
      switch (event.event) {
        case 'child_added':
          _retrieveCompany(event.key).then(function (company) {
            $scope.companies.push(company);
          });
          break;
        case 'child_removed':
          lodash.remove($scope.companies, function (company) {
            return event.key == company.$id;
          });
          break;
        default:
      }
    });

    angular.forEach(userCompanies, function (userCompany) {
      _retrieveCompany(userCompany.$id).then(function (companyRef) {
        $scope.companies.push(companyRef);
        if (companyRef.$id == company.$id) {
          $scope.selectedCompany = companyRef;
        }
      });
    });

    function _retrieveCompany(companyId) {
      return $firebaseObject(Ref.child('companies/' + companyId)).$loaded().then(function (company) {
        return company;
      });
    }

    $scope.switchCompany = function (selectedCompany) {
      if ($scope.form.$invalid) {
        return;
      }

      if (selectedCompany.$id != company.$id) {
        user.primary_company = selectedCompany.$id;
        user.updated_date = moment().format();

        user.$save()
          .then(function () {
            $state.go('private.content.dashboard', $stateParams, {reload: true}).then(function () {
              $uibModalInstance.close();
            });
          });
      } else {
        $uibModalInstance.close();
      }
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss();
    };
  })

  .controller('ChangePasswordModalController', function ($scope, user, Auth, $uibModalInstance) {

    $scope.save = function (oldPassword, newPassword) {
      return Auth.$changePassword({email: user.email, oldPassword: oldPassword, newPassword: newPassword})
        .then(function () {

          return user.$save();
        })
        .then($uibModalInstance.close)
    };
  })

  .controller('ChangeEmailAddressModalController', function ($scope, user, Auth) {
    
    $scope.save = function (password, emailAddress) {

      return Auth.$changeEmail({password: password, newEmail: emailAddress, oldEmail: user.email_address})
        .then(function () {
          user.email_address = emailAddress;
          
          return user.$save();
        })
        .then($uibModalInstance.close);
    };
  })

;
