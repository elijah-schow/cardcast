angular.module('cardcast.deck', [
  'ngSanitize'
])

.controller('DeckCtrl', function($scope, $location, $routeParams, $sanitize, Service) {
  $scope.deck = [{title: 'A'}, {title: 'B'}, {title: 'C'}];
  $scope.currentCard = {};
  
});
