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
        templateUrl: 'views/private/content/employees/modal/add_new_employee.html',
        controller: 'AddEmployeeModalController',
        size: null,
        resolve: {
          company: company
        }
      });
    };

    $scope.openRemoveEmployeeModal = function (employee) {
      $modal.open({
        animation: true,
        templateUrl: 'views/private/content/employees/modal/remove_employee.html',
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

  .controller('RemoveEmployeeModalController', function ($scope, company, employees, employee, $modalInstance, lodash) {

    $scope.employee = employee;

    $scope.removeEmployee = function (employee) {
      _removeEmployeeFromCompany(employee.$id, company.$id).then(function () {
        _destroyEmployee(employee).then(function () {
        });
        $modalInstance.close();
      });
    };

    $scope.cancel = function () {
      $modalInstance.dismiss();
    };

    function _destroyEmployee(employee) {
      return employee.$remove();
    }

    function _removeEmployeeFromCompany(employeeId) {
      return employees.$remove(lodash.find(employees, {$id: employeeId}));
    }
  })

;
