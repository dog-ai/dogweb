/*
 * Copyright (C) 2016, Hugo Freire <hugo@dog.ai>. All rights reserved.
 */

angular.module('dogweb')
  .factory("CompanyUserListFactory", function ($firebaseArray, User, lodash) {
    return function (companyId, companyUsersRef) {
      return $firebaseArray.$extend({

        addUser: function (user) {
          // Firebase.ServerValue.TIMESTAMP will push the new user to the end of the list
          return companyUsersRef.child(user.$id).setWithPriority(true, Firebase.ServerValue.TIMESTAMP);
        },
        
        $$added: function (snapshot) {
          return new User(snapshot.key());
        },

        getSize: function () {
          return this.$list.length;
        },

        removeUser: function (userId) {
          return companyUsersRef.child(userId).remove();
        }

      })(companyUsersRef);
    }
  });