/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

angular.module('dogweb')
  .factory("CompanyDeviceFactory", function ($firebaseObject, $firebaseUtils, moment, lodash) {
    return $firebaseObject.$extend({

      $save: function () {
        this.updated_date = moment().format();

        return $firebaseObject.prototype.$save.apply(this, arguments);
      },

      addMacAddresses: function (macAddresses) {
        var _this = this;

        if (!this.mac_addresses) {
          this.mac_addresses = {};
        }

        lodash.forEach(macAddresses, function (macAddress) {
          if (macAddress.$id) {
            _this.mac_addresses[macAddress.$id] = true;

            macAddress.device_id = _this.$id;
            macAddress.$save();
          }
        });

        return this.$save();
      },

      removeMacAddresses: function (macAddresses) {
        var _this = this;

        lodash.forEach(macAddresses, function (macAddress) {
          if (macAddress.$id) {
            delete _this.mac_addresses[macAddress.$id];

            delete macAddress.device_id;
            macAddress.$save();
          }
        });

        return this.$save();
      }
    });
  });