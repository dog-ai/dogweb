/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

angular.module('dogweb')
  .factory("CompanyEmployeePerformance", function (Ref, CompanyEmployeePerformanceFactory) {
    return function (companyId, employeeId) {
      return new CompanyEmployeePerformanceFactory(Ref.child('/company_employee_performances/' + companyId + '/' + employeeId));
    }
  });