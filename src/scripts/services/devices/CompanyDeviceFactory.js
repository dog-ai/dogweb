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
      },

      // temporary
      getManufacturer: function () {

        if (this.name !== undefined && this.name.length > 0) {
          if (
            this.name.toLowerCase().indexOf('iphone') > -1 ||
            this.name.toLowerCase().indexOf('mac') > -1 ||
            this.name.toLowerCase().indexOf('mbp') > -1) {
            return 'social-apple';
          }

          if (
            this.name.toLowerCase().indexOf('pc') > -1) {
            return 'social-windows';
          }

          if (
            this.name.toLowerCase().indexOf('tv') > -1 ||
            this.name.toLowerCase().indexOf('lfd') > -1) {
            return 'social-tux';
          }

          if (this.name.toLowerCase().indexOf('android') > -1) {
            return 'social-android';
          }

          if (this.name.toLowerCase().indexOf('chrome') > -1) {
            return 'social-chrome';
          }

          if (this.name.toLowerCase().indexOf('ps4') > -1) {
            return 'playstation';
          }
        }

        if (this.manufacturer !== undefined && this.manufacturer.length > 0) {
          if (
            this.manufacturer.toLowerCase().indexOf('apple') > -1) {
            return 'social-apple';
          }

          if (
            this.manufacturer.toLowerCase().indexOf('intel') > -1) {
            return 'social-windows';
          }

          if (
            this.manufacturer.toLowerCase().indexOf('raspberry') > -1 ||
            this.manufacturer.toLowerCase().indexOf('askey') > -1 ||
            this.manufacturer.toLowerCase().indexOf('epigram') > -1) {
            return 'social-tux';
          }

          if (this.manufacturer.toLowerCase().indexOf('azurewave') > -1) {
            return 'social-chrome';
          }
        }

        return "help";
      }
    });
  });