---
title: hook异步更新问题
date: 2020-08-03 19:27:50
tags: Hook, async
categories: [React, React-Hook]
---


在最近的工作中，初次尝试使用hook写一个完整的组件。果然第一次就遇到了问题。

# 需求

这里我们先不要管代码写的逻辑问题。我们需要一个下拉组件，用户可以多选，可以清空。每次修改的时候都会去判断是否为空，如果为空的话给出警告（非常简单）

# 编码

```js

import React, { useState } from 'react';
import { fromJS } from 'immutable';
import { Select } from 'antd';

const { Option } = Select;

function HooksAsync() {

  const foodList = ['苹果', '梨', '米饭', '面条', '牛肉', '牛奶'];

  const initCheckedFoods = {
    count: 0,
    value: [],
    error: ''
  };

  const [foods, setFoods] = useState(fromJS(initCheckedFoods));

  const handleChange = (value) => {
    setFoods(foods
      .set('value', fromJS(value))
      .set('count', value.length)
    );
    
    if (value.length === 0) {
      setFoods(foods.set('error', '不能为空'))
    }
  };

  return (
    <>
      <div>
        异常：{foods.error}
      </div>
      <Select
        allowClear
        mode="multiple"
        style={{width: 500}}
        placeholder="请选择食物"
        value={foods.get('value').toJS()}
        onChange={handleChange}
      >
        {
          foodList.map((food) => (
            <Option
              key={food}
              value={food}
            >
              {food}
            </Option>
          ))
        }
      </Select>
    </>
  );
}

export default HooksAsync;

```

# bug出现

![点击清空和删除至最后一个无效](/assets/hook异步更新问题/foods.gif)
当我们点击清除按钮以及删除至最后一个触发错误提示逻辑的时候，并没有把选择项清除掉。也没有出来我们期望的错误提示。

# bug定位

经过摸爬滚打的排查。发现是因为hook和setState一样，更新操作是异步的。以上bug可以还原为这样子。

```js
const handleChange = (value) => {
  const currentFoods = foods;

  // 修改currentFoods的value和count属性，返回新值赋值给foods 
  setFoods(currentFoods
    .set('value', fromJS(value))
    .set('count', value.length)
  );
  // 这里拿到的还是currentFoods，而不是新的foods。immutablejs修改之后，会返回新的对象，原来的还是原来的。
  // 所以这里的currentFoods并没有value和count的改变。
  // 修改currentFoods的error属性，返回新值赋值给foods 
  if (value.length === 0) {
    setFoods(currentFoods.set('error', '不能为空'))
  }
};
```

可以看到，其实我们只是把修改了`error`的新值赋值给了`foods`而已。第一个`setFoods`完全被忽略了。

# 怎么解决

+ 使用函数做参数，和setState一样

```js
if (value.length === 0) {
  setFoods((foods) => foods.set('error', '不能为空'))
}
```

+ useRef

```js
const [foods, setFoods] = useState(fromJS(initCheckedFoods));

const foodRef = useRef(foods);

const handleChange = (value) => {
  setFoods(foodRef.current
    .set('value', fromJS(value))
    .set('count', value.length)
  );
  
  if (value.length === 0) {
    setFoods(foodRef.current.set('error', '不能为空'))
  }
};
```

# 总结

和 `setState` 一样，其实hook更新数据也是异步的。这个其实在react常用的人手上是不会出这个问题的。奈何我一个新手还是去淌了一遍。。