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

  .controller('EmployeesController', function ($scope, company, employees, lodash, $uibModal) {
    $scope.apps = company.apps;
    $scope.employees = employees;

    $scope.employeesAdapter = {};
    employees.setAdapter($scope.employeesAdapter);

    $scope.openAddNewEmployeeModal = function () {
      $uibModal.open({
        animation: true,
        templateUrl: '/views/private/content/employees/modal/add-employee.html',
        controller: 'AddEmployeeModalController',
        size: 'sm',
        resolve: {
          company: company,
          employees: function () {
            return employees;
          }
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
  })

  .controller('AddEmployeeModalController', function ($scope, company, employees, $uibModalInstance) {
    $scope.apps = company.apps;

    $scope.addNewEmployee = function (employee) {
      var now = new moment();

      employee = employee || {};
      employee.created_date = now.format();
      employee.updated_date = now.format();
      employee.company_id = company.$id;

      return employees.$add(employee)
        .then(function (employeeId) {
          if (employee.linkedin_profile_url) {
            var task = {event: 'social:linkedin:profile:import', data: {employee_id: employeeId, employee_linkedin_profile_url: employee.linkedin_profile_url}};
            return company.addTask(task);
          }
        })
        .then($uibModalInstance.close);
    };
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

      return employee.$save()
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
            var task = {event: 'social:linkedin:profile:import', data: {employee_id: employee.$id, employee_linkedin_profile_url: employee.linkedin_profile_url}};
            return company.addTask(task);
          }
        })
        .then($uibModalInstance.close);
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
  })

  .controller('RemoveEmployeeModalController', function ($scope, company, employee, employees, $uibModalInstance) {
    $scope.employee = employee;

    $scope.removeEmployee = function () {
      return employees.$remove(employee.$id)
        .then($uibModalInstance.close);
    };
  })
;
