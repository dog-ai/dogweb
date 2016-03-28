/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

angular.module('dogweb')
  .factory("CompanyFactory", function ($firebaseObject) {
    return $firebaseObject.$extend({

      addTask: function (task) {
        return this.$ref().child('tasks').push(task);
      }

    });
  });