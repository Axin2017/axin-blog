---
title: 使用simple-git编写一个git代码量统计工具
date: 2020-08-17 21:13:19
tags: git
categories: [node-cli, git]
---

# 背景
公司每周都要统计代码量。最近新入职，代码量不是很多，开始的时候，一直是直接在gitlab上看我的提交，一次一次地累加，好蠢有没有...

偶然之间，了解了刚离职的大佬同事以前是用shell脚本来自动统计的，大牛有木有！顺带帮传宣下：[git代码统计脚本](https://blog.towavephone.com/git-code-statistics-script/)

最近，公司架构组大佬写了一个git自动部署的工具，加之我又没有被分配需求，就研究了一下。收获颇多，突发奇想，这个统计代码的工具，我干脆自己来写一个！

# 使用到的库
+ `simple-git` [simple-git](https://github.com/steveukx/git-js#readme) 一个git的轻量级nodejs接口
+ `chalk` [chalk](https://github.com/chalk/chalk#readme) 一个可以在控制台输出花里胡哨的颜色文字的炫酷工具
+ `inquirer` [inquirer](https://github.com/SBoudrias/Inquirer.js#readme) 一个可以在控制台跟用户交互并且收集用户输入的参数的库

# 核心api
git相关：
```js
// 新建git对象
const simpleGit = require('simple-git');
const git = simpleGit('D:/xxx/xxx');

// 以下方法均返回promise
// 获取本地分支
git.branchLocal()
// 切换到某个分支
git.checkout(branch)
// 获取提交日志
git.log({
    '--stat': true,
    '--since': '2020-01-01',
    '--until': '2020-01-02',
    '--author': 'your name'
  });
```
交互相关：
```js
// 单个参数输入
const { workSpace } = await inquirer.prompt([{
    name: 'workSpace',
    message: '输入你的工作目录',
    validate: answer => {
      try {
        if (!answer || !fs.statSync(answer.trim()).isDirectory) {
          return '输入的路径不是合法的目录';
        }
        return true;
      } catch {
        return '输入的路径不是合法的目录';
      }
    }
  }]);

// 列表多选
const { projectList } = await inquirer.prompt({
    name: 'projectList',
    message: '请选择要统计的项目，空格选择，回车结束选择',
    type: 'checkbox',
    choices: ['projectA', 'projectB', 'projectC'],
    validate: checkedList => {
      return checkedList.length > 0 || '请选择至少一个项目';
    }
  });
```
控制台输出相关：
```js
console.log(chalk.green('这句代码会在控制台输出绿色的字'))
```

# 开始编写
其实这些api都会使用了之后，我们这个工具的编写就变得非常简单了起来。这里我把主要思路写一下，具体代码请见文末贴出来的git地址

1. 输入工作目录
2. 输入要统计的开始时间
3. 输入要统计的结束时间
4. 输入作者关键字
5. 根据输入的工作目录，循环遍历目录中的子文件夹，如果子文件夹中有`.git`目录，则认为该目录是一个git项目，存入列表。最终得到一个项目列表，供用户选择要统计的项目。
6. 根据用户选择后得到的项目列表，一一循环获得每个项目的本地分支，得到每个项目的分支列表。一一循环每个项目及每个分支，供用户选择要统计的分支。
7. 根据得到的所有参数，循环项目，分支，一一统计得到每个分支，每个项目，及总共的代码变动量。
8. 按照特定的格式输出结果。

# 体验一下
![使用git-code-count](/assets/使用simple-git编写一个git代码量统计工具/git-code-count.gif)

<div class="block tip-block">

在windows的cmd窗口中，偶尔会出现上面动图中标题输出多次的bug，目前不明真相。在vscode的终端中不会有这个问题。有空的时候继续研究一下。。
</div>

# 代码仓库地址
[git-code-count](https://github.com/Axin2017/git-code-count)

欢迎使用，提出issues以及在博客上留言提出你想要的功能，我将会持续维护。