/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

'use strict';

angular.module('dogweb')
  
  .controller('UsersController', function ($scope, user, company, companyUsers, companyInvites, $uibModal) {
    $scope.companyUsers = companyUsers;
    $scope.companyInvites = companyInvites;

    $scope.openRemoveUserModal = function (user) {
      $uibModal.open({
        animation: true,
        templateUrl: '/views/private/content/company/modal/remove-user.html',
        controller: 'RemoveUserModalController',
        size: 'sm',
        resolve: {
          company: company,
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
        size: 'md',
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

    $scope.removeInvite = function (companyInvite) {
      return companyInvites.removeInvite(companyInvite.$id)
        .then(function () {
          return companyInvite.$remove();  
        })
    };
  })

  .controller('RemoveUserModalController', function ($scope, company, companyUsers, user, $uibModalInstance) {
    $scope.user = user;

    $scope.removeUser = function (user) {
      return companyUsers.removeUser(user.$id)
        .then(function () {
          return user.removeCompany(company.$id);
        })
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
      invite.url = $location.protocol() + "://" + $location.host() + ":" + ($location.port() == 80 ? '' : $location.port()) + '/#/invite';
      
      return companyInvites.addInvite(invite)
        .then(function (companyInvite) {
          invite.id = companyInvite.$id;

          var task = {event: 'user:invite', data: {invite: invite}};
          return company.addTask(task);
          
        })
        .then($uibModalInstance.close);
    };
  })

;
