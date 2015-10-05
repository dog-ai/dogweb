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
    $scope.presences = [];

    $scope.daterange = {startDate: moment().startOf('day'), endDate: moment().endOf('day')};
    $scope.ranges = {
      'Today': [moment(), moment()],
      'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
      'This Week': [moment().startOf('week'), moment().endOf('week')],
      'Last Week': [moment().subtract(1, 'week').startOf('week'), moment().subtract(1, 'week').endOf('week')],
      'This Month': [moment().startOf('month'), moment().endOf('month')],
      'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
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
      var date = startDate.clone();

      while (date.isSame(startDate) || date.isAfter(startDate) && date.isBefore(endDate) || date.isSame(endDate)) {
        $firebaseArray(Ref.child('employee_performances/' + employee.$id + '/presence/' + date.format('YYYY/MM/DD'))).$loaded().then(function (presences) {
          if (presences.length > 0) {

            angular.forEach(presences, function (presence) {
              if (presence.$id.indexOf('_') == 0) {
                return;
              }
              presence.created_date = moment(presence.created_date);
              if (!lodash.some($scope.presences, {$id: presence.$id})) {
                $scope.presences.push(presence);
              }
            });

            if (startDate.isSame(moment().startOf('day')) && $scope.presences[$scope.presences.length - 1]._last === undefined) {

              var presence = $scope.presences[presences.length - 1];
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
          }

        });

        date = date.clone().add(1, 'day');
      }
    };

    $scope.formatTick = function (tick) {
      return moment(tick).format('HH:mm');
    };

    $scope.heatmap = {
      start: moment().subtract(1, 'month').startOf('month'),
      minDate: moment().subtract(1, 'month').startOf('month'),
      maxDate: moment().endOf('month'),
      legend: [2, 4, 6, 8, 10],
      onClick: function (date, value) {
        $scope.daterange = {startDate: moment(date).startOf('day'), endDate: moment(date).endOf('day')};
        $scope.selectDaterange($scope.daterange);
      },
      onComplete: function () {
      },
      afterLoadData: function (data) {

        angular.forEach(data, function (value, key) {
          data[key] = Math.round(moment.duration(value, 'seconds').asHours() * 10) / 10;
        });

        return data;
      },
      onMinDomainReached: function (reached) {
      },
      onMaxDomainReached: function (reached) {
      }
    };

    $firebaseObject(Ref.child('employee_performances/' + employee.$id + '/presence/' + $scope.daterange.startDate.format('YYYY/MM') + '/_stats')).$loaded().then(function (_stats) {
      $scope.heatmap.data = _stats._total_duration_by_day;

    });

  })
;
