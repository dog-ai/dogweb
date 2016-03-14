/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

'use strict';

angular.module('dogweb')
  .controller('NavigationController', function ($scope, user, company, Auth, $modal, lodash) {
    $scope.user = user;
    $scope.company = company;

    $scope.logout = function () {
      Auth.$unauth();
    };

    $scope.openSwitchCompanyModal = function () {
      if (lodash.keys(user.companies).length <= 1) {
        return;
      }

      $modal.open({
        animation: true,
        templateUrl: '/views/private/modal/switch-company.html',
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


  })

  .controller('SwitchCompanyModalController', function ($scope, user, company, userCompanies, $q, Ref, $firebaseObject, $state, $stateParams, $timeout, $modalInstance, lodash) {
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
              $modalInstance.close();
            });
          });
      } else {
        $modalInstance.close();
      }
    };

    $scope.cancel = function () {
      $modalInstance.dismiss();
    };
  })

;
