/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

'use strict';

angular.module('dogwebApp')

  .config(['$locationProvider', '$urlRouterProvider', '$stateProvider', function ($locationProvider, $urlRouterProvider, $stateProvider) {

    $urlRouterProvider
      .otherwise('/');

    $stateProvider
      .state('public', {
        abstract: true,
        templateUrl: "/views/public.html"
      })
      .state('public.signup', {
        url: "/signup?envelope",
        views: {
          'header': {
            templateUrl: '/views/public/navigation.html'
          },
          'content': {
            templateUrl: "/views/public/signup.html",
            controller: 'SignUpController',
            resolve: {
              auth: ["Auth", '$state', function (Auth, $state) {
                return Auth.$waitForAuth().then(function (auth) {
                  if (auth !== null) {
                    $state.go('private.content.dashboard');
                  }
                });
              }],
              invite: ['$stateParams', '$base64', 'Ref', '$firebaseObject', function ($stateParams, $base64, Ref, $firebaseObject) {
                if ($stateParams.envelope !== undefined) {
                  try {
                    var envelope = JSON.parse(decodeURIComponent(escape($base64.decode(decodeURIComponent($stateParams.envelope)))));
                    return $firebaseObject(Ref.child('company_invites/' + envelope.company.id + '/' + envelope.invite.id)).$loaded();
                  } catch (error) {
                  }
                }
                return undefined;
              }]
            }
          }
        }
      })
      .state('public.login', {
        url: "/login",
        views: {
          'header': {
            templateUrl: '/views/public/navigation.html'
          },
          'content': {
            templateUrl: "/views/public/login.html",
            controller: 'LogInController',
            resolve: {
              auth: ["Auth", '$state', function (Auth, $state) {
                return Auth.$waitForAuth().then(function (auth) {
                  if (auth !== null) {
                    $state.go('private.content.dashboard');
                  }
                });
              }]
            }
          }
        }
      })
      .state('public.forgot', {
        url: "/forgot",
        views: {
          'header': {
            templateUrl: '/views/public/navigation.html'
          },
          'content': {
            templateUrl: "/views/public/forgot-password.html",
            controller: 'ForgotPasswordController',
            resolve: {
              auth: ["Auth", '$state', function (Auth, $state) {
                return Auth.$waitForAuth().then(function (auth) {
                  if (auth !== null) {
                    $state.go('private.content.dashboard');
                  }
                });
              }]
            }
          }
        }
      })
      .state('public.teaser', {
        abstract: true,
        views: {
          'header': {
            templateUrl: '/views/public/navigation.html'
          },
          'content': {
            templateUrl: "/views/public/teaser.html"
          }
        }
      })
      .state('public.teaser.landing', {
        url: "/",
        templateUrl: "/views/public/teaser/landing.html"
      })
      .state('private', {
        abstract: true,
        templateUrl: "/views/private.html",

        resolve: {
          auth: ['$rootScope', 'Auth', function ($rootScope, Auth) {
            return Auth.$requireAuth().then(function (auth) {
              if ($rootScope.user_id === undefined) {
                $rootScope.user_id = auth.uid;
              }
              return auth;
            });
          }],
          user: ['$rootScope', 'auth', 'Ref', '$firebaseObject', function ($rootScope, auth, Ref, $firebaseObject) {
            return $firebaseObject(Ref.child('users/' + auth.uid)).$loaded().then(function (user) {
              return user;
            });
          }],
          company: ['$rootScope', 'user', 'Ref', '$firebaseObject', 'lodash', function ($rootScope, user, Ref, $firebaseObject, lodash) {
            return $firebaseObject(Ref.child('companies/' + (lodash.keys(user.companies).length > 1 ? user.primary_company : lodash.keys(user.companies)[0]))).$loaded().then(function (company) {
              return company;
            });
          }]
        }
      })
      .state('private.content', {
        abstract: true,
        views: {
          'header': {
            templateUrl: '/views/private/navigation.html',
            controller: 'NavigationController'
          },
          'content': {
            templateUrl: "/views/private/content.html",
          }
        }
      })

      .state('private.content.dashboard', {
        url: "/dashboard",
        templateUrl: "/views/private/content/dashboard.html",
        controller: 'DashboardController'
      })

      .state('private.content.user', {
        abstract: true,
        templateUrl: "/views/private/content/user/user.html"
      })
      .state('private.content.user.preferences', {
        url: "/preferences",
        templateUrl: "/views/private/content/user/preferences.html",
        controller: 'UserPreferencesController'
      })

      .state('private.content.company', {
        abstract: true,
        templateUrl: "/views/private/content/company/company.html",
      })
      .state('private.content.company.dogs', {
        url: "/dogs",
        templateUrl: "/views/private/content/company/dogs.html",
        controller: 'DogsController',
        resolve: {
          dog: ['company', 'Ref', '$firebaseObject', function (company, Ref, $firebaseObject) {
            if (company.dog_id === undefined) {
              return undefined;
            } else {
              return $firebaseObject(Ref.child('dogs/' + company.dog_id)).$loaded().then(function (dog) {
                return dog;
              });
            }
          }],
        }
      })
      .state('private.content.company.devices', {
        url: "/devices",
        templateUrl: "/views/private/content/company/devices.html",
        controller: 'DevicesController',
        resolve: {
          companyDevices: ['$rootScope', 'user', 'Ref', '$firebaseArray', 'company', function ($rootScope, user, Ref, $firebaseArray, company) {
            return $firebaseArray(Ref.child('companies/' + company.$id + '/devices')).$loaded().then(function (companyDevices) {
              return companyDevices;
            });
          }],
          companyMacAddresses: ['$rootScope', 'user', 'Ref', '$firebaseArray', 'company', function ($rootScope, user, Ref, $firebaseArray, company) {
            return $firebaseArray(Ref.child('companies/' + company.$id + '/mac_addresses')).$loaded().then(function (companyMacAddresses) {
              return companyMacAddresses;
            });
          }]
        }
      })
      .state('private.content.company.users', {
        url: "/users",
        templateUrl: "/views/private/content/company/users.html",
        controller: 'UsersController',
        resolve: {
          companyUsersRef: ['$rootScope', 'user', 'Ref', '$firebaseArray', 'company', function ($rootScope, user, Ref, $firebaseArray, company) {
            return $firebaseArray(Ref.child('companies/' + company.$id + '/users')).$loaded().then(function (companyUsersRef) {
              return companyUsersRef;
            });
          }],
          companyInvitesRef: ['$rootScope', 'user', 'Ref', '$firebaseArray', 'company', function ($rootScope, user, Ref, $firebaseArray, company) {
            return $firebaseArray(Ref.child('company_invites/' + company.$id)).$loaded().then(function (companyInvitesRef) {
              return companyInvitesRef;
            });
          }]
        }
      })
      .state('private.content.company.apps', {
        url: "/apps",
        templateUrl: "/views/private/content/company/apps.html",
        controller: 'AppsController',
        resolve: {
          companyAppsRef: ['$rootScope', 'company', 'Ref', '$firebaseArray', function ($rootScope, company, Ref, $firebaseArray) {
            return $firebaseArray(Ref.child('companies/' + company.$id + '/apps')).$loaded().then(function (companyAppsRef) {
              return companyAppsRef;
            });
          }],
          appsRef: ['Ref', '$firebaseArray', function (Ref, $firebaseArray) {
            return $firebaseArray(Ref.child('apps/')).$loaded().then(function (appsRef) {
              return appsRef;
            });
          }]
        }
      })

      .state('private.content.employees', {
        url: "/employees",
        templateUrl: "/views/private/content/employees/employees.html",
        controller: 'EmployeesController',
        resolve: {
          employees: ['$rootScope', 'user', 'Ref', '$firebaseArray', 'company', function ($rootScope, user, Ref, $firebaseArray, company) {
            return $firebaseArray(Ref.child('companies/' + company.$id + '/employees')).$loaded().then(function (employees) {
              return employees;
            });
          }]
        }
      })
      .state('private.content.employee', {
        url: "/employees/:id",
        templateUrl: "/views/private/content/employees/employee.html",
        controller: 'EmployeeController',
        resolve: {
          employee: ['$rootScope', 'Ref', '$stateParams', '$firebaseObject', 'user', 'company', function ($rootScope, Ref, $stateParams, $firebaseObject, user, company) {
            return $firebaseObject(Ref.child('company_employees/' + company.$id + '/' + $stateParams.id)).$loaded().then(function (employee) {
              return employee;
            });
          }],
          alltimeStats: ['$rootScope', 'Ref', '$stateParams', '$firebaseObject', 'user', 'company', function ($rootScope, Ref, $stateParams, $firebaseObject, user, company) {
            return $firebaseObject(Ref.child('company_employee_performances/' + company.$id + '/' + $stateParams.id + '/presence/_stats')).$loaded().then(function (_stats) {
              return _stats;
            });
          }],
        }
      });
  }])

  .run(['$rootScope', '$location', 'Auth', '$state', '$timeout', '$window', 'Ref',
    function ($rootScope, $location, Auth, $state, $timeout, $window, Ref) {
      // watch for login status changes and redirect if appropriate
      Auth.$onAuth(function (auth) {
        if (!auth && $state.current && $state.current.name && $state.current.name.startsWith('private')) {
          $state.go('public.login');
        }

        if (auth) {
          var now = moment().format();
          var userRef = Ref.child('/users/' + auth.uid);
          userRef.update({
            updated_date: now,
            last_seen_date: now
          });
        }
      });

      $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
        if (error === "AUTH_REQUIRED") {
          $state.go('public.login');
        }
      });


    }
  ])

;
