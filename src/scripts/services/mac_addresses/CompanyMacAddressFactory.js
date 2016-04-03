/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

angular.module('dogweb')
  .factory("CompanyMacAddressFactory", function ($firebaseObject, $firebaseUtils, moment, lodash) {
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

            macAddress.macAddress_id = _this.$id;
            macAddress.updated_date = moment().format();
            macAddress.$save();
          }
        });

        return this.$save();
      },

      removeMacAddresses: function (macAddresses) {
        var _this = this;

        if (!this.mac_addresses) {
          return;
        }

        lodash.forEach(macAddresses, function (macAddress) {
          if (macAddress.$id) {
            console.log(macAddress);
            delete _this.mac_addresses[macAddress.$id];

            delete macAddress.macAddress_id;
            macAddress.updated_date = moment().format();
            macAddress.$save();
          }
        });

        return this.$save();
      }
    });
  });