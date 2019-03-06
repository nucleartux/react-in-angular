import React from "react";
import ReactDOM from "react-dom";
import { fromPairs, pick, reduce } from "lodash-es";
import * as angular from "angular";

/**
 * Wraps a React component into Angular component. Returns a new Angular component.
 *
 * Usage: angular.module('some.module').component('newAngularComponent', angularInReact(MyReactComponent))
 * (the usage is the same as in similar lib https://github.com/coatue-oss/react2angular)
 */
export default function angularInReact<Props>(
  ComponentClass: React.ComponentType<Props>,
  names: (keyof Props)[] = [],
  serviceProps: string[] = []
) {
  function Ctrl($element: any, $scope: angular.IScope, $injector: any) {
    var ctrl = this;

    function wrapFn(prop: any) {
      if (typeof prop === "function") {
        return function() {
          var result = prop.apply(void 0, arguments);
          $scope.$applyAsync();
          return result;
        };
      }

      return prop;
    }

    ctrl.$onChanges = function() {
      var props = pick(this, names);

      // Wrap passed angular functions into $apply, because those functions
      // are supposed to be invoked within React
      // and we need to notify angular
      var wrappedProps = reduce(
        props as any,
        function(result, value, key) {
          return {
            ...result,
            [key]: wrapFn(value)
          };
        },
        {}
      );

      var services = serviceProps.reduce(function(result, key) {
        return {
          ...result,
          [key]: $injector.get(key)
        };
      }, {});

      ReactDOM.render(
        <ComponentClass {...wrappedProps} {...services as any} />,
        $element[0]
      );
    };

    ctrl.$onDestroy = function() {
      ReactDOM.unmountComponentAtNode($element[0]);
    };
  }
  Ctrl.$inject = ["$element", "$scope", "$injector"];

  return {
    bindings: fromPairs(
      names.map(function(name) {
        return [name, "<"];
      })
    ) as {
      [boundProperty: string]: string;
    },
    controller: Ctrl as angular.Injectable<angular.IControllerConstructor>
  };
}
