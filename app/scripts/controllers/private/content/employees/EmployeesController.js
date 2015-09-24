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
  .controller('EmployeesController', function ($scope, company, employees, Ref, $firebaseObject, lodash, $modal) {

    $scope.employees = [];

    employees.$watch(function (event) {
      switch (event.event) {
        case 'child_added':
          _retrieveEmployee(event.key).then(function (employee) {
            $scope.employees.push(employee);
          });
          break;
        case 'child_removed':
          lodash.remove($scope.employees, function (employee) {
            return event.key == employee.$id;
          });
          break;
        default:
      }
    });

    angular.forEach(employees, function (employee) {
      _retrieveEmployee(employee.$id).then(function (employee) {
        $scope.employees.push(employee);
      });
    });

    $scope.openAddNewEmployeeModal = function () {
      $modal.open({
        animation: true,
        templateUrl: 'views/private/content/employees/modal/add-employee.html',
        controller: 'AddEmployeeModalController',
        size: null,
        resolve: {
          company: company
        }
      });
    };

    $scope.openEditEmployeeModal = function (employee) {
      $scope.employee = employee;
      $modal.open({
        animation: true,
        templateUrl: 'views/private/content/employees/modal/edit-employee.html',
        controller: 'EditEmployeeModalController',
        size: null,
        resolve: {
          employee: employee,
          employeeDevices: ['Ref', '$firebaseArray', function (Ref, $firebaseArray) {
            return $firebaseArray(Ref.child('employees/' + employee.$id + '/devices')).$loaded();
          }],
          companyDevices: ['Ref', '$firebaseArray', function (Ref, $firebaseArray) {
            return $firebaseArray(Ref.child('companies/' + company.$id + '/devices')).$loaded();
          }]
        }
      });
    };

    $scope.openRemoveEmployeeModal = function (employee) {
      $modal.open({
        animation: true,
        templateUrl: 'views/private/content/employees/modal/remove-employee.html',
        controller: 'RemoveEmployeeModalController',
        size: 'sm',
        resolve: {
          company: company,
          employees: function () {
            return employees;
          },
          employee: employee
        }
      });
    };

    function _retrieveEmployee(employeeId) {
      return $firebaseObject(Ref.child('employees/' + employeeId)).$loaded().then(function (employee) {
        return employee;
      });
    }

  })

  .controller('AddEmployeeModalController', function ($scope, company, $q, Ref, $firebaseObject, $timeout, $modalInstance) {

    $scope.addNewEmployee = function (employee) {
      var now = new moment();

      employee.created_date = now.format();
      employee.updated_date = now.format();
      employee.company_id = company.$id;

      _createEmployee(employee).then(function (employeeId) {
        _addEmployeeToCompany(employeeId, company.$id).then(function () {
          $modalInstance.close();
        });
      });
    };

    $scope.cancel = function () {
      $modalInstance.dismiss();
    };

    function _createEmployee(employee) {
      var employeesRef = Ref.child('employees'), def = $q.defer();
      var employeeRef = employeesRef.push(employee, function (error) {
        $timeout(function () {
          if (error) {
            def.reject(error);
          } else {
            def.resolve(employeeRef.key());
          }
        });
      });
      return def.promise;
    }

    function _addEmployeeToCompany(employeeId, companyId) {
      var companyEmployeeRef = Ref.child('companies/' + companyId + '/employees/' + employeeId), def = $q.defer();
      companyEmployeeRef.set(true, function (error) {
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

  .controller('EditEmployeeModalController', function ($scope, employee, employeeDevices, companyDevices, $q, Ref, $firebaseObject, $timeout, $modalInstance, lodash) {
    $scope.employee = employee;
    $scope.employeeDevices = [];
    $scope.companyDevices = [];

    employeeDevices.$watch(function (event) {
      switch (event.event) {
        case 'child_added':
          _retrieveDevice(event.key).then(function (device) {
            $scope.employeeDevices.push(device);
          });
          break;
        case 'child_removed':
          lodash.remove($scope.employeeDevices, function (device) {
            return event.key == device.$id;
          });
          break;
        default:
      }
    });

    companyDevices.$watch(function (event) {
      switch (event.event) {
        case 'child_added':
          _retrieveDevice(event.key).then(function (device) {
            $scope.companyDevices.push(device);
          });
          break;
        case 'child_removed':
          lodash.remove($scope.companyDevices, function (device) {
            return event.key == device.$id;
          });
          break;
        default:
      }
    });

    angular.forEach(employeeDevices, function (device) {
      _retrieveDevice(device.$id).then(function (device) {
        $scope.employeeDevices.push(device);
      });
    });

    angular.forEach(companyDevices, function (device) {
      _retrieveDevice(device.$id).then(function (device) {
        $scope.companyDevices.push(device);
      });
    });

    $scope.saveChanges = function (employee) {
      if ($scope.form.$invalid) {
        return;
      }

      if ($scope.form.$pristine) {
        $modalInstance.close();
      }

      var now = moment();

      employee.updated_date = now.format();

      employee.$save().then(function () {
        if ($scope.form.employeeDevices.$dirty) {

          $modalInstance.close();
        }
      });
    };

    $scope.cancel = function () {
      $modalInstance.dismiss();
    };

    function _retrieveDevice(deviceId) {
      return $firebaseObject(Ref.child('devices/' + deviceId)).$loaded().then(function (device) {
        return device;
      });
    }

    /*
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
     $modalInstance.dismiss();
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
     */
  })

  .controller('RemoveEmployeeModalController', function ($scope, company, employees, employee, $modalInstance, lodash) {

    $scope.employee = employee;

    $scope.removeEmployee = function (employee) {
      _removeEmployeeFromCompany(employee.$id, company.$id).then(function () {
        _deleteEmployee(employee).then(function () {
        });
        $modalInstance.close();
      });
    };

    $scope.cancel = function () {
      $modalInstance.dismiss();
    };

    function _deleteEmployee(employee) {
      return employee.$remove();
    }

    function _removeEmployeeFromCompany(employeeId) {
      return employees.$remove(lodash.find(employees, {$id: employeeId}));
    }
  })

;
