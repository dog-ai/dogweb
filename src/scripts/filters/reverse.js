/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

'use strict';

angular.module('dogweb')
  .filter('reverse', function () {
    return function (items) {
      return angular.isArray(items) ? items.slice().reverse() : [];
    };
  });
