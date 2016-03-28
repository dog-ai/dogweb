/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

angular.module('dogweb')
  .factory("CompanyNotificationList", function (Ref, CompanyNotificationListFactory) {
    return function (companyId) {
      return new CompanyNotificationListFactory(companyId, Ref.child('companies/' + companyId + '/notifications'))
        .$loaded();
    }
  });