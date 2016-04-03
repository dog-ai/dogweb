/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

angular.module('dogweb')
  .factory("CompanyMacAddressList", function (Ref, CompanyMacAddressListFactory) {
    return function (companyId) {
      return new CompanyMacAddressListFactory(companyId, Ref.child('companies/' + companyId + '/mac_addresses'));
    }
  });