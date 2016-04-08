/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

angular.module('dogweb')
  .factory("CompanyApp", function (Ref, CompanyAppFactory) {
    return function (companyId, appId) {
      return new CompanyAppFactory(Ref.child('/companies/' + companyId + '/apps/' + appId));
    }
  });