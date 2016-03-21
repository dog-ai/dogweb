/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

'use strict';

angular.module('dogweb')

  .controller('NotificationsController', function ($scope, user, company, apps, companyNotifications, Ref, $firebaseObject, Auth, $uibModal, lodash, $state) {
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

          switch (notification.module) {
            case 'employee':
              url = '#/' + notification.module + 's/' + notification[notification.module];
              break;
            default:
              url = '#/' + notification.module + 's';
          }

          return lodash.extend(notification, {
            unread: companyNotification.$value,
            thumbnail_url: app.thumbnail_url,
            url: url
          })
        });
    }

  })

;
