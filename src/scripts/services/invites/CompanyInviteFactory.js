/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

angular.module('dogweb')
  .factory("CompanyInviteFactory", function ($firebaseObject) {
    return $firebaseObject.$extend({
      getId: function () {
        return this.$id;
      }
    });
  });