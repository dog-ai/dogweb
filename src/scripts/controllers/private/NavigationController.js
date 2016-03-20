/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

'use strict';

angular.module('dogweb')
  .controller('NavigationController', function ($scope, user, company, apps, companyNotifications, Ref, $firebaseObject, Auth, $uibModal, lodash, $state) {
    $scope.user = user;
    $scope.company = company;
    $scope.unreadNotifications = _calculateUnreadNotifications();
    $scope.notifications = [];
    $scope.loadNotifications = lodash.once(_loadNotifications);

    $scope.markNotificationAsRead = function (notificationId) {
      var index = lodash.findIndex(companyNotifications, {$id: notificationId})
      if (index != -1 && companyNotifications[index].$value) {
        companyNotifications[index].$value = false;
        companyNotifications.$save(index);
      }
    }

    $scope.logout = function () {
      $state.go('public.login', {logout: true});
    };

    $scope.openSwitchCompanyModal = function () {
      if (lodash.keys(user.companies).length <= 1) {
        return;
      }

      $uibModal.open({
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
      angular.forEach(companyNotifications, function (companyNotification) {
        _retrieveNotificationAndPopulate(companyNotification.$id).then(function (notification) {
          $scope.notifications.push(notification);
        });
      });

      companyNotifications.$watch(function (event) {
        switch (event.event) {
          case 'child_changed':
            _retrieveNotificationAndPopulate(event.key).then(function (notification) {
              var index = lodash.findIndex($scope.notifications, {$id: notification.$id})
              $scope.notifications[index] = notification;
            });
            break;
          case 'child_added':
            _retrieveNotificationAndPopulate(event.key).then(function (notification) {
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

    function _retrieveNotificationAndPopulate(notificationId) {
      return _retrieveNotification(notificationId)
        .then(function (notification) {
          var companyNotification = lodash.find(companyNotifications, {$id: notificationId})
          var app = lodash.find(apps, {$id: notification.app});
          var url;

          switch (notification.app) {
            case 'employee':
              break;
            default:
          }

          return lodash.extend(notification, {
            unread: companyNotification.$value,
            thumbnail_url: app.thumbnail_url,
            url: '#/' + notification.module + 's/' + notification[notification.module]
          })
        });
    }

  })

  .controller('SwitchCompanyModalController', function ($scope, user, company, userCompanies, $q, Ref, $firebaseObject, $state, $stateParams, $timeout, $uibModalInstance, lodash) {
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
              $uibModalInstance.close();
            });
          });
      } else {
        $uibModalInstance.close();
      }
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss();
    };
  })

;
