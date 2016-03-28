/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

angular.module('dogweb')
  .factory("CompanyUserListFactory", function ($firebaseArray, CompanyUser, lodash) {
    return function (companyId, companyUsersRef) {
      return $firebaseArray.$extend({
        _adapter: undefined,

        $add: function (user) {
          if (user.$id) {
            return companyUsersRef.child(user.$id).set(true)
              .then(function () {
                return companyUsersRef.child(user.$id);
              });
          }
        },

        $$added: function (snapshot) {
          var user = new CompanyUser(snapshot.key());

          if (this._adapter) {
            this._adapter.prepend([user]);
          }

          return user;
        },

        $$removed: function (snapshot) {
          this._adapter.applyUpdates(function (item) {
            if (snapshot.key() === item.$id) {
              return [];
            }
          });

          return this.$getRecord(snapshot.key()).$loaded()
            .then(function (user) {
              return user.removeCompany(companyId);
            })
            .then(function () {
              return true;
            })
        },

        get: function (index, count, callback) {
          var result = lodash.toArray(this.$list);

          var promises = lodash.map(result.slice(index - 1 < 0 ? 0 : index - 1, index - 1 + count), function (user) {
            return user.$loaded();
          });

          Promise.all(promises)
            .then(callback);
        },

        setAdapter: function (adapter) {
          this._adapter = adapter;
        }

      })(companyUsersRef);
    }
  });