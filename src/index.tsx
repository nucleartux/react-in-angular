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
  class Ctrl {
    static $inject = ["$element", "$scope", "$injector"];

    constructor(
      private $element: any,
      private $scope: angular.IScope,
      private $injector: any
    ) {}

    wrapFn = (prop: any) => {
      if (typeof prop === "function") {
        return (...args: any[]) => {
          const result = prop(...args);
          this.$scope.$applyAsync();
          return result;
        };
      }

      return prop;
    };

    $onChanges() {
      const props = pick(this, names);

      // Wrap passed angular functions into $apply, because those functions
      // are supposed to be invoked within React
      // and we need to notify angular
      const wrappedProps = reduce(
        props as any,
        (result, value, key) => {
          return {
            ...result,
            [key]: this.wrapFn(value)
          };
        },
        {}
      );

      const services = serviceProps.reduce((result, key) => {
        return {
          ...result,
          [key]: this.$injector.get(key)
        };
      }, {});

      ReactDOM.render(
        <ComponentClass {...wrappedProps} {...services as any} />,
        this.$element[0]
      );
    }

    $onDestroy() {
      ReactDOM.unmountComponentAtNode(this.$element[0]);
    }
  }

  return {
    bindings: fromPairs(names.map(name => [name, "<"])) as {[boundProperty: string]: string},
    controller: Ctrl as angular.Injectable<angular.IControllerConstructor>
  };
}
