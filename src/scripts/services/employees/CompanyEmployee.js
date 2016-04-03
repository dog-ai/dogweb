/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

angular.module('dogweb')
  .factory("CompanyEmployee", function (Ref, CompanyEmployeeFactory) {
    return function (companyId, employeeId) {
      return new CompanyEmployeeFactory(Ref.child('/company_employees/' + companyId + '/' + employeeId));
    }
  });