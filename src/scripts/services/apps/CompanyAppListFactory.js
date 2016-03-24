/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

angular.module('dogweb')
  .factory("CompanyAppListFactory", function ($firebaseArray, CompanyApp, lodash) {
    return function (companyId, companyAppsRef) {
      return $firebaseArray.$extend({
        _adapter: undefined,

        $$added: function (snapshot) {
          var app = new CompanyApp();
          app.setId(snapshot.key());

          if (this._adapter) {
            this._adapter.prepend([app]);
          }

          return app;
        },

        $$getKey: function (app) {
          return app.getId();
        },

        get: function (index, count, callback) {
          var result = lodash.toArray(this.$list);

          var promises = lodash.map(result.slice(index - 1 < 0 ? 0 : index - 1, index - 1 + count), function (app) {
            return app.$load(companyId, app.getId());
          });

          Promise.all(promises)
            .then(callback)
        },

        setAdapter: function (adapter) {
          this._adapter = adapter;
        }

      })(companyAppsRef);
    }
  });