angular.module('app.directives', [])

.directive('wizardSteps', [function() {
	return {
		scope: {
			step: '=',
			max: '='
		},

		template: [
			'<div class="wizard">',
				'<div ng-repeat-start="current in [1,2,3]" ng-class="{\'wizard__step\': true, \'wizard__step--inactive\': current > step}">',
					'<i ng-if="current <= step" class="icon ion-checkmark"></i>',
				'</div>',

				'<div ng-repeat-end ng-if="current !== max" class="wizard__line"></div>',
			'</div>',
		].join('\n')
	};
}]);
