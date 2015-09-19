/*
 * Copyright (C) 2015 dog.ai, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

'use strict';

angular.module('dogwebApp')
  .controller('DogsController', function ($scope, auth, Ref, $firebaseObject, lodash) {
    var profile = $firebaseObject(Ref.child('users/' + auth.uid));

    profile.$loaded().then(function () {
      $firebaseObject(Ref.child('companies/' + profile.company_id)).$loaded().then(function (company) {
        $firebaseObject(Ref.child('dogs/' + company.dog_id)).$loaded().then(function (dog) {
          lodash.extend(dog, {id: company.dog_id});
          dog.$bindTo($scope, 'dog')
        });
      });
    });
  });
