/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

angular.module('dogweb')
  .factory("CompanyEmployeeList", function (Ref, CompanyEmployeeListFactory) {
    return function (companyId) {
      return new CompanyEmployeeListFactory(companyId, Ref.child('companies/' + companyId + '/employees'));
    }
  });