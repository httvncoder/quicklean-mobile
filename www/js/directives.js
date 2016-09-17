angular.module('app.directives', [])

.directive('wizardSteps', [function() {
	return {
		scope: {
			step: '=',
			max: '='
		},

		template: [
			'<div class="wizard">',
				'<div ng-repeat-start="current in range" ng-class="{\'wizard__step\': true, \'wizard__step--inactive\': current > step}">',
					'<i ng-if="current <= step" class="icon ion-checkmark"></i>',
				'</div>',

				'<div ng-repeat-end ng-if="current !== max" class="wizard__line"></div>',
			'</div>',
		].join('\n'),

    controller: ['$scope', function($scope) {
      // Generates an array (with size of (max - step))
      // starting from 1 to max
      $scope.range = (function() {
        var stack = [];

        for ( var i = 1; i <= $scope.max; i++ ) {
          stack.push(i);
        }

        return stack;
      })();
    }]
	};
}])

.directive('infoModal', [function() {
  return {
    scope: {
      template: '@'
    },

    template: [
      '<button class="button button-clear button-dark button-small" ng-click="modal.show()">',
        '<i class="icon ion-information-circled"></i>',
      '</button>'
    ].join('\n'),

    controller: ['$scope', '$ionicModal', function($scope, $ionicModal) {
      $scope.modal = null;

      $ionicModal.fromTemplateUrl('templates/' + $scope.template, {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modal = modal;
      })
    }]
  }
}]);
