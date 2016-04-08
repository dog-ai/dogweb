/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

angular.module('dogweb')
  .factory("CompanyAppListFactory", function ($firebaseArray, CompanyApp) {
    return function (companyId, companyAppsRef) {
      return $firebaseArray.$extend({
        
        $$added: function (snapshot) {
          return new CompanyApp(companyId, snapshot.key());
        },

        getSize: function () {
          return this.$list.length;
        }
        
      })(companyAppsRef);
    }
  });