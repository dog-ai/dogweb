/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

angular.module('dogweb')
  .factory("CompanyNotificationFactory", function ($firebaseObject) {
    return $firebaseObject.$extend({
      getId: function () {
        return this.$id;
      },

      getUrl: function () {
        switch (this.module) {
          case 'employee':
            return '#/' + this.module + 's/' + this[this.module];
          default:
            return '#/' + this.module + 's';
        }
      }
    });
  });