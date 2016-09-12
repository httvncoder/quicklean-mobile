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
}]);
