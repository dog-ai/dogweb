/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

'use strict';

angular.module('dogweb')

  .config(['DOG_AI', 'ROLLBAR', 'RollbarProvider',
    function (DOG_AI, ROLLBAR, RollbarProvider) {

      switch (DOG_AI.environment) {
        case 'production':
          RollbarProvider.init({
            accessToken: ROLLBAR.access_token,
            captureUncaught: true,
            payload: {
              environment: ROLLBAR.environment
            }
          });
          break;

        default:
          RollbarProvider.deinit();
      }
    }])

  .run(['DOG_AI', '$rootScope', '$location', 'Auth', '$state', '$timeout', '$window', 'User', 'Firebase',
    function (DOG_AI, $rootScope, $location, Auth, $state, $timeout, $window, User, Firebase) {

      $rootScope.$state = $state;

      // watch for login status changes and redirect if appropriate
      Auth.$onAuth(function (auth) {
        if (!auth && $state.current && $state.current.name && $state.current.name.startsWith('private')) {
          $state.go('public.login');
        }

        if (auth) {
          var user = new User(auth.uid)
          user.$loaded()
            .then(function (user) {

              switch (DOG_AI.environment) {
                case 'production':
                  Rollbar.configure({
                    payload: {
                      person: {
                        username: user.full_name,
                        id: auth.uid,
                        email: user.email_address
                      }
                    }
                  });
                  break;

                default:
              }

              user.is_online = true;
              user.last_seen_date = Firebase.ServerValue.TIMESTAMP;

              return user.$save();
            });
          user.$ref().onDisconnect().update({is_online: false, updated_date: Firebase.ServerValue.TIMESTAMP, last_seen_date: Firebase.ServerValue.TIMESTAMP});
        }
      });

      $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
        if (error === "AUTH_REQUIRED") {
          toParams.to = toState.name;
          $state.go('public.login', toParams);
        } else {
          console.error(error);
        }
      });
    }
  ])

;
