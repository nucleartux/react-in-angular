## Installation

```sh
# Using Yarn:
yarn add react-in-angular1 react react-dom

# Or, using NPM:
npm install react-in-angular1 react react-dom --save
```

## Usage

### 1. Create a React component

```js
import { Component } from 'react'

class MyComponent extends Component {
  render() {
    return <div>
      <p>FooBar: {this.props.fooBar}</p>
      <p>Baz: {this.props.baz}</p>
    </div>
  }
}
```

### 2. Expose it to Angular

```js
import reactInAngular from 'react-in-angular1'

angular
  .module('myModule', [])
  .component('myComponent', reactInAngular(MyComponent, ['fooBar', 'baz']))
```

### 3. Use it in your Angular 1 code

```html
<my-component
  foo-bar="3"
  baz="'baz'"
></my-component>
```

## Dependency Injection

It's easy to pass services/constants/etc. to your React component: just pass them in as the 3rd argument, and they will be available in your component's Props. For example:

```js
import { Component } from 'react'
import reactInAngular from 'react-in-angular1'

class MyComponent extends Component {
  state = {
    data: ''
  }
  componentDidMount() {
    this.props.$http.get('/path').then(res =>
      this.setState({ data: res.data })
    )
  }
  render() {
    return <div>
      { this.props.FOO }
      { this.state.data }
    </div>
  }
}

angular
  .module('myModule', [])
  .constant('FOO', 'FOO!')
  .component('myComponent', reactInAngular(MyComponent, [], ['$http', 'FOO']))
```

Note: If you have an injection that matches the name of a prop, then the value will be resolved with the injection, not the prop.