/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

angular.module('dogweb')
  .factory("CompanyDevice", function (Ref, CompanyDeviceFactory) {
    return function (companyId, deviceId) {
      return new CompanyDeviceFactory(Ref.child('/company_devices/' + companyId + '/' + deviceId));
    }
  });