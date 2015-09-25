/*
 * Copyright (C) 2015 dog.ai, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

'use strict';

/**
 * @ngdoc function
 * @name dogwebApp.controller:EmployeesCtrl
 * @description
 * # EmployeesCtrl
 * Controller of the dogwebApp
 */
angular.module('dogwebApp')
  .controller('EmployeeController', function ($scope, user, company, employee, Ref, $firebaseObject, $firebaseArray, lodash) {

    $scope.employee = employee;

    $scope.daterange = {startDate: moment().startOf('day').toDate(), endDate: moment().endOf('day').toDate()};
    $scope.ranges = {
      'Today': [moment(), moment()],
      'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
      'Last 7 Days': [moment().subtract(6, 'days'), moment()],
      'Last 30 Days': [moment().subtract(29, 'days'), moment()],
      'This Month': [moment().startOf('month'), moment().endOf('month')],
      'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
    };

    $scope.$watch('daterange', function (daterange) {

      if (daterange === undefined || daterange === null || daterange.startDate === null) {
        return
      }

      var date = moment(daterange.startDate);

      $firebaseArray(Ref.child('employee_performances/' + employee.$id + '/presence/' + date.format('YYYY/MM/DD'))).$loaded().then(function (presences) {

        if (presences.length > 0) {
          angular.forEach(presences, function (presence) {
            presence.created_date = moment(presence.created_date);
          });

          var presence = presences[0];
          if (presence.is_present) {
            presences = [{
              created_date: presence.created_date,
              is_present: !presence.is_present
            }].concat(presences);
          }

          presence = presences[presences.length - 1];
          if (presence.is_present) {
            presences.push({
              created_date: moment(),
              is_present: !presence.is_present
            });

          }
        }

        c3.generate({
          bindto: '#presence',
          size: {
            width: 400,
            height: 150
          },
          padding: {
            left: 15,
            right: 15
          },
          data: {
            json: presences,
            keys: {
              x: 'created_date',
              value: ['is_present'],
            },
            types: {
              is_present: 'area-step',
            }
          },
          axis: {
            x: {
              min: date.clone().startOf('day'),
              max: date.clone().endOf('day'),
              type: 'timeseries',
              tick: {
                format: function (tick) {
                  return moment(tick).format('HH:mm');
                },
                fit: false,
                outer: true
              }
            },
            y: {
              show: false
            }
          },
          line: {
            step: {
              type: 'step-after'
            }
          }
        });
      });

    });

  })
;
