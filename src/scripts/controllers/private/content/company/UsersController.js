/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

'use strict';

angular.module('dogweb')
  .controller('UsersController', function ($scope, user, company, companyUsers, companyInvites, $uibModal, lodash) {
    $scope.companyUsers = companyUsers;
    $scope.companyInvites = companyInvites;

    $scope.companyUsersAdapter = {};
    companyUsers.setAdapter($scope.companyUsersAdapter);

    $scope.companyInvitesAdapter = {};
    companyInvites.setAdapter($scope.companyInvitesAdapter);

    $scope.openRemoveUserModal = function (user) {
      $uibModal.open({
        animation: true,
        templateUrl: '/views/private/content/company/modal/remove-user.html',
        controller: 'RemoveUserModalController',
        size: 'sm',
        resolve: {
          companyUsers: function () {
            return companyUsers;
          },
          user: user
        }
      }).result.finally(function () {
      });
    };

    $scope.openInviteUserModal = function () {
      $uibModal.open({
        animation: true,
        templateUrl: '/views/private/content/company/modal/invite-user.html',
        controller: 'InviteUserModalController',
        size: null,
        resolve: {
          user: user,
          company: company,
          companyInvites: function () {
            return companyInvites;
          }
        }
      }).result.finally(function () {
      });
    };

    $scope.removeInvite = function (invite) {
      return companyInvites.$remove(lodash.find(companyInvites, {$id: invite.getId()}))
    };
  })

  .controller('RemoveUserModalController', function ($scope, companyUsers, user, $uibModalInstance, lodash) {
    $scope.user = user;

    $scope.cancel = $uibModalInstance.dismiss;

    $scope.removeUser = function (user) {
      return companyUsers.$remove(lodash.find(companyUsers, {$id: user.$id}))
        .then($uibModalInstance.close);
    };
  })

  .controller('InviteUserModalController', function ($scope, CompanyInvite, user, company, companyInvites, $uibModalInstance, $location, lodash) {
    $scope.invite = {};

    $scope.validateInvite = function () {
      return $scope.form.$valid;
    };

    $scope.sendInvite = function (invite) {
      var now = moment();

      invite.created_date = now.format();
      invite.user = {id: user.$id, full_name: user.full_name};
      invite.company = {id: company.$id, name: company.name};
      invite.url = $location.protocol() + "://" + $location.host() + ":" +
        ($location.port() == 80 ? '' : $location.port()) + '/#/invite';

      var companyInvite = new CompanyInvite();
      companyInvite = lodash.extend(companyInvite, invite);

      companyInvites.$add(companyInvite)
        .then(function (companyInviteRef) {
          invite.id = companyInviteRef.key();

          var task = {event: 'user:invite', data: {invite: invite}};
          return company.addTask(task);
        })
        .then(function () {
          $uibModalInstance.close();
        })
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss();
    };
  })

;
