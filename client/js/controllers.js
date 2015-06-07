'use strict';

/* Controllers */

angular.module('circuit.virtual.receptionist')
.controller ('InitCtrl',['$scope', function ($scope){

    if (typeof Circuit === 'undefined') {
        $scope.error = 'sdk.js missing. Include it from https://circuitsandbox.net/sdk.js';
    }

    if (!Circuit.isCompatible()) {
        $scope.error = 'Sorry, your browser is not supported. Chrome works :)';
    }

    //console.debug('Registration State= ' + Circuit.RegistrationState);


}]);

angular.module('circuit.virtual.receptionist')
.controller('LoginCtrl',
['$rootScope', '$scope', '$location', '$sce', function($rootScope, $scope, $location, $sce) {

    $scope.domain = 'circuitsandbox.net';
    $scope.localUser = null;
    $scope.email = 'graciela.zaera@unify.com';
    $scope.password = '';
    $scope.registrationState = Circuit.RegistrationState.Disconnected;
    var _isInitialized = false;

    $scope.conversations = [];
   // $scope.items = [];



    Circuit.addEventListener('registrationStateChange', function (evt) {
        $scope.$apply(function () {
          $scope.registrationState = evt.state;
          if (evt.state === Circuit.RegistrationState.Disconnected || evt.state === Circuit.RegistrationState.Terminated) {
            $scope.logout();
          }
        });
    });

    $scope.login = function () {
        Circuit.logon($scope.email, $scope.password, $scope.domain).then(function (user) {
              $scope.localUser = user;
              setupEventListeners(user);
            }).then(function () {
              $scope.$apply();
            }).catch(function(err) {
              if (err) { return alert('Error: ' + err.message); }
        });
     }

    $scope.logout = function () {
      $scope.localUser && $scope.localUser.logout();
      $scope.localUser = null;

      $scope.email = 'graciela.zaera@unify.com';
      $scope.password = '';
      $scope.registrationState = Circuit.RegistrationState.Disconnected;

    }


    function setupEventListeners(user) {

        user.addEventListener('conversationCreated', function (evt) {
          $scope.$apply(function () {
            $scope.conversations = $scope.localUser.getCachedConversations();
            $scope.selectedConv = $scope.conversations[0];
          });
        });
    }



}]);


angular.module('circuit.virtual.receptionist')
.controller('ConvCtrl', ['$rootScope', '$scope', function($rootScope, $scope) {

  $scope.users = [];
  $scope.selectedUsers = [];
  $scope.contactEmail = null;
  $scope.message = "Your visitor has arrived!";
  $scope.notified = false;

  //var $fileToUpload = document.getElementById('fileToUpload');

  $scope.reload = function() {
    $scope.notified = false;
    $scope.users = [];
    $scope.selectedUsers = [];
    $scope.visitorname = "";
    $scope.companyname = "";
    $scope.query = "";
  };



  $scope.send = function () {
    $scope.prepareToSend = true;
    
    $scope.message = "Your visitor has arrived! #" + $scope.visitorname + "# from the company #" + $scope.companyname + "# is waiting for you at the reception.";

    var msg = $scope.message;
    if ($scope.files && $scope.files.length > 0) {
      msg = {text: $scope.message, files: $scope.files};
    }
    $scope.selectedConv.sendMessage(msg, function (err, item) {
      $scope.prepareToSend = false;
      if (err) { return alert('Unable to send message. Error: ' + err); }
      $scope.sendingItem = item;
      //console.log('Message: #' + $scope.message + '# has been sent to conversation: ' + JSON.stringify($scope.selectedConv));
      console.log('Message: #' + $scope.message + '# has been sent to conversation: ' + $scope.selectedConv.convId);
      $scope.notified = true;
      $scope.message = null;
       $scope.selectedUsers = [];
      //$fileToUpload.value = '';
      console.log('Contact notified? = ' + $scope.notified);
    });


  }

  
  function startConversation() {

        var type = $scope.selectedUsers.length === 1 ? 'DIRECT' : 'GROUP';

        if (type == 'DIRECT') {
          console.log('Direct conversation, only one user selected');
          var contact = $scope.selectedUsers[0].emailAddress;
          console.log(contact);

          $scope.contactEmail = contact;
          
          $scope.localUser.getConversation(contact, function (err, conv) {
             if (err) { 
                $scope.localUser.createConversation(type, members, options, function (err, conv) {
                if (err) { return alert('Unable to create conversation. Error: ' + err); }
                $scope.$apply(function () {
                  $scope.conversations = $scope.localUser.getCachedConversations();
                  $scope.selectedConv = $scope.conversations[0];
                  });
                });
              }
              else {
                  //console.log('Conversation found: '+ JSON.stringify(conv) + ' with contact: ' + contact);
                  console.log('Conversation found: '+ conv.convId + ' with contact: ' + contact);
                  $scope.selectedConv = conv;
              }

          });

        } else {
          console.log('Group conversation, serveral users selected');
          var members = $scope.selectedUsers.map(function (m) { return m.userId; });
          var options = {title: $scope.title};
          $scope.localUser.createConversation(type, members, options, function (err, conv) {
            if (err) { return alert('Unable to create conversation. Error: ' + err); }
            $scope.$apply(function () {
              $scope.conversations = $scope.localUser.getCachedConversations();
              $scope.selectedConv = $scope.conversations[0];
            });
          });
        }
    }


  $scope.getConvName = function (conv) {
    if (!conv) { return ''; }
    return conv.title || conv.participantFirstNames || conv.participants[0].displayName;
  }

  $scope.getConvId = function (conv) {
    if (!conv) { return ''; }
    return conv.convId;
  }

   $scope.search = function (query, event) {
    if (!query) {
      $scope.users = [];
      return;
    }
    $scope.localUser.startUserSearch(query, function () {
      $scope.$apply(function () {
        $scope.users = $scope.localUser.getUserSearchResults();
      });
    });
  }

  $scope.connect2User = function (user) {

    selectUser(user, function() {
      startConversation();
    });
  }

  function selectUser (user, callback) {
    if ($scope.selectedUsers.indexOf(user) === -1) {
      $scope.selectedUsers.unshift(user);
    }
    if ($scope.selectedUsers.length < 2) {
      $scope.title = null;

      var contact = $scope.selectedUsers[0].emailAddress;
      console.log("User selected: "+ contact);
      //$scope.$apply(function() {
        $scope.contactEmail = contact;
      //});
      callback();

    }
  }

  $scope.deselectUser = function (user) {
    $scope.selectedUsers.remove(user);
  }


}]);