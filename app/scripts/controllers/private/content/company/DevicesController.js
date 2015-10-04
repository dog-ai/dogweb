/*
 * Copyright (C) 2015 dog.ai, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

'use strict';

/**
 * @ngdoc function
 * @name dogwebApp.controller:DevicesCtrl
 * @description
 * # DevicesCtrl
 * Controller of the dogwebApp
 */
angular.module('dogwebApp')

  .controller('DevicesController', function ($scope, user, company, companyDevices, companyMacAddresses, Ref, $firebaseObject, $modal, lodash) {

    $scope.devices = [];
    $scope.companyMacAddresses = [];

    companyDevices.$watch(function (event) {
      switch (event.event) {
        case 'child_added':
          _retrieveDevice(event.key).then(function (device) {
            $scope.devices.push(device);
          });
          break;
        case 'child_removed':
          lodash.remove($scope.devices, function (device) {
            return event.key == device.$id;
          });
          break;
        default:
      }
    });

    companyMacAddresses.$watch(function (event) {
      switch (event.event) {
        case 'child_added':
          _retrieveMacAddress(event.key).then(function (macAddress) {
            $scope.companyMacAddresses.push(macAddress);
          });
          break;
        case 'child_removed':
          lodash.remove($scope.companyMacAddresses, function (macAddress) {
            return event.key == macAddress.$id;
          });
          break;
        default:
      }
    });

    angular.forEach(companyDevices, function (device) {
      _retrieveDevice(device.$id).then(function (device) {
        $scope.devices.push(device);
      });
    });

    angular.forEach(companyMacAddresses, function (mac_address) {
      _retrieveMacAddress(mac_address.$id).then(function (mac_address) {
        if (mac_address.device_id === undefined) {
          $scope.companyMacAddresses.push(mac_address);
        }
      });
    });

    $scope.openAddDeviceModal = function () {

      $modal.open({
        animation: true,
        templateUrl: '/views/private/content/company/modal/add-device.html',
        controller: 'AddDeviceModalController',
        size: null,
        resolve: {
          company: company,
          companyDevices: function () {
            return companyDevices;
          },
          companyMacAddresses: function () {
            return $scope.companyMacAddresses;
          }
        }
      });
    };

    $scope.openEditDeviceModal = function (device) {

      $modal.open({
        animation: true,
        templateUrl: '/views/private/content/company/modal/edit-device.html',
        controller: 'EditDeviceModalController',
        size: null,
        resolve: {
          device: device,
          deviceMacAddresses: ['Ref', '$firebaseArray', function (Ref, $firebaseArray) {
            return $firebaseArray(Ref.child('devices/' + device.$id + '/mac_addresses')).$loaded();
          }],
          companyMacAddresses: function () {
            return $scope.companyMacAddresses;
          }
        }
      });
    };

    $scope.openRemoveDeviceModal = function (device) {
      $modal.open({
        animation: true,
        templateUrl: '/views/private/content/company/modal/remove-device.html',
        controller: 'RemoveDeviceModalController',
        size: 'sm',
        resolve: {
          device: device,
          companyDevices: function () {
            return companyDevices;
          },
          deviceMacAddresses: ['Ref', '$firebaseArray', function (Ref, $firebaseArray) {
            return $firebaseArray(Ref.child('devices/' + device.$id + '/mac_addresses')).$loaded();
          }],
        }
      });
    };

    function _retrieveDevice(deviceId) {
      return $firebaseObject(Ref.child('devices/' + deviceId)).$loaded().then(function (device) {
        return device;
      });
    }

    function _retrieveMacAddress(macAddressId) {
      return $firebaseObject(Ref.child('mac_addresses/' + macAddressId)).$loaded().then(function (mac_address) {
        return mac_address;
      });
    }

  })

  .controller('AddDeviceModalController', function ($scope, company, companyMacAddresses, $q, Ref, $firebaseObject, $timeout, $modalInstance, lodash) {

    $scope.companyMacAddresses = companyMacAddresses;

    $scope.addDevice = function (device, deviceMacAddresses) {
      var now = new moment();

      device.created_date = now.format();
      device.updated_date = now.format();
      device.company_id = company.$id;

      _createDevice(device).then(function (deviceId) {
        angular.forEach(deviceMacAddresses, function (macAddress) {
          _addMacAddressToDevice(macAddress.$id, deviceId).then(function () {
            _updateMacAddress(macAddress.$id, {updated_date: now.format(), device_id: deviceId});
          });
        });

        _addDeviceToCompany(deviceId, company.$id).then(function () {
          $modalInstance.close();
        });

      });
    };

    $scope.cancel = function () {
      $modalInstance.dismiss();
    };

    function _createDevice(device) {
      var devicesRef = Ref.child('devices'), def = $q.defer();
      var deviceRef = devicesRef.push(device, function (error) {
        $timeout(function () {
          if (error) {
            def.reject(error);
          } else {
            def.resolve(deviceRef.key());
          }
        });
      });
      return def.promise;
    }

    function _addMacAddressToDevice(macAddressId, deviceId) {
      var deviceMacAddressRef = Ref.child('devices/' + deviceId + '/mac_addresses/' + macAddressId), def = $q.defer();
      deviceMacAddressRef.set(true, function (error) {
        $timeout(function () {
          if (error) {
            def.reject(error);
          } else {
            def.resolve();
          }
        });
      });
      return def.promise;
    }

    function _addDeviceToCompany(deviceId, companyId) {
      var companyDeviceRef = Ref.child('companies/' + companyId + '/devices/' + deviceId), def = $q.defer();
      companyDeviceRef.set(true, function (error) {
        $timeout(function () {
          if (error) {
            def.reject(error);
          } else {
            def.resolve();
          }
        });
      });
      return def.promise;
    }

    function _updateMacAddress(macAddressId, macAddress) {
      var deviceRef = Ref.child('mac_addresses/' + macAddressId), def = $q.defer();
      deviceRef.update(macAddress, function (error) {
        $timeout(function () {
          if (error) {
            def.reject(error);
          } else {
            def.resolve();
          }
        });
      });
      return def.promise;
    }
  })

  .controller('EditDeviceModalController', function ($scope, device, deviceMacAddresses, companyMacAddresses, $q, Ref, $firebaseObject, $timeout, $modalInstance, lodash) {

    $scope.device = device;
    $scope.deviceMacAddresses = [];
    $scope.companyMacAddresses = companyMacAddresses;

    deviceMacAddresses.$watch(function (event) {
      switch (event.event) {
        case 'child_added':
          _retrieveMacAddress(event.key).then(function (macAddress) {
            $scope.deviceMacAddresses.push(macAddress);
          });
          break;
        case 'child_removed':
          lodash.remove($scope.deviceMacAddresses, function (macAddress) {
            return event.key == macAddress.$id;
          });
          break;
        default:
      }
    });

    angular.forEach(deviceMacAddresses, function (macAddress) {
      _retrieveMacAddress(macAddress.$id).then(function (macAddress) {
        $scope.deviceMacAddresses.push(macAddress);
      });
    });

    $scope.saveChanges = function (device) {
      if ($scope.form.$invalid) {
        return;
      }

      if ($scope.form.$pristine) {
        $modalInstance.close();
      }

      var now = moment();

      device.updated_date = now.format();

      device.$save().then(function () {
        if ($scope.form.deviceMacAddresses.$dirty) {

          var macAddressesToRemove = lodash.filter(deviceMacAddresses, function (macAddress) {
            return !lodash.findWhere($scope.deviceMacAddresses, {$id: macAddress.$id});
          });

          angular.forEach(macAddressesToRemove, function (macAddress) {
            _removeMacAddressFromDevice(macAddress.$id).then(function () {
              _updateMacAddress(macAddress.$id, {updated_date: now.format(), device_id: null});
            });
          });

          var macAddressesToAdd = lodash.filter($scope.deviceMacAddresses, function (macAddress) {
            return !lodash.findWhere(deviceMacAddresses, {$id: macAddress.$id});
          });

          angular.forEach(macAddressesToAdd, function (macAddress) {
            _addMacAddressToDevice(macAddress.$id, device.$id).then(function () {
              _updateMacAddress(macAddress.$id, {updated_date: now.format(), device_id: device.$id});
            });
          });

          $modalInstance.close();
        }
      });
    };

    $scope.cancel = function () {
      $modalInstance.dismiss();
    };

    function _addMacAddressToDevice(macAddressId, deviceId) {
      var deviceMacAddressRef = Ref.child('devices/' + deviceId + '/mac_addresses/' + macAddressId), def = $q.defer();
      deviceMacAddressRef.set(true, function (error) {
        $timeout(function () {
          if (error) {
            def.reject(error);
          } else {
            def.resolve();
          }
        });
      });
      return def.promise;
    }

    function _removeMacAddressFromDevice(macAddressId) {
      return deviceMacAddresses.$remove(lodash.find(deviceMacAddresses, {$id: macAddressId}));
    }

    function _updateMacAddress(macAddressId, macAddress) {
      var deviceRef = Ref.child('mac_addresses/' + macAddressId), def = $q.defer();
      deviceRef.update(macAddress, function (error) {
        $timeout(function () {
          if (error) {
            def.reject(error);
          } else {
            def.resolve();
          }
        });
      });
      return def.promise;
    }

    function _retrieveMacAddress(macAddressId) {
      return $firebaseObject(Ref.child('mac_addresses/' + macAddressId)).$loaded().then(function (mac_address) {
        return mac_address;
      });
    }

  })

  .controller('RemoveDeviceModalController', function ($scope, device, companyDevices, deviceMacAddresses, $q, Ref, $firebaseObject, $state, $timeout, $modalInstance, lodash) {

    $scope.device = device;

    $scope.removeDevice = function () {

      if (device.employee_id !== undefined) {

        angular.forEach(deviceMacAddresses, function (macAddress) {
          _removeMacAddressFromDevice(macAddress.$id).then(function () {
            var now = moment();
            _updateMacAddress(macAddress.$id, {updated_date: now.format(), device_id: null});
          });
        });

        _removeDeviceFromEmployee(device.$id, device.employee_id).then(function () {
          _removeDeviceFromCompany(device.$id).then(function () {
            device.$remove().then(function () {
              $modalInstance.close();
            });
          });
        });
      } else {
        _removeDeviceFromCompany(device.$id, device.company_id).then(function () {
          device.$remove().then(function () {
            $modalInstance.close();
          });
        });
      }
    };

    $scope.cancel = function () {
      $modalInstance.dismiss();
    };

    function _removeDeviceFromCompany(deviceId) {
      return companyDevices.$remove(lodash.find(companyDevices, {$id: deviceId}));
    }

    function _removeDeviceFromEmployee(deviceId, employeeId) {
      var deviceRef = Ref.child('employees/' + employeeId + '/devices/' + deviceId), def = $q.defer();
      deviceRef.remove(function (error) {
        $timeout(function () {
          if (error) {
            def.reject(error);
          } else {
            def.resolve();
          }
        });
      });
      return def.promise;
    }

    function _removeMacAddressFromDevice(macAddressId) {
      return deviceMacAddresses.$remove(lodash.find(deviceMacAddresses, {$id: macAddressId}));
    }

    function _updateMacAddress(macAddressId, macAddress) {
      var deviceRef = Ref.child('mac_addresses/' + macAddressId), def = $q.defer();
      deviceRef.update(macAddress, function (error) {
        $timeout(function () {
          if (error) {
            def.reject(error);
          } else {
            def.resolve();
          }
        });
      });
      return def.promise;
    }

  })

;
