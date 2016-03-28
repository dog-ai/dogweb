/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

'use strict';

angular.module('dogweb')
  .filter('secondsToDateTime', [function () {
    return function (seconds) {
      return moment().startOf('day').toDate().setSeconds(seconds);
    };
  }])

  .filter('performanceIndicatorValuePeriod', [function () {
    return function (_stats) {
      if (_stats !== undefined && _stats.period_start_date !== undefined && _stats.period_end_date !== undefined) {
        return moment(_stats.period_start_date).format('MMM DD, YYYY') + ' - ' + moment(_stats.period_end_date).format('MMM DD, YYYY');
      }
    };
  }])

  .controller('EmployeesController', function ($scope, company, employees, Ref, $firebaseObject, lodash, $uibModal, moment) {
    $scope.yesterday = moment().subtract(1, 'day').toDate();
    $scope.employees = [];
    $scope.employeePerformances = {};

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

          delete $scope.employeePerformances[event.key];
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
      $uibModal.open({
        animation: true,
        templateUrl: '/views/private/content/employees/modal/add-employee.html',
        controller: 'AddEmployeeModalController',
        size: 'sm',
        resolve: {
          company: company
        }
      }).result.finally(function () {

      });
    };

    $scope.openEditEmployeeModal = function (employee) {
      $uibModal.open({
        animation: true,
        templateUrl: '/views/private/content/employees/modal/edit-employee.html',
        controller: 'EditEmployeeModalController',
        size: 'md',
        resolve: {
          company: company,
          employee: employee,
          employeeDevices: ['Ref', '$firebaseArray', function (Ref, $firebaseArray) {
            return $firebaseArray(Ref.child('company_employees/' + company.$id + '/' + employee.$id + '/devices')).$loaded();
          }],
          companyDevices: ['Ref', '$firebaseArray', function (Ref, $firebaseArray) {
            return $firebaseArray(Ref.child('companies/' + company.$id + '/devices')).$loaded();
          }]
        }
      }).result.finally(function () {

      });
    };

    $scope.openRemoveEmployeeModal = function (employee) {
      $uibModal.open({
        animation: true,
        templateUrl: '/views/private/content/employees/modal/remove-employee.html',
        controller: 'RemoveEmployeeModalController',
        size: 'sm',
        resolve: {
          company: company,
          employees: function () {
            return employees;
          },
          employee: employee
        }
      }).result.finally(function () {

      });
    };

    function _retrieveEmployee(employeeId) {
      return $firebaseObject(Ref.child('company_employees/' + company.$id + '/' + employeeId)).$loaded().then(function (employee) {
        return $firebaseObject(Ref.child('company_employee_performances/' + company.$id + '/' + employeeId + '/presence/_stats')).$loaded().then(function (_stats) {
          if (_stats.$value !== null) {
            $scope.employeePerformances[employee.$id] = {
              performances_collapsed: true,
              performances: {
                presence: _stats
              }
            };
          }

          return employee;
        })
      });
    }

  })

  .controller('AddEmployeeModalController', function ($scope, company, $q, Ref, $firebaseObject, $timeout, $uibModalInstance) {

    $scope.apps = company.apps;

    $scope.addNewEmployee = function (employee) {
      var now = new moment();

      employee = employee || {};
      employee.created_date = now.format();
      employee.updated_date = now.format();
      employee.company_id = company.$id;

      _createEmployee(employee)
        .then(function (employeeId) {
          _addEmployeeToCompany(employeeId, company.$id)
            .then(function () {
              employee.id = employeeId;
              var task = {event: 'person:employee:profile:linkedin', data: {employee: {id: employeeId}}};
              return company.addTask(task);
            })
        })
        .then($uibModalInstance.close);
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss();
    };

    function _createEmployee(employee) {
      var employeesRef = Ref.child('company_employees/' + company.$id), def = $q.defer();
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

  .controller('EditEmployeeModalController', function ($scope, company, employee, employeeDevices, companyDevices, $q, Ref, $firebaseObject, $timeout, $uibModalInstance, lodash) {

    $scope.apps = company.apps;
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
        if (device.employee_id === undefined || device.employee_id == employee.$id) {
          $scope.companyDevices.push(device);
        }
      });
    });

    $scope.save = function () {
      if ($scope.form.$invalid) {
        return;
      }

      if ($scope.form.$pristine) {
        $uibModalInstance.close();
      }

      var now = moment();

      employee.updated_date = now.format();

      employee.$save()
        .then(function () {
          if ($scope.form.employeeDevices.$dirty) {

            var devicesToRemove = lodash.filter(employeeDevices, function (device) {
              return !lodash.find($scope.employeeDevices, {$id: device.$id});
            });

            angular.forEach(devicesToRemove, function (device) {
              _removeDeviceFromEmployee(device.$id).then(function () {
                _updateDevice(device.$id, {updated_date: now.format(), employee_id: null});
              });
            });

            var devicesToAdd = lodash.filter($scope.employeeDevices, function (device) {
              return !lodash.find(employeeDevices, {$id: device.$id});
            });

            angular.forEach(devicesToAdd, function (device) {
              if (device.$id === null) {
                return;
              }
              _addDeviceToEmployee(device.$id, employee.$id).then(function () {
                _updateDevice(device.$id, {updated_date: now.format(), employee_id: employee.$id});
              });
            });

            var devicesToCreate = lodash.filter($scope.employeeDevices, {$id: null});

            angular.forEach(devicesToCreate, function (device) {
              delete device.$id;

              device.created_date = now.format();
              device.updated_date = now.format();
              device.company_id = company.$id;
              device.employee_id = employee.$id;

              _createDevice(device).then(function (deviceId) {
                _addDeviceToCompany(deviceId, device.company_id);
                _addDeviceToEmployee(deviceId, employee.$id);
              });
            });
          }

        })
        .then(function () {
          if ($scope.form.linkedInProfileUrl.$dirty) {
            var task = {event: 'person:employee:profile:linkedin', data: {employee: {id: employee.$id}}};
            return company.addTask(task);
          }
        })
        .then($uibModalInstance.close);
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss();
    };

    function _createDevice(device) {
      var devicesRef = Ref.child('company_devices/' + company.$id), def = $q.defer();
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

    function _retrieveDevice(deviceId) {
      return $firebaseObject(Ref.child('company_devices/' + company.$id + '/' + deviceId)).$loaded().then(function (device) {
        return device;
      });
    }

    function _addDeviceToEmployee(deviceId, employeeId) {
      var employeeDeviceRef = Ref.child('company_employees/' + company.$id + '/' + employeeId + '/devices/' + deviceId), def = $q.defer();
      employeeDeviceRef.set(true, function (error) {
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

    function _removeDeviceFromEmployee(deviceId) {
      return employeeDevices.$remove(lodash.find(employeeDevices, {$id: deviceId}));
    }

    function _updateDevice(deviceId, device) {
      var deviceRef = Ref.child('company_devices/' + company.$id + '/' + deviceId), def = $q.defer();
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

    /*
     .controller('AddDeviceToEmployeeModalController', function ($scope, employee, company, availableDevices, availableMacAddresses, $q, Ref, $firebaseObject, $state, $timeout, $uibModalInstance, lodash) {
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
     $uibModalInstance.close();
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
     $uibModalInstance.close();
     });
     };

     $scope.cancel = function () {
     $uibModalInstance.dismiss();
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


     */
  })

  .controller('RemoveEmployeeModalController', function ($scope, company, employees, employee, $uibModalInstance, lodash) {

    $scope.employee = employee;

    $scope.removeEmployee = function (employee) {
      _removeEmployeeFromCompany(employee.$id, company.$id).then(function () {
        _deleteEmployee(employee).then(function () {
        });
        $uibModalInstance.close();
      });
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss();
    };

    function _deleteEmployee(employee) {
      return employee.$remove();
    }

    function _removeEmployeeFromCompany(employeeId) {
      return employees.$remove(lodash.find(employees, {$id: employeeId}));
    }
  })
;
