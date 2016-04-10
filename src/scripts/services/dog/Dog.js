/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

angular.module('dogweb')
  .factory("Dog", function (Ref, DogFactory) {
    return function (dogId) {
      return new DogFactory(Ref.child('/dogs/' + dogId));
    }
  });