/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

angular.module('dogweb')
  .factory("CompanyApp", function (Ref, CompanyAppFactory) {

    function CompanyApp() {
    }

    CompanyApp.prototype = {

      $load: function (companyId, appId) {
        return new CompanyAppFactory(Ref.child('/companies/' + companyId + '/apps/' + appId));
      },

      setId: function (id) {
        this.$id = id;
      },

      getId: function () {
        return this.$id;
      },

      toJSON: function () {
        return true;
      }
    };

    return CompanyApp;
  });