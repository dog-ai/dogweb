/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

angular.module('dogweb')
  .factory("AppListFactory", function ($firebaseArray) {
    return $firebaseArray.$extend({

      getThumbnailUrlByName: function (name) {
        var app = this.$getRecord(name);
        if (app) {
          return app.thumbnail_url;
        }
      },

      getDescriptionByName: function (name) {
        var app = this.$getRecord(name);
        if (app) {
          return app.description;
        }
      }

    });
  });