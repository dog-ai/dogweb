/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

'use strict';

angular.module('dogweb')
  .controller('EmployeeController', function ($scope, user, company, employee, performance, Ref, $firebaseObject, $firebaseArray, lodash) {

    $scope.employee = employee;
    $scope.presences = [];

    $scope.daterange = { startDate: moment().startOf('day'), endDate: moment().endOf('day') };
    $scope.ranges = {
      'Today': [ moment(), moment() ],
      'Yesterday': [ moment().subtract(1, 'days'), moment().subtract(1, 'days') ],
      'This Week': [ moment().startOf('week'), moment().endOf('week') ],
      'Last Week': [ moment().subtract(1, 'week').startOf('week'), moment().subtract(1, 'week').endOf('week') ],
      'This Month': [ moment().startOf('month'), moment().endOf('month') ],
      'Last Month': [ moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month') ]
    };

    $scope.$watch('daterange', function (daterange) {
      $scope.selectDaterange(daterange);
    });

    $scope.selectDaterange = function (daterange) {
      if (daterange === undefined || daterange === null || daterange.startDate === null) {
        return
      }
      var startDate = moment(daterange.startDate);
      var endDate = moment(daterange.endDate);

      // clear presences
      if ($scope.presences.length > 0) {
        $scope.presences = [];
      }

      if (endDate.diff(startDate, 'days') < 1) {
        $scope.tickValues = [
          startDate.clone().startOf('day').toDate(),
          startDate.clone().startOf('day').add(4, 'hour').toDate(),
          startDate.clone().startOf('day').add(8, 'hour').toDate(),
          startDate.clone().startOf('day').add(12, 'hour').toDate(),
          startDate.clone().startOf('day').add(16, 'hour').toDate(),
          startDate.clone().startOf('day').add(20, 'hour').toDate(),
          endDate.clone().endOf('day').toDate() ];
      } else {
        $scope.tickValues = [];

        var date = startDate.clone();

        while (date.isSame(startDate) || date.isAfter(startDate) && date.isBefore(endDate) || date.isSame(endDate)) {
          $scope.tickValues.push(date.clone().startOf('day').toDate());
          date = date.clone().add(1, 'day');
        }
      }


      var date = startDate.clone();

      while (date.isSame(startDate) || date.isAfter(startDate) && date.isBefore(endDate) || date.isSame(endDate)) {

        $firebaseArray(Ref.child('company_employee_performances/' + company.$id + '/' + employee.$id + '/presence/' + date.format('YYYY/MM/DD'))).$loaded().then(function (presences) {

          if (presences.length > 0) {

            for (var i = 0; i < presences.length; i++) {
              if (presences[ i ].$id.indexOf('_') == 0) {
                break;
              }

              presences[ i ].created_date = moment(presences[ i ].created_date * 1000);

              // prettify start of day by placing an opposite presence
              if (i == 0) {
                $scope.presences.push({
                  _first: true,
                  created_date: moment(presences[ i ].created_date).startOf('day'),
                  is_present: !presences[ i ].is_present
                });
              }

              if (!lodash.some($scope.presences, { $id: presences[ i ].$id })) {
                $scope.presences.push(presences[ i ]);
              }

              if ((i == (presences.length - 1)) && presences[ i ].is_present && !moment(presences[ i ].created_date).isSame(moment(), 'day')) {
                $scope.presences.push({
                  created_date: moment(presences[ i ].created_date).endOf('day'),
                  is_present: false
                });
              }
            }

            if (startDate.isSame(moment().startOf('day')) && $scope.presences[ $scope.presences.length - 1 ]._last === undefined) {

              var presence = $scope.presences[ $scope.presences.length - 1 ];
              if (presence.is_present) {

                if (employee.is_present) {
                  $scope.presences.push({
                    _last: true,
                    created_date: moment(),
                    is_present: false
                  });
                } else {
                  $scope.presences.push({
                    _last: true,
                    created_date: moment(employee.updated_date),
                    is_present: false
                  });
                }

              }

            }

            // estimate presence data
            for (i = 0; i < $scope.presences.length; i++) {
              if (i === 0 && !$scope.presences[ i ]._first && !$scope.presences[ i ]._last) {
                $scope.presences[ i ].duration = true;
              } else if (!$scope.presences[ i ]._first && !$scope.presences[ i ]._last) {
                if (i + 1 < $scope.presences.length && !$scope.presences[ i ].is_present && moment($scope.presences[ i + 1 ].created_date).diff(moment($scope.presences[ i ].created_date), 'minute') < 90) {
                  $scope.presences[ i ].duration = true;

                } else {
                  $scope.presences[ i ].duration = false;

                }

              }

              if (i + 1 === $scope.presences.length) {
                $scope.presences[ i ].duration = false;
              }
            }

          }

        });

        date = date.clone().add(1, 'day');
      }

      console.log($scope.presences)
    };

    $scope.formatTick = function (tick) {
      var startDate = moment($scope.daterange.startDate);
      var endDate = moment($scope.daterange.endDate);

      if (endDate.diff(startDate, 'days') < 1) {
        return moment(tick).format('HH:mm');

      } else if (endDate.diff(startDate, 'weeks') < 1) {
        return moment(tick).format('dddd');
      } else {
        return moment(tick).format('D');
      }

    };

    $scope.formatTooltipValue = function (data) {
      // omit tooltip value
    };

    $scope.formatTooltipTitle = function (data) {
      return moment(data).format('dddd [at] H:mm');
    };

    $scope.heatmap = {
      start: moment().startOf('month'),
      minDate: moment().subtract(Math.floor(moment().endOf('month').diff(moment(performance.presence[ 'all-time' ].period_start_date), 'months', true)), 'month').startOf('month'),
      maxDate: moment().endOf('month'),
      legend: [ 2, 4, 6, 8, 10 ],
      onClick: function (date, value) {
        $scope.daterange = {
          startDate: moment(date).startOf('day'),
          endDate: moment(date).endOf('day')
        };
        $scope.selectDaterange($scope.daterange);
      },
      onComplete: function () {
      },
      afterLoadData: function (data) {

        angular.forEach(data, function (value, key) {
          if (value > 24) {
            data[ key ] = Math.round(moment.duration(value, 'seconds').asHours() * 10) / 10;
          }
        });

        return data;
      },
      onMinDomainReached: function (reached) {
      },
      onMaxDomainReached: function (reached) {
      }
    };

    $scope.heatmap.range = 1;
    $scope.heatmap.data = {};

    var date = moment(performance.presence[ 'all-time' ].period_start_date);
    while (date.isBefore(moment(), 'month') || date.isSame(moment(), 'month')) {

      $firebaseObject(Ref.child('company_employee_performances/' + company.$id + '/' + employee.$id + '/presence/' + date.format('YYYY/MM') + '/_stats')).$loaded().then(function (_stats) {
        lodash.extend($scope.heatmap.data, _stats.total_duration_by_day);
      });

      date = date.clone().add(1, 'month');
    }

  })
;
