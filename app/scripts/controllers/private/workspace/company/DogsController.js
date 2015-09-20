/*
 * Copyright (C) 2015 dog.ai, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

'use strict';

angular.module('dogwebApp')
  .controller('DogsController', function ($scope, dog) {
    $scope.dog = dog;

  });
