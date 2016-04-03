/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

angular.module('dogweb')
  .factory("CompanyDeviceList", function (Ref, CompanyDeviceListFactory) {
    return function (companyId) {
      return new CompanyDeviceListFactory(companyId, Ref.child('companies/' + companyId + '/devices'));
    }
  });