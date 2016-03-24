/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

angular.module('dogweb')
  .factory("CompanyAppFactory", function ($firebaseObject) {
    return $firebaseObject.$extend({

      setEnabled: function (enabled) {
        this.is_enabled = enabled;

        return this.$save();
      }

    });
  });