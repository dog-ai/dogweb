/*
 * Copyright (C) 2015 dog.ai, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

angular.module('firebase.config', [])
  .constant('FBURL', 'https://dazzling-torch-7723.firebaseio.com')
  .constant('SIMPLE_LOGIN_PROVIDERS', ['password', 'anonymous', 'facebook', 'google', 'twitter', 'github'])

  .constant('loginRedirectPath', '/login');
