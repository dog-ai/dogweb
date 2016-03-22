/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

angular.module('dogweb')
  .factory("CompanyNotificationListFactory", function ($firebaseArray, CompanyNotification, lodash) {
    return function (companyId, companyNotificationsRef) {
      return $firebaseArray.$extend({
        _unreadCount: 0,

        $$added: function (snapshot) {
          var notification = new CompanyNotification();
          notification.setId(snapshot.key());
          notification.setUnread(snapshot.val());

          if (notification.isUnread()) {
            this._unreadCount++;
          }

          return notification;
        },

        $$updated: function (snapshot) {
          var notification = this.$getRecord(snapshot.key());

          if (notification.isUnread() != snapshot.val()) {
            notification.setUnread(snapshot.val());
            this._unreadCount = notification.isUnread() ? this._unreadCount + 1 : this._unreadCount - 1;
            return true;
          } else {
            return false;
          }

        },

        $$getKey: function (notification) {
          return notification.getId();
        },

        getUnreadCount: function () {
          return this._unreadCount;
        },

        getSize: function () {
          return this.$list.length;
        },

        isUnread: function (notification) {
          var index = this.$indexFor(notification.getId());

          return index > -1 ? this.$list[index].isUnread() : false;
        },

        markAsRead: function (notification) {
          var index = this.$indexFor(notification.getId());
          if (index != -1 && this.$list[index].isUnread()) {
            this.$list[index].setUnread(false);
            this.$save(index);

            this._unreadCount--;
          }
        },

        get: function (index, count, callback) {
          var result = lodash.reverse(lodash.toArray(this.$list));

          var promises = lodash.map(result.slice(index - 1 < 0 ? 0 : index - 1, index - 1 + count), function (companyNotification) {
            return angular.extend(companyNotification.$load(companyId, companyNotification.getId()), companyNotification);
          });

          Promise.all(promises)
            .then(callback)
        }

      })(companyNotificationsRef);
    }
  });