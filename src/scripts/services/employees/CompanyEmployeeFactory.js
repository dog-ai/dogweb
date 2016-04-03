/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

angular.module('dogweb')
  .factory("CompanyEmployeeFactory", function ($firebaseObject, $firebaseUtils, moment, Ref) {

    function stripUnderscorePrefixedKeys(data) {
      if (!angular.isObject(data)) {
        return data;
      }
      var out = angular.isArray(data) ? [] : {};
      angular.forEach(data, function (v, k) {
        if (typeof k !== 'string' || k.charAt(0) !== '_') {
          out[k] = stripUnderscorePrefixedKeys(v);
        }
      });
      return out;
    }

    return $firebaseObject.$extend({

      $loaded: function () {
        var _this = this;

        return $firebaseObject.prototype.$loaded.apply(this, arguments)
          .then(function (employee) {

            var ref = Ref.child('company_employee_performances/' + _this.$ref().parent().key() + '/' + _this.$id + '/presence/_stats');

            return $firebaseObject(ref).$loaded()
              .then(function (_stats) {
                if (_stats.$value !== null) {
                  employee._performances = {
                    presence: _stats
                  };
                }

                return employee;
              });
          });
      },

      $save: function () {
        this.updated_date = moment().format();

        return $firebaseObject.prototype.$save.apply(this, arguments);
      },

      removeDevice: function (deviceId) {
        delete this.devices[deviceId];

        return this.$save();
      },

      toJSON: function () {
        return $firebaseUtils.toJSON(stripUnderscorePrefixedKeys(this));
      }

    });
  });