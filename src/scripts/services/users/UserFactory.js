/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

angular.module('dogweb')
  .factory("UserFactory", function ($firebaseObject, moment, lodash) {
    return $firebaseObject.$extend({

      $save: function () {
        this.updated_date = moment().format();

        return $firebaseObject.prototype.$save.apply(this, arguments);
      },

      addCompany: function (companyId) {
        if (!this.companies) {
          this.companies = {};
        }

        this.companies[companyId] = true;

        return this.$save();
      },

      removeCompany: function (companyId) {
        delete this.companies[companyId];

        if (lodash.size(this.companies) > 0) {
          if (this.primary_company === companyId) {
            this.primary_company = lodash.keys(this.companies)[0];
          }
        } else {
          delete this.primary_company;
        }

        return this.$save();
      },

      setPrimaryCompany: function (companyId) {
        if (this.companies[companyId]) {
          this.primary_company = companyId;

          return this.$save();
        }
      }

    });
  });