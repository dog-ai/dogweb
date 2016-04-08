/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

angular.module('dogweb')
  .factory("CompanyInvite", function (Ref, CompanyInviteFactory) {
    return function (companyId, inviteId) {
      return new CompanyInviteFactory(Ref.child('/company_invites/' + companyId + '/' + inviteId));
    }
  });