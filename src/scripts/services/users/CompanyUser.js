/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

angular.module('dogweb')
  .factory("CompanyUser", function (Ref, CompanyUserFactory) {
    return function (userId) {
      return new CompanyUserFactory(Ref.child('/users/' + userId));
    }
  });