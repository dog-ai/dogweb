/*
 * Copyright (C) 2015 dog.ai, Hugo Freire <hugo@dog.ai>. All rights reserved.
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
        url: "/signup",
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
          auth: ["Auth", function (Auth) {
            return Auth.$requireAuth();
          }],
          user: ['$rootScope', 'auth', 'Ref', '$firebaseObject', 'lodash', function ($rootScope, auth, Ref, $firebaseObject, lodash) {
            return $firebaseObject(Ref.child('users/' + auth.uid)).$loaded().then(function (user) {
              if ($rootScope.company_id === undefined) {
                $rootScope.company_id = lodash.keys(user.companies)[0];
              }
              return user;
            });
          }],
          company: ['$rootScope', 'user', 'Ref', '$firebaseObject', function ($rootScope, user, Ref, $firebaseObject) {
            return $firebaseObject(Ref.child('companies/' + $rootScope.company_id)).$loaded().then(function (company) {
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
            controller: 'NavigationController',
            resolve: {
              userCompaniesRef: ['user', 'Ref', '$firebaseArray', function (user, Ref, $firebaseArray) {
                return $firebaseArray(Ref.child('users/' + user.$id + '/companies')).$loaded().then(function (userCompaniesRef) {
                  return userCompaniesRef;
                });
              }]
            }
          },
          'content': {
            templateUrl: "/views/private/content.html",
          }
        }
      })

      .state('private.content.dashboard', {
        url: "/dashboard",
        templateUrl: "/views/private/content/dashboard.html",
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
          devices: ['$rootScope', 'user', 'Ref', '$firebaseArray', function ($rootScope, user, Ref, $firebaseArray) {
            return $firebaseArray(Ref.child('companies/' + $rootScope.company_id + '/devices')).$loaded().then(function (devices) {
              return devices;
            });
          }],
          mac_addresses: ['$rootScope', 'user', 'Ref', '$firebaseArray', function ($rootScope, user, Ref, $firebaseArray) {
            return $firebaseArray(Ref.child('companies/' + $rootScope.company_id + '/mac_addresses')).$loaded().then(function (mac_addresses) {
              return mac_addresses;
            });
          }]
        }
      })
      .state('private.content.company.users', {
        url: "/users",
        templateUrl: "/views/private/content/company/users.html",
        controller: 'UsersController',
        resolve: {
          companyUsersRef: ['$rootScope', 'user', 'Ref', '$firebaseArray', function ($rootScope, user, Ref, $firebaseArray) {
            return $firebaseArray(Ref.child('companies/' + $rootScope.company_id + '/users')).$loaded().then(function (companyUsersRef) {
              return companyUsersRef;
            });
          }],
          companyInvitesRef: ['$rootScope', 'user', 'Ref', '$firebaseArray', function ($rootScope, user, Ref, $firebaseArray) {
            return $firebaseArray(Ref.child('company_invites/' + $rootScope.company_id)).$loaded().then(function (companyInvitesRef) {
              return companyInvitesRef;
            });
          }]
        }
      })

      .state('private.content.employees', {
        url: "/employees",
        templateUrl: "/views/private/content/employees/employees.html",
        controller: 'EmployeesController',
        resolve: {
          employees: ['$rootScope', 'user', 'Ref', '$firebaseArray', function ($rootScope, user, Ref, $firebaseArray) {
            return $firebaseArray(Ref.child('companies/' + $rootScope.company_id + '/employees')).$loaded().then(function (employees) {
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
          employee: ['user', 'Ref', '$stateParams', '$firebaseObject', function (user, Ref, $stateParams, $firebaseObject) {
            return $firebaseObject(Ref.child('employees/' + $stateParams.id)).$loaded().then(function (employee) {
              return employee;
            });
          }],
          devices: ['user', 'Ref', '$stateParams', '$firebaseArray', function (user, Ref, $stateParams, $firebaseArray) {
            return $firebaseArray(Ref.child('employees/' + $stateParams.id + '/devices')).$loaded().then(function (devices) {
              return devices;
            });
          }]
        }
      });
    /*.state("private.content.employee.modal", {
        abstract: true,
        onEnter: ['$modal', '$state', '$timeout', function ($modal, $state) {
          $modal.open({
            animation: true,
            templateUrl: 'views/private/content/modal.html',
            controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
              $scope.close = function () {
                $modalInstance.close();
              };

              $scope.dismiss = function () {
                $modalInstance.dismiss();
              }
            }]
          }).result.finally(function () {
              $state.go('private.content.employee');
            });
        }],
        onExit: function () {
        }
      })
      .state("private.content.employee.modal.add_device_to_employee", {
        views: {
          "modal@": {
            templateUrl: "views/private/content/employees/modal/add_device_to_employee.html",
            controller: 'AddDeviceToEmployeeModalController',
            resolve: {
              devices: ['Ref', '$firebaseArray', 'company', function (Ref, $firebaseArray, company) {
                return $firebaseArray(Ref.child('companies/' + company.$id + '/devices')).$loaded().then(function (devices) {
                  return devices;
                });
              }]
            }
          }
        }
      })
      .state("private.content.employee.modal.add_new_device", {
        views: {
          "modal@": {
            templateUrl: "views/private/content/employees/modal/add_new_device.html"
          }
        }
     })*/
  }])

  .run(['$rootScope', '$location', 'Auth', '$state', '$timeout', '$window',
    function ($rootScope, $location, Auth, $state, $timeout, $window) {
      // watch for login status changes and redirect if appropriate
      Auth.$onAuth(function (auth) {
        if (!auth && $state.current.name.startsWith('private')) {
          $state.go('public.login');
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
