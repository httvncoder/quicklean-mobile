angular.module('app.directives', [])

.directive('wizardSteps', [function() {
	return {
		scope: {
			step: '=',
			max: '='
		},

		template: [
			'<div class="wizard-steps">',
				'<div ng-repeat-start="current in [1,2,3]" ng-class="{\'wizard-step\': true, \'wizard-step--inactive\': current > step}">',
					'<i ng-if="current <= step" class="icon ion-checkmark"></i>',
				'</div>',

				'<div ng-repeat-end ng-class="{\'wizard-line\': true, \'wizard-line--hidden\': current === max}"></div>',
			'</div>',
		].join('\n')
	};
}]);
