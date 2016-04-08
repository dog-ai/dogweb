/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

angular.module('dogweb')
  .factory("CompanyUserList", function (Ref, CompanyUserListFactory) {
    return function (companyId) {
      return new CompanyUserListFactory(companyId, Ref.child('companies/' + companyId + '/users'));
    }
  });