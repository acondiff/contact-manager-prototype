var app = angular.module('app', [
      'ui.router',
      'ui.bootstrap',
      'ui.bootstrap.tpls',
      'ui.select',
      'ngAnimate',
      'ngMaterial',
      'templates',
      'localStorage'
]);

var moduleLoader = 'partials/module-load.html';

app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider',
	function AppConfig($stateProvider, $urlRouterProvider, $locationProvider, $futureStateProvider) {
	$stateProvider
		.state('contacts',
			{ url: '/contacts',
			templateUrl: moduleLoader })
			.state('contacts.list',
				{ url: '/list',
				controller: 'ListCtrl',
				templateUrl: 'contacts/list.html' });
	$urlRouterProvider.otherwise('/contacts/list');
}]);

app.run(['$rootScope', '$state', '$stateParams', function ($rootScope, $state, $stateParams) {
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;
}]);

app.controller('AppCtrl', ['$scope', '$rootScope', '$state', function($scope, $rootScope, $state) {
	$rootScope.contentLoaded = true;
	$scope.currentAppString = $rootScope.startLocation;
	$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
	    if (toState.name === 'contacts' ){
			$state.go('contacts.list');
	    }
	});
	$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
	    $scope.currentAppString = toState.name.split(".")[0];
	});
	$rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams) {
	    $scope.currentAppString = toState.name.split(".")[0];
	});
	$rootScope.updateCurrentContacts = function(i) {
		$rootScope.currentContacts = $rootScope.contactss[i];
	};
}]);
