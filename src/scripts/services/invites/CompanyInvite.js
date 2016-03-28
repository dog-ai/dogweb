/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

angular.module('dogweb')
  .factory("CompanyInvite", function (Ref, CompanyInviteFactory) {

    function CompanyInvite() {
    }

    CompanyInvite.prototype = {
      $save: function (companyId) {
        var _this = this;

        if (this.$id) {
          return Ref.child('/company_invites/' + companyId + '/' + this.$id).set(this);
        } else {
          return Ref.child('/company_invites/' + companyId).push(this)
            .then(function (companyInviteRef) {
              _this.$id = companyInviteRef.key();
              return companyInviteRef;
            });
        }
      },

      $remove: function (companyId, inviteId) {
        return Ref.child('/company_invites/' + companyId + '/' + inviteId).remove();
      },

      $load: function (companyId, inviteId) {
        return new CompanyInviteFactory(Ref.child('/company_invites/' + companyId + '/' + inviteId)).$loaded();
      },

      setId: function (id) {
        this.$id = id;
      },

      getId: function () {
        return this.$id;
      }
    };

    return CompanyInvite;
  });