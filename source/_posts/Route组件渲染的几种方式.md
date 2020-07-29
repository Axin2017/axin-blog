---
title: Route组件渲染的几种方式
date: 2020-07-28 16:51:40
tags: Route-Render
categories: [React, React-Router]
---



`<Route>` 组件是 `React-Router` 提供的用于当路由匹配上之后渲染用户组件的一个组件

# <Route> 渲染组件的方式

## component

比较容易理解，直接传递一个组件。官网示例:

``` js
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route } from "react-router-dom";

// All route props (match, location and history) are available to User
function User(props) {
  return <h1>Hello {props.match.params.username}!</h1>;
}

ReactDOM.render(
  <Router>
    <Route path="/user/:username" component={User} />
  </Router>,
  node
);
```

<div class="danger-block">

不要尝试用内联方法的方式赋值给 `component` 属性，如以下示例所示：

```js
<Route path="/user/:username" component={() => <User />)} />
```

这样会导致每次重新渲染的时候都是一个新的 `User` 组件
</div>


## render function

在某些情况下，我们可能希望能经过一些计算来在一个路由上显示不同的组件。如下所示：

```js
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route } from "react-router-dom";

const day = 1;

// convenient inline rendering
ReactDOM.render(
  <Router>
    <Route path="/home" render={(props) => {
      if(day === 1) {
        return <Monday />
      } else {
        return <NotMonday />
      }
    }} />
  </Router>,
  node
);
```

<div class="tip-block">

+ 与将内联方法传递给 `component` 属性不同，使用此方式，不会造成组件的重复渲染
+ `props` 参数为 `{ match, location, history }`
</div>

<div class="warn-block">

`component` 属性的优先级要高于 `render` 。避免将两个属性同时使用在一个路由组件上。
</div>

## children function

`children function` 与 `render function` 的使用方式一样。不同的地方在于，当路由匹配失败后，`match` 参数会是 `null` 。
我们可以根据这个特性来做一些事情。

官网代码示例，这里在匹配上的时候，增加了一个class：

```js
import React from "react";
import ReactDOM from "react-dom";
import {
  BrowserRouter as Router,
  Link,
  Route
} from "react-router-dom";

function ListItemLink({ to, ...rest }) {
  return (
    <Route
      path={to}
      children={({ match }) => (
        <li className={match ? "active" : ""}>
          <Link to={to} {...rest} />
        </li>
      )}
    />
  );
}

ReactDOM.render(
  <Router>
    <ul>
      <ListItemLink to="/somewhere" />
      <ListItemLink to="/somewhere-else" />
    </ul>
  </Router>,
  node
);
```

<div class="danger-block">

`children` 属性的优先级要高于 `render` 和 `component` 。避免将多个属性同时使用在一个路由组件上。
</div>