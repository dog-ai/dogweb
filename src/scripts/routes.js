/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

'use strict';

angular.module('dogweb')

  .config(['$locationProvider', '$urlRouterProvider', '$stateProvider',
    function ($locationProvider, $urlRouterProvider, $stateProvider) {

      $urlRouterProvider
        .otherwise('/');

      $stateProvider
        .state('public', {
          abstract: true,
          templateUrl: "/views/public.html"
        })
        .state('public.signup', {
          url: "/signup?to&envelope",
          views: {
            'header': {
              templateUrl: '/views/public/navigation.html'
            },
            'content': {
              templateUrl: "/views/public/signup.html",
              controller: 'SignUpController',
              resolve: {
                auth: ["Auth", '$state', '$stateParams', function (Auth, $state, $stateParams) {
                  return Auth.$waitForAuth().then(function (auth) {
                    if (auth) {
                      var stateName = $stateParams.to || 'private.content.dashboard';
                      $state.go(stateName, $stateParams);
                    }
                    return auth;
                  });
                }],
                emailAddress: ['$stateParams', '$base64', 'CompanyInvite', function ($stateParams, $base64, CompanyInvite) {
                  if ($stateParams.envelope) {
                    try {
                      var envelope = JSON.parse(decodeURIComponent(escape($base64.decode(decodeURIComponent($stateParams.envelope)))));
                      return new CompanyInvite().$load(envelope.company.id, envelope.invite.id).then(function (companyInvite) {
                        var invite = companyInvite.created_date ? companyInvite : {};
                        return invite.email_address;
                      });
                    } catch (ignored) {
                    }
                  }
                }]
              }
            }
          }
        })
        .state('public.login', {
          url: "/login?to&logout&envelope",
          views: {
            'header': {
              templateUrl: '/views/public/navigation.html'
            },
            'content': {
              templateUrl: "/views/public/login.html",
              controller: 'LogInController',
              resolve: {
                auth: ["Auth", '$state', '$stateParams', function (Auth, $state, $stateParams) {
                  return Auth.$waitForAuth().then(function (auth) {
                    if (auth) {
                      if ($stateParams.logout) {
                        $stateParams.logout = undefined;
                        Auth.$unauth();
                      } else {
                        var stateName = $stateParams.to || 'private.content.dashboard';
                        $state.go(stateName, $stateParams);
                      }
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
              return Auth.$requireAuth()
                .then(function (auth) {
                  return auth;
                })
            }]
          }
        })
        .state('private.content', {
          abstract: true,
          views: {
            'header': {
              templateUrl: '/views/private/header/navigation.html',
              controller: 'NavigationController'
            },
            'notifications@private.content': {
              templateUrl: '/views/private/header/notifications.html',
              controller: 'NotificationsController',
              resolve: {
                companyNotifications: ['company', 'CompanyNotificationList', function (company, CompanyNotificationList) {
                  return new CompanyNotificationList(company.$id);
                }]

              }
            },
            'content': {
              templateUrl: "/views/private/content.html",
            }
          },
          resolve: {
            user: ['auth', 'CompanyUser', function (auth, CompanyUser) {
              return new CompanyUser(auth.uid).$loaded();
            }],
            company: ['user', 'lodash', 'Company', function (user, lodash, Company) {
              var companyId = lodash.keys(user.companies).length > 1 ? user.primary_company : lodash.keys(user.companies)[0];
              return new Company(companyId);
            }],
            apps: ['auth', 'AppList', function (auth, AppList) {
              return new AppList();
            }]
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
        .state('private.content.company.invite', {
          url: "/invite?envelope",
          templateUrl: "/views/private/content/company/invite.html",
          controller: 'InviteController',
          resolve: {
            invite: ['$stateParams', '$base64', 'CompanyInvite', '$state', function ($stateParams, $base64, CompanyInvite, $state) {
              if ($stateParams.envelope) {
                try {
                  var envelope = JSON.parse(decodeURIComponent(escape($base64.decode(decodeURIComponent($stateParams.envelope)))));
                  return new CompanyInvite().$load(envelope.company.id, envelope.invite.id).then(function (companyInvite) {
                    var invite = companyInvite.created_date ? companyInvite : undefined;

                    if (!invite) {
                      $state.go('private.content.dashboard');
                    } else {
                      return invite;
                    }
                  });
                } catch (ignored) {
                  $state.go('private.content.dashboard');
                }
              }
            }],
            inviteCompanyUsers: ['company', 'CompanyUserList', 'invite', function (company, CompanyUserList, invite) {
              return new CompanyUserList(invite.company.id);
            }],
            inviteCompanyInvites: ['company', 'CompanyInviteList', 'invite', function (company, CompanyInviteList, invite) {
              return new CompanyInviteList(invite.company.id);
            }]
          }
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
            devices: ['company', 'CompanyDeviceList', function (company, CompanyDeviceList) {
              return new CompanyDeviceList(company.$id).$loaded();
            }]
          }
        })
        .state('private.content.company.users', {
          url: "/users",
          templateUrl: "/views/private/content/company/users.html",
          controller: 'UsersController',
          resolve: {
            companyUsers: ['company', 'CompanyUserList', function (company, CompanyUserList) {
              return new CompanyUserList(company.$id);
            }],
            companyInvites: ['company', 'CompanyInviteList', function (company, CompanyInviteList) {
              return new CompanyInviteList(company.$id);
            }]
          }
        })
        .state('private.content.company.apps', {
          url: "/apps",
          templateUrl: "/views/private/content/company/apps/apps.html",
          controller: 'AppsController',
          resolve: {
            companyApps: ['company', 'CompanyAppList', function (company, CompanyAppList) {
              return new CompanyAppList(company.$id);
            }]
          }
        })
        .state('private.content.employees', {
          url: "/employees",
          templateUrl: "/views/private/content/employees/employees.html",
          controller: 'EmployeesController',
          resolve: {
            employees: ['company', 'CompanyEmployeeList', function (company, CompanyEmployeeList) {
              return new CompanyEmployeeList(company.$id).$loaded();
            }]
          }
        })
        .state('private.content.employee', {
          url: "/employees/:id",
          templateUrl: "/views/private/content/employees/employee.html",
          controller: 'EmployeeController',
          resolve: {
            employee: ['company', '$stateParams', 'CompanyEmployee', function (company, $stateParams, CompanyEmployee) {
              return new CompanyEmployee(company.$id, $stateParams.id).$loaded();
            }],
            performance: ['$rootScope', 'Ref', '$stateParams', '$firebaseObject', 'user', 'company', function ($rootScope, Ref, $stateParams, $firebaseObject, user, company) {
              return $firebaseObject(Ref.child('company_employee_performances/' + company.$id + '/' + $stateParams.id + '/presence/_stats')).$loaded()
                .then(function (stats) {
                  return {
                    presence: {
                    'all-time': stats
                    }
                  }
                });
            }]
          }
        });
    }])
;
