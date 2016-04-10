/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

'use strict';

angular.module('dogweb')
  .controller('DogController', function ($scope, dog, $uibModal) {
    $scope.dog = dog;

    $scope.openEditDogModal = function () {
      $uibModal.open({
        animation: true,
        templateUrl: '/views/private/content/company/dog/modal/edit-dog.html',
        controller: 'EditDogModalController',
        size: 'sm',
        resolve: {
          dog: dog
        }
      }).result.finally(function () {

      });
    };
  })

  .controller('EditDogModalController', function ($scope, dog, $uibModalInstance) {
    $scope.dog = dog;

    $scope.save = function () {

      return dog.$save()
        .then($uibModalInstance.close);
    }
  })

;
