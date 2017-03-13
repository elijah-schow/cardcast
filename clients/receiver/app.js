angular.module('cardcast-receiver', [
  'ngSanitize'
])
.controller('MainController', function($scope, $sanitize, Markdown) {

  $scope.text = '<h2>Welcome to CardCast!</h2><br/>Nothing has been casted yet...';
  var isAlreadyCasting = false;

  var initialize = function() {
    cast.receiver.logger.setLevelValue(0);
    window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
    console.log('Starting the Receiver Manager');

    //on ready event
    castReceiverManager.onReady = function(event) {
      console.log('Recieved Ready event: ' + JSON.stringify(event.data));
      castReceiverManager.setApplicationState('Application status is ready...');
    };

    //handler for sender connected event
    castReceiverManager.onSenderConnected = function(event) {
      console.log('Received Sender Connected event: ' + event.data);
      console.log(castReceiverManager.getSender(event.data).userAgent);
    };

    //handler for sender disconnect, check if anyone is still connected and close if not
    castReceiverManager.onSenderDisconnected = function(event) {
      console.log('Received Sender Disconnect event: ' + event.data);
      if (castReceiverManager.getSenders().length === 0) {
        window.close();
      }
    };

    //create message bus for controller
    window.messageBus = castReceiverManager.getCastMessageBus('urn:x-cast:pegatech.card.cast');

    //handler for castMessageBus event
    messageBus.onMessage = function(event) {
      //set the event.data to $scope.text so it can be used by the view

      //if there is not currently a cast going on, sanitize the markdown and set the 
      //text to display to the result

      if (!isAlreadyCasting){
        $scope.text = $sanitize(Markdown.compile(event.data));
        console.log('Message [' + event.senderId + ']: ' + event.data);
        castReceiverManager.setApplicationState(event.data);
      }

      //now set the application state to 'isAlreadyCasting' since the session state
      //can be accessed by the main controller. also set isAlreadyCasting to true
      castReceiverManager.setApplicationState('isAlreadyCasting');
      isAlreadyCasting = true;

      

      //inform all senders on messagebus of incoming message
      //this invokes the senders messageListener function
        messageBus.send(event.senderId, event.data);
        $scope.$apply();
    };

    // start the receiver
    castReceiverManager.start({statusText: 'Application is starting'});
    console.log('Receiver Manager started');
  };

  if (!cast.receiver) {
    setTimeout(initialize, 1000);
  } else {
    initialize();
  }
})
.factory('Markdown', function() {
  var compile = function(text) {
    return marked(text);
  };
  return {
    compile: compile
  };
});
