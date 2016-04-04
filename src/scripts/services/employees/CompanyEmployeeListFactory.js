/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

angular.module('dogweb')
  .factory("CompanyEmployeeListFactory", function ($firebaseArray, $firebaseUtils, CompanyEmployee, lodash, Ref) {
    return function (companyId, companyEmployeesRef) {
      return $firebaseArray.$extend({
        _adapter: undefined,

        $add: function (employee) {
          return Ref.child('/company_employees/' + companyId).push(employee)
            .then(function (companyEmployeeRef) {

              // Firebase.ServerValue.TIMESTAMP will push the new employee to the end of the list
              return companyEmployeesRef.child(companyEmployeeRef.key())
                .setWithPriority(true, Firebase.ServerValue.TIMESTAMP)
                .then(function () {
                  return companyEmployeeRef.key();
                });
            });
        },

        $$added: function (snapshot) {
          var employee = new CompanyEmployee(companyId, snapshot.key());

          if (this._adapter) {
            this._adapter.append([employee]);
          }

          return employee;
        },

        $$updated: function () {

          // TODO: forcing a reload might not be efficient
          this._adapter.reload();

          return false;
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