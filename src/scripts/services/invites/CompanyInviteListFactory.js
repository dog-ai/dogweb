/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

angular.module('dogweb')
  .factory("CompanyInviteListFactory", function ($firebaseArray, CompanyInvite, lodash, Ref) {
    return function (companyId, companyInvitesRef) {
      return $firebaseArray.$extend({

        addInvite: function (invite) {
          return Ref.child('/company_invites/' + companyId).push(invite)
            .then(function (companyInviteRef) {

              // Firebase.ServerValue.TIMESTAMP will push the new invite to the end of the list
              return companyInvitesRef.child(companyInviteRef.key()).setWithPriority(true, Firebase.ServerValue.TIMESTAMP)
                .then(function () {
                  var companyInvite = new CompanyInvite(companyId, companyInviteRef.key());
                  companyInvite = lodash.extend(companyInvite, invite);
                  return companyInvite;
                });
            });
        },
        
        $$added: function (snapshot) {
          return new CompanyInvite(companyId, snapshot.key());
        },

        getSize: function () {
          return this.$list.length;
        },

        $$updated: function () {
          return true;
        },

        removeInvite: function (inviteId) {
          return companyInvitesRef.child(inviteId).remove();
        }

      })(companyInvitesRef);
    }
  });