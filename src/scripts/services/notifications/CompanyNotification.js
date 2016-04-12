/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

angular.module('dogweb')
  .factory("CompanyNotification", function (Ref, CompanyNotificationFactory) {

    function CompanyNotification() {
    }

    CompanyNotification.prototype = {

      $load: function (companyId, notificationId) {
        return new CompanyNotificationFactory(Ref.child('/company_notifications/' + companyId + '/' + notificationId));
      },

      isUnread: function () {
        return this._isUnread;
      },

      setUnread: function (unread) {
        this._isUnread = unread;
      },

      // used by CompanyNotificationListFactory
      toJSON: function () {
        return this._isUnread;
      }
    };

    return CompanyNotification;
  });