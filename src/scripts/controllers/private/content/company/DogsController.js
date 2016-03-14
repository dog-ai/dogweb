/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

'use strict';

angular.module('dogweb')
  .controller('DogsController', function ($scope, dog) {
    $scope.dog = dog;

  });
