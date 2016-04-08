/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

angular.module('dogweb')
  .factory("CompanyAppList", function (Ref, CompanyAppListFactory) {
    return function (companyId) {
      return new CompanyAppListFactory(companyId, Ref.child('companies/' + companyId + '/apps'));
    }
  });