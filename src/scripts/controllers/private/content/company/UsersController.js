/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

'use strict';

angular.module('dogweb')
  .controller('UsersController', function ($scope, user, company, companyUsersRef, companyInvitesRef, Ref, $firebaseObject, $modal, lodash) {

    $scope.users = [];
    $scope.invites = companyInvitesRef;

    companyUsersRef.$watch(function (event) {
      switch (event.event) {
        case 'child_added':
          _retrieveUser(event.key).then(function (user) {
            $scope.users.push(user);
          });
          break;
        case 'child_removed':
          lodash.remove($scope.users, function (userRef) {
            return event.key == userRef.$id;
          });
          break;
        default:
      }
    });

    angular.forEach(companyUsersRef, function (companyUserRef) {
      _retrieveUser(companyUserRef.$id).then(function (userRef) {
        $scope.users.push(userRef);
      });
    });

    $scope.openInviteUserModal = function () {
      $modal.open({
        animation: true,
        templateUrl: '/views/private/content/company/modal/invite-user.html',
        controller: 'InviteUserModalController',
        size: null,
        resolve: {
          user: user,
          company: company,
          companyInvitesRef: function () {
            return companyInvitesRef;
          }
        }
      }).result.finally(function () {
        });
    };

    $scope.deleteInvite = function (inviteRef) {
      _deleteInvite(inviteRef.$id);
    };

    function _retrieveUser(userId) {
      return $firebaseObject(Ref.child('users/' + userId)).$loaded().then(function (userRef) {
        return userRef;
      });
    }

    function _deleteInvite(inviteId) {
      return companyInvitesRef.$remove(lodash.find(companyInvitesRef, {$id: inviteId}));
    }

  })

  .controller('InviteUserModalController', function ($rootScope, $scope, user, company, companyInvitesRef, $q, Ref,
                                                     $firebaseObject, $state, $stateParams, $timeout, $modalInstance,
                                                     $base64, $location, sendGridService) {

    $scope.invite = {};

    $scope.validateInvite = function () {
      return $scope.form.$valid;
    };

    $scope.sendInvite = function (invite) {

      var now = moment();

      invite.created_date = now.format();
      invite.user_id = user.$id;

      _createInvite(invite)
        .then(_encodeInvite)
        .then(_sendInvite)
        .then(function () {
          $modalInstance.close();
        }, function () {

        });

    };

    $scope.cancel = function () {
      $modalInstance.dismiss();
    };

    function _createInvite(invite) {
      return companyInvitesRef.$add(invite).then(function (inviteRef) {
        return inviteRef.key();
      });
    }

    function _encodeInvite(inviteId) {
      var def = $q.defer();

      $timeout(function () {
        try {
          var envelope = {
            company: {id: company.$id},
            invite: {id: inviteId}
          };

          var encodedInvite = encodeURIComponent($base64.encode(unescape(encodeURIComponent(JSON.stringify(envelope)))));
          def.resolve(encodedInvite);
        } catch (error) {
          def.reject(error);
        }
      });

      return def.promise;
    }

    function _sendInvite(encodedInvite) {
      var def = $q.defer();

      $timeout(function () {
        if (false) {
          def.reject(error);
        } else {

          var url = $location.protocol() + "://" +
            $location.host() + ":" +
            ($location.port() == 80 ? '' : $location.port()) +
            '/#/signup?envelope=' +
            encodedInvite;

          console.log(url);

          /*sendGridService.$send(
           'dogweb',
           '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',
           user.email_address,
           user.full_name,
           user.full_name + ' sent you an invite for joining ' + company.name,
           'Click here: ' + url,
           'noreply@dog.ai');*/

          def.resolve();
        }
      });

      return def.promise;
    }

  })

;
