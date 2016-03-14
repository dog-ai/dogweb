/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

(function () {
  'use strict';
  angular.module('firebase.auth', ['firebase', 'firebase.ref'])

    .factory('Auth', function ($firebaseAuth, Ref) {
      return $firebaseAuth(Ref);
    });
})();
