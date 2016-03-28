/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

angular.module('dogweb')
  .factory("Company", function (Ref, CompanyFactory) {
    return function (companyId) {
      return new CompanyFactory(Ref.child('companies/' + companyId)).$loaded();
    }
  });