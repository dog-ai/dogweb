/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

angular.module('dogweb')
  .factory("CompanyMacAddress", function (Ref, CompanyMacAddressFactory) {
    return function (companyId, macAddressId) {
      return new CompanyMacAddressFactory(Ref.child('/company_mac_addresses/' + companyId + '/' + macAddressId));
    }
  });