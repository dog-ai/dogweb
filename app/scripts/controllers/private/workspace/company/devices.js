/*
 * Copyright (C) 2015 dog.ai, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

'use strict';

/**
 * @ngdoc function
 * @name dogwebApp.controller:DevicesCtrl
 * @description
 * # DevicesCtrl
 * Controller of the dogwebApp
 */
angular.module('dogwebApp')

  .controller('DevicesController', function ($scope, user, company, devices, mac_addresses, Ref, $firebaseObject) {

    $scope.devices = [];
    $scope.mac_addresses = [];

    angular.forEach(devices, function (device) {
      $firebaseObject(Ref.child('devices/' + device.$id)).$loaded().then(function (device) {
        $scope.devices.push(device);
      });
    });

    angular.forEach(mac_addresses, function (mac_address) {
      _retrieveMacAddress(mac_address.$id).then(function (mac_address) {
        if (mac_address.device_id === undefined) {
          $scope.mac_addresses.push(mac_address);
        }
      });
    });

    function _retrieveMacAddress(macAddressId) {
      return $firebaseObject(Ref.child('mac_addresses/' + macAddressId)).$loaded().then(function (mac_address) {
        return mac_address;
      });
    }

  });
