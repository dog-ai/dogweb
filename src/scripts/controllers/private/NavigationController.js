/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

'use strict';

angular.module('dogweb')
  .controller('NavigationController', function ($scope, user, company, companyNotifications, Ref, $firebaseObject, Auth, $modal, lodash) {
    $scope.user = user;
    $scope.company = company;
    $scope.unreadNotifications = _calculateUnreadNotifications();

    $scope.notifications = [];

    $scope.loadNotifications = lodash.once(_loadNotifications);

    $scope.markNotificationAsRead = function (notificationId) {
      var notification = lodash.find(companyNotifications, {$id: notificationId})
      if (notification.$value) {
        notification.$value = false;
        companyNotifications.$save(0);
      }
    }

    $scope.logout = function () {
      Auth.$unauth();
    };

    $scope.openSwitchCompanyModal = function () {
      if (lodash.keys(user.companies).length <= 1) {
        return;
      }

      $modal.open({
        animation: true,
        templateUrl: '/views/private/modal/switch-company.html',
        controller: 'SwitchCompanyModalController',
        size: 'sm',
        resolve: {
          user: user,
          company: company,
          userCompanies: ['Ref', '$firebaseArray', function (Ref, $firebaseArray) {
            return $firebaseArray(Ref.child('users/' + user.$id + '/companies')).$loaded().then(function (userCompanies) {
              return userCompanies;
            });
          }]
        }
      }).result.finally(function () {

      });
    };

    companyNotifications.$watch(function (event) {
      switch (event.event) {
        case 'child_changed':
        case 'child_added':
        case 'child_removed':
          $scope.unreadNotifications = _calculateUnreadNotifications();
          break;
        default:
      }
    });

    function _loadNotifications() {
      angular.forEach(companyNotifications, function (notification) {
        _retrieveNotification(notification.$id).then(function (notification) {
          $scope.notifications.push(notification);
        });
      });

      companyNotifications.$watch(function (event) {
        switch (event.event) {
          case 'child_added':
            _retrieveNotification(event.key).then(function (notification) {
              $scope.notifications.push(notification);
            });
            break;
          case 'child_removed':

            lodash.remove($scope.notifications, function (notification) {
              return event.key == notification.$id;
            });
            break;
          default:
        }
      });
    }

    function _calculateUnreadNotifications() {
      return lodash.reduce(companyNotifications, function (unreadNotifications, companyNotification) {
        return companyNotification.$value ? ++unreadNotifications : unreadNotifications;
      }, 0)
    }

    function _retrieveNotification(notificationId) {
      return $firebaseObject(Ref.child('company_notifications/' + company.$id + '/' + notificationId)).$loaded().then(function (notification) {
        return notification;
      });
    }

  })

  .controller('SwitchCompanyModalController', function ($scope, user, company, userCompanies, $q, Ref, $firebaseObject, $state, $stateParams, $timeout, $modalInstance, lodash) {
    $scope.companies = [];
    $scope.selectedCompany = {};

    userCompanies.$watch(function (event) {
      switch (event.event) {
        case 'child_added':
          _retrieveCompany(event.key).then(function (company) {
            $scope.companies.push(company);
          });
          break;
        case 'child_removed':
          lodash.remove($scope.companies, function (company) {
            return event.key == company.$id;
          });
          break;
        default:
      }
    });

    angular.forEach(userCompanies, function (userCompany) {
      _retrieveCompany(userCompany.$id).then(function (companyRef) {
        $scope.companies.push(companyRef);
        if (companyRef.$id == company.$id) {
          $scope.selectedCompany = companyRef;
        }
      });
    });

    function _retrieveCompany(companyId) {
      return $firebaseObject(Ref.child('companies/' + companyId)).$loaded().then(function (company) {
        return company;
      });
    }

    $scope.switchCompany = function (selectedCompany) {
      if ($scope.form.$invalid) {
        return;
      }

      if (selectedCompany.$id != company.$id) {
        user.primary_company = selectedCompany.$id;
        user.updated_date = moment().format();

        user.$save()
          .then(function () {
            $state.go('private.content.dashboard', $stateParams, {reload: true}).then(function () {
              $modalInstance.close();
            });
          });
      } else {
        $modalInstance.close();
      }
    };

    $scope.cancel = function () {
      $modalInstance.dismiss();
    };
  })

;
