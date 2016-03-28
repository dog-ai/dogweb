/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

angular.module('dogweb')
  .factory("AppListFactory", function ($firebaseArray) {
    return $firebaseArray.$extend({

      findNameById: function (id) {
        var app = this.$getRecord(id);
        if (app) {
          return app.name;
        }
      },

      findThumbnailUrlById: function (id) {
        var app = this.$getRecord(id);
        if (app) {
          return app.thumbnail_url;
        }
      },

      findDescriptionById: function (id) {
        var app = this.$getRecord(id);
        if (app) {
          return app.description;
        }
      }

    });
  });