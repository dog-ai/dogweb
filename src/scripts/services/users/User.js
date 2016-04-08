/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

angular.module('dogweb')
  .factory("User", function (Ref, UserFactory) {
    return function (userId) {
      return new UserFactory(Ref.child('/users/' + userId));
    }
  });