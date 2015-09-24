/*
 * Copyright (C) 2015 dog.ai, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

'use strict';

angular.module('dogwebApp')
  .controller('NavigationController', function ($scope, user, company, userCompaniesRef, Auth, $modal) {
    $scope.user = user;
    $scope.company = company;

    $scope.companies = userCompaniesRef;

    $scope.logout = function () {
      Auth.$unauth();
    };

    $scope.openSwitchCompanyModal = function () {
      if (userCompaniesRef.length <= 1) {
        return;
      }

      $modal.open({
        animation: true,
        templateUrl: 'views/private/modal/switch-company.html',
        controller: 'SwitchCompanyModalController',
        size: 'sm',
        resolve: {
          company: company,
          userCompaniesRef: function () {
            return userCompaniesRef;
          }
        }
      }).result.finally(function () {
        });
    };


  })

  .controller('SwitchCompanyModalController', function ($rootScope, $scope, company, userCompaniesRef, $q, Ref, $firebaseObject, $state, $stateParams, $timeout, $modalInstance, lodash) {
    $scope.companies = [];
    $scope.selectedCompany = {};

    userCompaniesRef.$watch(function (event) {
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

    angular.forEach(userCompaniesRef, function (userCompanyRef) {
      _retrieveCompany(userCompanyRef.$id).then(function (companyRef) {
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
        $rootScope.company_id = selectedCompany.$id;
        $state.go($state.current, $stateParams, {reload: true}).then(function () {
          $modalInstance.close();
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
