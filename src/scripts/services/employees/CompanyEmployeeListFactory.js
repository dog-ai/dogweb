/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

angular.module('dogweb')
  .factory("CompanyEmployeeListFactory", function ($firebaseArray, CompanyEmployee, lodash, Ref) {
    return function (companyId, companyEmployeesRef) {
      return $firebaseArray.$extend({
        _adapter: undefined,

        $add: function (employee) {
          return Ref.child('/company_employees/' + companyId).push(employee)
            .then(function (companyEmployeeRef) {
              return companyEmployeesRef.child(companyEmployeeRef.key()).set(true)
                .then(function () {
                  return companyEmployeeRef.key();
                });
            });
        },

        $$added: function (snapshot) {
          var employee = new CompanyEmployee(companyId, snapshot.key());

          if (this._adapter) {
            this._adapter.prepend([employee]);
          }

          return employee;
        },

        $remove: function (employeeId) {
          return companyEmployeesRef.child(employeeId).remove()
            .then(function () {
              return Ref.child('/company_employees/' + companyId + '/' + employeeId).remove()
            });
        },

        $$removed: function (snapshot) {
          this._adapter.applyUpdates(function (item) {
            if (snapshot.key() === item.$id) {
              return [];
            }
          });

          return true;
        },

        get: function (index, count, callback) {
          var result = lodash.toArray(this.$list);

          var promises = lodash.map(result.slice(index - 1 < 0 ? 0 : index - 1, index - 1 + count), function (employee) {
            return employee.$loaded();
          });

          Promise.all(promises)
            .then(callback);
        },

        setAdapter: function (adapter) {
          this._adapter = adapter;
        }

      })(companyEmployeesRef);
    }
  });