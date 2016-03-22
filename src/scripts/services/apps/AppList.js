/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

angular.module('dogweb')
  .factory("AppList", function (Ref, AppListFactory) {
    return function () {
      return new AppListFactory(Ref.child('apps'));
    };
  });