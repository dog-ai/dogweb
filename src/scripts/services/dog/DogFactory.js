/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

angular.module('dogweb')
  .factory("DogFactory", function ($firebaseObject, moment) {
    return $firebaseObject.$extend({

      $save: function () {
        this.updated_date = moment().format();

        return $firebaseObject.prototype.$save.apply(this, arguments);
      }
    });
  });