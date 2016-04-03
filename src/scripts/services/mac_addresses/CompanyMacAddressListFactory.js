/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

angular.module('dogweb')
  .factory("CompanyMacAddressListFactory", function ($firebaseArray, CompanyMacAddress, lodash, Ref) {
    return function (companyId, companyMacAddresssRef) {
      return $firebaseArray.$extend({
        _adapter: undefined,

        addMacAddress: function (macAddress) {
          return Ref.child('/company_mac_addresses/' + companyId).push(macAddress)
            .then(function (companyMacAddressRef) {
              return companyMacAddresssRef.child(companyMacAddressRef.key()).set(true)
                .then(function () {
                  var companyMacAddress = new CompanyMacAddress(companyId, companyMacAddressRef.key());
                  companyMacAddress = lodash.extend(companyMacAddress, macAddress);
                  return companyMacAddress;
                });
            });
        },

        $$added: function (snapshot) {
          var macAddress = new CompanyMacAddress(companyId, snapshot.key());

          if (this._adapter) {
            this._adapter.prepend([macAddress]);
          }

          return macAddress;
        },

        removeMacAddress: function (macAddressId) {
          return companyMacAddresssRef.child(macAddressId).remove();
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

          var promises = lodash.map(result.slice(index - 1 < 0 ? 0 : index - 1, index - 1 + count), function (macAddress) {
            return macAddress.$loaded();
          });

          Promise.all(promises)
            .then(callback);
        },

        setAdapter: function (adapter) {
          this._adapter = adapter;
        }

      })(companyMacAddresssRef);
    }
  });