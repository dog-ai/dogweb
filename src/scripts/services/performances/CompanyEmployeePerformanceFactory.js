/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

angular.module('dogweb')
  .factory("CompanyEmployeePerformanceFactory", function ($firebaseObject) {
    return $firebaseObject.$extend({});
  });