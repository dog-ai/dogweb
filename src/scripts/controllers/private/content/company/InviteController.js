/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

'use strict';

angular.module('dogweb')
  .controller('InviteController', function ($scope, user, invite, inviteCompanyUsers, inviteCompanyInvites, $state, lodash) {

    inviteCompanyUsers.addUser(user)
      .then(function () {
        return user.addCompany(invite.company.id)
          .then(function () {
            return user.setPrimaryCompany(invite.company.id);
          })
      })
      .then(function () {
        inviteCompanyInvites.$remove(lodash.find(inviteCompanyInvites, {$id: invite.$id}))
        $state.go('private.content.dashboard', null, {reload: true});
      })
    ;
  })

;
