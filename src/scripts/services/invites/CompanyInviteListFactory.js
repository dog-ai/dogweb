/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

angular.module('dogweb')
  .factory("CompanyInviteListFactory", function ($firebaseArray, CompanyInvite, lodash) {
    return function (companyId, companyInvitesRef) {
      return $firebaseArray.$extend({
        _adapter: undefined,

        $add: function (invite) {
          var companyInvite = new CompanyInvite();
          companyInvite = lodash.extend(companyInvite, invite);

          if (companyInvite.getId()) {
            return companyInvitesRef.child(companyInvite.getId()).set(true)
              .then(function () {
                return companyInvitesRef.child(companyInvite.getId())
              });
          } else {
            return companyInvite.$save(companyId)
              .then(function () {
                return companyInvitesRef.child(companyInvite.getId()).set(true)
              })
              .then(function () {
                return companyInvitesRef.child(companyInvite.getId())
              });
          }
        },

        $$added: function (snapshot) {
          var _this = this;

          var invite = new CompanyInvite();
          invite.setId(snapshot.key());

          return invite.$load(companyId, invite.getId())// TODO: work-around for ui-scroll with tables
            .then(function (companyInvite) {
              if (_this._adapter) {
                _this._adapter.append([companyInvite]);
              }

              return invite;
            });
        },

        $$removed: function (snapshot) {
          if (this._adapter) {
            this._adapter.applyUpdates(function (item) {
              if (snapshot.key() === item.getId()) {
                return [];
              }
            });
          }

          return new CompanyInvite().$remove(companyId, snapshot.key())
            .then(function () {
              return true;
            })
        },

        $$getKey: function (invite) {
          return invite.getId();
        },

        getSize: function () {
          return this.$list.length;
        },

        get: function (index, count, callback) {
          var result = lodash.toArray(this.$list);

          var promises = lodash.map(result.slice(index - 1 < 0 ? 0 : index - 1, index - 1 + count), function (companyInvite) {
            return angular.extend(companyInvite.$load(companyId, companyInvite.getId()), companyInvite);
          });

          Promise.all(promises)
            .then(callback)
        },

        setAdapter: function (adapter) {
          this._adapter = adapter;
        }

      })(companyInvitesRef);
    }
  });