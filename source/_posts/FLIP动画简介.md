---
title: FLIP动画简介
date: 2020-08-24 20:03:56
tags: FLIP
categories: animation
toc: true
---

# 今天的目标

![flip-demo](/assets/FLIP动画简介/flip-demo.gif)

# FLIP简介

`FLIP` 是将一些开销高昂的动画，如针对 `width`，`height`，`left` 或 `top` 的动画，映射为 `transform` 动画。通过记录元素的两个快照，一个是元素的初始位置（First - `F`），另一个是元素的最终位置（Last - `L`），然后对元素使用一个 transform 变换来反转（Invert - `I`），让元素看起来还在初始位置，最后移除元素上的 transform 使元素由初始位置运动（Play - `P`）到最终位置。

所以 FLIP 来源于 `F`irst，`L`ast，`I`nvert，`P`lay

+ `F`: `first`, 元素的初始状态
+ `L`: `last`, 元素的结束状态
+ `I`: `invert`, 倒置，把始末的状态导致过来
+ `P`: `play`, 播放动画

# 需理解的前提知识

## 浏览器的事件执行顺序

![event-loop](/assets/FLIP动画简介/event-loop.png)

### 三个小例子

一次宏任务执行完毕之后,浏览器才会渲染
```js
document.body.style = 'background:black';
document.body.style = 'background:red';
document.body.style = 'background:blue';
document.body.style = 'background:grey';
```

宏任务-->渲染-->宏任务
```js
document.body.style = 'background:blue';
setTimeout(function(){
    document.body.style = 'background:black'
},0)
```

宏任务-->微任务-->渲染
```js
document.body.style = 'background:blue';
Promise.resolve().then(() => {
  document.body.style = 'background:black'
})
```

## getBoundingClientRect

[Element.getBoundingClientRect()](https://developer.mozilla.org/zh-CN/docs/Web/API/Element/getBoundingClientRect)  方法返回元素的大小及其相对于视口的位置。

<div class="block tip-block">

这个api的可以在浏览器渲染前就计算元素所处的最新位置信息
</div>

## 为什么使用`tranform`, `opacity` 等属性做动画会比直接改变`Left`,`top`等属性做动画更好

为了生成流畅的动画，你需要让浏览器尽可能少地工作，最好的办法就是充分利用 GPU，并避免动画过程中触发页面重排或重绘。目前 Chrome，Firefox，Safari，Opera 和 IE11 都对 `transform`（`translate`，`rotate` 和 `scale`） 和 `opacity` 进行硬件加速。所以我们应该尽量使用 `transform` 和 `opacity` 属性来实现我们的动画.

# 伪代码

```js
// 获取初始位置
var first = el.getBoundingClientRect();

// 让元素在最终位置上.可以通过直接设置class,改变兄弟元素等等方式都行
el.classList.add('class-end');

// 获取最终位置
var last = el.getBoundingClientRect();

// 计算反转
var invert = first.top - last.top;

// 反转
el.style.transform = 'translateY(' + invert + 'px)';

// 播放
setTimeout(function() { 
  // 添加动画相关的设置
  el.classList.add('animate-on-transforms');
  // 开始动画
  el.style.transform = ''; 
}, 0);

// 结束时清理
el.addEventListener('transitionend', () => {
  el.classList.remove('animate-on-transforms');
  // ...
});
```

# 实现

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>flip-animation-demo</title>
  <style>
    .container {
      display: flex;
      flex-wrap: wrap;
    }

    img {
      display: inline-block;
      width: 110px;
      height: 110px;
      margin: 5px;
    }
  </style>
</head>

<body>
  <div id="container"></div>

  <script>
    function insert(count) {
      const allImgs = container.querySelectorAll('img');

      allImgs.forEach(img => {
        // 先记录下原始位置 FIRST
        const { left, top } = img.getBoundingClientRect();
        img._top = top;
        img._left = left;
      })

      count = count || 1;
      for (let i = 0; i < count; i++) {
        const img = document.createElement('img');
        const random = Math.floor(Math.random() * 9) + 1;
        img.src = `./images/${random}.jpeg`;
        container.insertBefore(img, container.firstChild);
        
        // 绑定事件，动画结束之后清空transition和transform
        img.addEventListener('transitionend', () => {
          img.style.transition = '';
          img.style.transform = '';
        });
      }


      allImgs.forEach(img => {
        // 得到现在的位置 Last
        const { left, top } = img.getBoundingClientRect();
        // 倒置 Invert
        const top_distance = img._top - top;
        const left_distance = img._left - left;
        img.style.transform = `translate(${left_distance}px, ${top_distance}px)`;
        // Play
        setTimeout(() => {
          img.style.transition = 'all .5s';
          img.style.transform = 'none';
        }, 0);
      });
    }

    // setInterval(insert, 2000)

  </script>

</body>

</html>
```

<div class="block tip-block">

图片资源请自行寻找.本例子是选了9张图片分别命名为`1-9.jpeg`,放在与html同级目录下的`images`文件夹中
</div>

# FAQ

## FLIP 适合用在什么地方

+ 两个状态的过度
+ 元素增加,移除
+ 展开,收缩
+ 打乱顺序/重新排列

## 为什么要用倒置,而不是通过加transform直接从开始到结束

+ 很难知道结束的位置,步骤繁琐,难以理解
+ 从开始到结束的时候,浏览器需要计算结束的位置.导致过来的时候,浏览器其实已经知道了结束的位置.更快.
+ 一直用从开始到结束的话,需要一直去维护transform的值,且容易弄脏css

## 对性能的影响

从交互结束到感知到响应大概需要 100ms 的生理反应时间,如果网站能在这 100ms 内做出响应，那么对用户来说就相当于网站立即进行了响应，然后只需要保证动画在 60FPS 运行就能给用户带来最佳的体验.我们可以充分利用用户 100ms 生理反应时间来进行相关的计算：getBoundingClientRect 或 getComputedStyle，并通过 FLIP 技术使动画尽快开始，最后通过 transform 和 opacity 的动画来保证动画的平滑运行.

FLIP 技术带来的改变对于 PC 端可能并不是那么明显，但对于 CPU 并不算非常强大的移动端却是相当显著.