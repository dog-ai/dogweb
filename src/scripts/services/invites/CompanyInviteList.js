/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

angular.module('dogweb')
  .factory("CompanyInviteList", function (Ref, CompanyInviteListFactory) {
    return function (companyId) {
      return new CompanyInviteListFactory(companyId, Ref.child('companies/' + companyId + '/invites'))
        .$loaded();
    }
  });