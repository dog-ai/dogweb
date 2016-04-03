/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

angular.module('dogweb')
  .factory("CompanyDeviceListFactory", function ($firebaseArray, CompanyDevice, lodash, Ref) {
    return function (companyId, companyDevicesRef) {
      return $firebaseArray.$extend({
        _adapter: undefined,

        addDevice: function (device) {
          return Ref.child('/company_devices/' + companyId).push(device)
            .then(function (companyDeviceRef) {
              return companyDevicesRef.child(companyDeviceRef.key()).set(true)
                .then(function () {
                  var companyDevice = new CompanyDevice(companyId, companyDeviceRef.key());
                  companyDevice = lodash.extend(companyDevice, device);
                  return companyDevice;
                });
            });
        },

        $$added: function (snapshot) {
          var device = new CompanyDevice(companyId, snapshot.key());

          if (this._adapter) {
            this._adapter.prepend([device]);
          }

          return device;
        },

        removeDevice: function (deviceId) {
          return companyDevicesRef.child(deviceId).remove();
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

          var promises = lodash.map(result.slice(index - 1 < 0 ? 0 : index - 1, index - 1 + count), function (device) {
            return device.$loaded();
          });

          Promise.all(promises)
            .then(callback);
        },

        setAdapter: function (adapter) {
          this._adapter = adapter;
        }

      })(companyDevicesRef);
    }
  });