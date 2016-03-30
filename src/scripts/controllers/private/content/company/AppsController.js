/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

'use strict';

angular.module('dogweb')

  .controller('AppsController', function ($scope, company, apps, companyApps, lodash, $uibModal) {
    $scope.apps = apps;
    $scope.companyApps = companyApps;

    $scope.adapter = {};
    companyApps.setAdapter($scope.adapter);

    $scope.openEditAppModal = function (companyApp) {
      return $uibModal.open({
        animation: true,
        templateUrl: '/views/private/content/company/apps/modal/edit-' + companyApp.$id + '.html',
        controller: 'EditModalController',
        size: 'md',
        resolve: {
          company: company,
          app: function () {
            return lodash.find(apps, {$id: companyApp.$id});
          },
          companyApp: companyApp
        }
      }).result.finally()
    };

    $scope.toggleApp = function (companyApp) {
      if (companyApp.updated_date) {
        return companyApp.$save();

      } else if (companyApp.is_enabled) {
        // prevent enabling an app before the first edit
        companyApp.is_enabled = false;

        return $scope.openEditAppModal(companyApp)
          .then(function () {
            companyApp.is_enabled = true;
            return companyApp.$save();
          })
      } else {
        // we are disabling a pre-enabled core app for the first time
        return companyApp.$save();
      }
    };

  })

  .controller('EditModalController', function ($scope, company, app, companyApp, $uibModalInstance) {
    $scope.app = app;
    $scope.companyApp = companyApp;

    $scope.save = function () {
      return companyApp.$save()
        .then(function () {
          if ($scope.form.companyPageUrl.$dirty) {
            var task = {
              event: 'social:linkedin:company:import',
              data: {app: {company_page_url: companyApp.company_page_url}}
            };
            return company.addTask(task);
          }
        })
        .then($uibModalInstance.close);
    };
  })
;
