/*
 * Copyright (C) 2015 dog.ai, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

'use strict';

/**
 * @ngdoc function
 * @name dogwebApp.controller:EmployeesCtrl
 * @description
 * # EmployeesCtrl
 * Controller of the dogwebApp
 */
angular.module('dogwebApp')
  .controller('EmployeeController', function ($scope, user, company, employee, devices, Ref, $firebaseObject, $firebaseArray, lodash, $modal) {

    $scope.employee = employee;
    $scope.devices = [];
    //employee.$bindTo($scope, 'employee');

    devices.$watch(function (event) {
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

    angular.forEach(devices, function (device) {
      _retrieveDevice(device.$id).then(function (device) {
        $scope.devices.push(device);
      });
    });

    function _retrieveDevice(deviceId) {
      return $firebaseObject(Ref.child('devices/' + deviceId)).$loaded().then(function (device) {
        return device;
      });
    }

    $scope.openRemoveDeviceFromEmployeeModal = function (device, employee) {
      var modalInstance = $modal.open({
        animation: true,
        templateUrl: 'views/private/content/employees/modal/remove_device_from_employee.html',
        controller: 'RemoveDeviceFromEmployeeModalController',
        size: null,
        resolve: {
          device: device,
          devices: function () {
            return devices;
          },
          employee: employee
        }
      });

      modalInstance.result.then(function () {
      }, function () {
      });
    };

    $scope.openAddDeviceToEmployeeModal = function () {
      var modalInstance = $modal.open({
        animation: true,
        templateUrl: 'views/private/content/employees/modal/add_device_to_employee.html',
        controller: 'AddDeviceToEmployeeModalController',
        size: null,
        resolve: {
          employee: employee,
          company: company,
          availableDevices: ['Ref', '$firebaseArray', function (Ref, $firebaseArray) {
            return $firebaseArray(Ref.child('companies/' + company.$id + '/devices')).$loaded().then(function (devices) {
              return devices;
            });
          }],
          availableMacAddresses: ['Ref', '$firebaseArray', function (Ref, $firebaseArray) {
            return $firebaseArray(Ref.child('companies/' + company.$id + '/mac_addresses')).$loaded().then(function (mac_addresses) {
              return mac_addresses;
            });
          }]
        }
      });

      modalInstance.result.then(function () {
      }, function () {
      });
    };

    $scope.datapoints = [];
    $scope.datacolumns = [{"id": "top-1", "type": "area-step", "name": "Today"}];
    $scope.datax = {"id": "x"};
    $scope.ticks = [moment(), moment().add(1, 'hour')];


    $scope.format = function (tick) {
      return moment(tick).format('HH:mm');
    };

    var date = moment().subtract(2, 'day');

    $firebaseArray(Ref.child('employee_performances/' + employee.$id + '/presence/' + date.format('YYYY/MM/DD'))).$loaded().then(function (presences) {
      $scope.presences = presences;

      var startOfDay = moment(date).startOf('day');
      $scope.startOfDay = startOfDay.toDate();
      var endOfDay = moment(date).endOf('day');
      $scope.endOfDay = endOfDay.toDate();
      var hour = startOfDay;
      while (hour <= endOfDay) {
        $scope.ticks.push(hour);
        hour = hour.clone().add(1, 'h');
      }
      $scope.ticks.push(hour.subtract(1, 's'));

      angular.forEach(presences, function (presence) {
        $scope.datapoints.push({"x": moment(presence.created_date), "top-1": presence.is_present ? 1 : 0});
      });


    });

  })

  .controller('AddDeviceToEmployeeModalController', function ($scope, employee, company, availableDevices, availableMacAddresses, $q, Ref, $firebaseObject, $state, $timeout, $modalInstance, lodash) {
    $scope.employee = employee;
    $scope.devices = [];
    $scope.device = {};
    $scope.mac_addresses = [];

    angular.forEach(availableDevices, function (device) {
      _retrieveDevice(device.$id).then(function (device) {
        if (device.employee_id === undefined) {
          $scope.devices.push(device);
        }
      });
    });

    angular.forEach(availableMacAddresses, function (mac_address) {
      _retrieveMacAddress(mac_address.$id).then(function (mac_address) {
        if (mac_address.device_id === undefined) {
          $scope.mac_addresses.push(mac_address);
        }
      });
    });

    $scope.validateNewDevice = function (device) {
      return $scope.newDeviceForm.$valid;
    };


    $scope.addNewDeviceToEmployee = function (device, employee) {
      var now = new moment();

      device.created_date = now.format();
      device.updated_date = now.format();
      device.company_id = company.$id;
      device.employee_id = employee.$id;

      var macAddressIds = device.mac_addresses;
      delete device['mac_addresses'];

      _createDevice(device).then(function (deviceId) {
        _addDeviceToEmployee(deviceId, employee.$id).then(function () {
          employee.updated_date = now.format();
        });

        _addDeviceToCompany(deviceId, device.company_id).then(function () {
          //company.updated_date = now.format();
          $modalInstance.close();
        });

        angular.forEach(macAddressIds, function (macAddressId) {
          _addMacAddressToDevice(macAddressId, deviceId).then(function () {
            _updateDevice(deviceId, {updated_date: now.format()});
          });
          _updateMacAddress(macAddressId, {updated_date: now.format(), device_id: deviceId});
        });
      });
    };

    $scope.validateDevice = function (device) {
      return !$scope.deviceForm.$pristine && $scope.deviceForm.$valid;
    };

    $scope.addDeviceToEmployee = function (device, employee) {
      var now = moment();

      _addDeviceToEmployee(device.$id, employee.$id).then(function () {
        employee.updated_date = now.format();
        _updateDevice(device.$id, {updated_date: now.format(), employee_id: employee.$id});
        $modalInstance.close();
      });
    };

    $scope.cancel = function () {
      $modalInstance.close();
    };

    function _retrieveDevice(deviceId) {
      return $firebaseObject(Ref.child('devices/' + deviceId)).$loaded().then(function (device) {
        return device;
      });
    }

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

    function _addDeviceToEmployee(deviceId, employeeId) {
      var companyDeviceRef = Ref.child('employees/' + employeeId + '/devices/' + deviceId), def = $q.defer();
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

    function _updateDevice(deviceId, device) {
      var deviceRef = Ref.child('devices/' + deviceId), def = $q.defer();
      deviceRef.update(device, function (error) {
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

    function _updateMacAddress(macAddressId, macAdress) {
      var macAddressRef = Ref.child('mac_addresses/' + macAddressId), def = $q.defer();
      macAddressRef.update(macAdress, function (error) {
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

  .controller('RemoveDeviceFromEmployeeModalController', function ($scope, device, devices, employee, $q, Ref, $firebaseObject, $state, $timeout, $modalInstance, lodash) {

    $scope.device = device;
    $scope.employee = employee;

    $scope.removeDeviceFromEmployee = function (device) {
      _removeDeviceFromEmployee(device.$id, employee.$id).then(function () {
        var now = new moment();
        _updateDevice(device.$id, {updated_date: now.format(), employee_id: null});

        $modalInstance.close();
      });
    };

    $scope.cancel = function () {
      $modalInstance.dismiss();
    };

    function _removeDeviceFromEmployee(deviceId) {
      return devices.$remove(lodash.find(devices, {$id: deviceId}));
    }

    function _updateDevice(deviceId, device) {
      var deviceRef = Ref.child('devices/' + deviceId), def = $q.defer();
      deviceRef.update(device, function (error) {
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
