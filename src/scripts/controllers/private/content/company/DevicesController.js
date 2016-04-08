/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

'use strict';

angular.module('dogweb')

  .controller('DevicesController', function ($scope, user, company, devices, CompanyEmployee, $uibModal) {
    $scope.devices = devices;

    /*$scope.devicesAdapter = {};
    devices.setAdapter($scope.devicesAdapter);*/

    $scope.openAddDeviceModal = function () {

      $uibModal.open({
        animation: true,
        templateUrl: '/views/private/content/company/modal/add-device.html',
        controller: 'AddDeviceModalController',
        size: null,
        resolve: {
          company: company,
          companyDevices: function () {
            return devices;
          },
          companyMacAddresses: ['CompanyMacAddressList', function (CompanyMacAddressList) {
            return new CompanyMacAddressList(company.$id).findAllByDeviceId(null);
          }]
        }
      }).result.finally(function () {

      });
    };

    $scope.openEditDeviceModal = function (device) {
      $uibModal.open({
        animation: true,
        templateUrl: '/views/private/content/company/modal/edit-device.html',
        controller: 'EditDeviceModalController',
        size: null,
        resolve: {
          company: company,
          device: device,
          companyMacAddresses: ['CompanyMacAddressList', function (CompanyMacAddressList) {
            return new CompanyMacAddressList(company.$id).findAllByDeviceId(null);
          }],
          deviceMacAddresses: ['CompanyMacAddressList', function (CompanyMacAddressList) {
            return new CompanyMacAddressList(company.$id).findAllByDeviceId(device.$id);
          }]
        }
      }).result.finally(function () {

      });
    };

    $scope.openRemoveDeviceModal = function (device) {
      $uibModal.open({
        animation: true,
        templateUrl: '/views/private/content/company/modal/remove-device.html',
        controller: 'RemoveDeviceModalController',
        size: 'sm',
        resolve: {
          company: company,
          companyEmployee: function () {
            if (device.employee_id) {
              return new CompanyEmployee(company.$id, device.employee_id).$loaded();
            }
          },
          companyDevices: function () {
            return devices;
          },
          device: device,
          deviceMacAddresses: ['CompanyMacAddressList', function (CompanyMacAddressList) {
            return new CompanyMacAddressList(company.$id).findAllByDeviceId(device.$id);
          }]
        }
      }).result.finally(function () {

      });
    };
  })

  .controller('AddDeviceModalController', function ($scope, company, companyDevices, companyMacAddresses, CompanyDevice, $uibModalInstance) {
    $scope.companyMacAddresses = companyMacAddresses;

    $scope.addDevice = function (device, deviceMacAddresses) {
      var now = new moment();

      device.created_date = now.format();
      device.updated_date = now.format();
      device.company_id = company.$id;
      device.is_manual = true;

      return companyDevices.addDevice(device)
        .then(function (device) {
          if (deviceMacAddresses) {
            return device.addMacAddresses(deviceMacAddresses);
          }
        })
        .then($uibModalInstance.close);
    };
  })

  .controller('EditDeviceModalController', function ($scope, company, companyMacAddresses, device, deviceMacAddresses, $uibModalInstance, lodash) {
    $scope.device = device;
    $scope.companyMacAddresses = companyMacAddresses;

    // angular.copy does not work
    $scope.deviceMacAddresses = lodash.map(deviceMacAddresses, function (macAddress) {
      return macAddress;
    });

    $scope.editDevice = function (device) {
      if ($scope.form.$invalid) {
        return;
      }

      if ($scope.form.$pristine) {
        return $uibModalInstance.close();
      }

      return device.$save()
        .then(function () {
          if ($scope.form.deviceMacAddresses.$dirty) {

            var macAddressesToRemove = lodash.filter(deviceMacAddresses, function (macAddress) {
              return !lodash.find($scope.deviceMacAddresses, {$id: macAddress.$id});
            });

            var macAddressesToAdd = lodash.filter($scope.deviceMacAddresses, function (macAddress) {
              return !lodash.find(deviceMacAddresses, {$id: macAddress.$id});
            });

            return device.removeMacAddresses(macAddressesToRemove)
              .then(function () {
                return device.addMacAddresses(macAddressesToAdd);
              });
          }
        })
        .then($uibModalInstance.close);
    };
  })

  .controller('RemoveDeviceModalController', function ($scope, company, companyEmployee, device, deviceMacAddresses, companyDevices, $uibModalInstance) {
    $scope.device = device;

    $scope.removeDevice = function () {

      if (companyEmployee) {
        companyEmployee.removeDevice(device.$id);
      }

      return companyDevices.removeDevice(device.$id)
        .then(function () {
          return device.removeMacAddresses(deviceMacAddresses);
        })
        .then(function () {
          return device.$remove();
        })
        .then($uibModalInstance.close);
    }

  })

;
