/*
 * Copyright (C) 2015 dog.ai, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

'use strict';

angular.module('dogwebApp')
  .filter('reverse', function () {
    return function (items) {
      return angular.isArray(items) ? items.slice().reverse() : [];
    };
  });
