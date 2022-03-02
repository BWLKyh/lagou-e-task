## 简答题

**1、谈谈你对工程化的初步认识，结合你之前遇到过的问题说出三个以上工程化能够解决问题或者带来的价值。**

答:

1.工程化能标准化规范化项目,例如在项目创建时可以进行统一环境配置,规范代码风格,目录结构等统一的规范,有助于提高整体质量, 提高团队协作效率, 利于维护和延长生命周期

2.工程化能利用脚手架和自动化构建等工具使开发人员从重复劳动中解放出来,专注于业务开发,有助于提高工作效率

3.工程化有利于提高开发人员的技术积累,摆脱后端依赖,能更独立的承担工作任务

**2、你认为脚手架除了为我们创建项目结构，还有什么更深的意义？**

答:

脚手架能根据项目情况和架构规划,自定义项目结构及部署的方案,形成自有体系,规范开发人员的工作,提升整体效率。

## 编程题

**1、概述脚手架实现的过程，并使用 NodeJS 完成一个自定义的小型脚手架工具**

1. 创建一个 node-cli 应用

```shell
$ mkdir sample-scaffolding
$ cd sample-scaffolding
$ yarn init
$ code .
$ yarn add inquirer
$ yarn add ejs
```

2. 修改 package.json 中指定入口文件

```javascript
"bin":"cli.js",
```

3. 创建模板 templates/
4. 创建 cli.js
5. 编写配置,使用 inquirer.prompt 与用户交互获得输入数据并返回一个 promise 对象
6. 在 then 方法中设置模板路径,目标路径,使用 fs.readdir 方法读取模板目录中的文件
7. 对于每个模板文件,使用 ejs.renderFile 根据模板,用户输入数据渲染文件内容,并在回调函数中使用 fs.writeFileSync 将结果写入目标文件路径中

```javascript
#!/usr/bin/env node
/*
 Node CLI 应用入口文件必须的文件头
 如果时 Linux 或 macOS 需修改此文件的读写权限为 755
 具体就是通过 chmod 755 cli.js 实现修改

 脚手架工作过程:
 1.通过命令行交互询问用户问题(yarn add inquirer)
 2.根据用户回答结构生成文件
*/
const fs = require("fs");
const path = require("path");
const inquirer = require("inquirer");
const ejs = require("ejs");
inquirer
  .prompt([
    {
      type: "input",
      name: "name",
      message: "Project name?",
    },
  ])
  .then((anwsers) => {
    const tmplDir = path.join(__dirname, "templates");
    const destDir = process.cwd();
    fs.readdir(tmplDir, (err, files) => {
      if (err) throw err;
      files.forEach((file) => {
        //通过模板引擎渲染文件 (yarn add ejs)
        ejs.renderFile(path.join(tmplDir, file), anwsers, (err, result) => {
          if (err) throw err;
          //将结果写入目标文件路径
          fs.writeFileSync(path.join(destDir, file), result);
        });
      });
    });
  });
```

5. 执行

```shell
$ sample-scaffolding
```

**2、尝试使用 Gulp 完成项目的自动化构建** ( **[先要作的事情](https://gitee.com/lagoufed/fed-e-questions/blob/master/part2/%E4%B8%8B%E8%BD%BD%E5%8C%85%E6%98%AF%E5%87%BA%E9%94%99%E7%9A%84%E8%A7%A3%E5%86%B3%E6%96%B9%E5%BC%8F.md)** )

(html,css,等素材已经放到 code/pages-boilerplate 目录)

## 说明：

本次作业中的编程题要求大家完成相应代码后

- 提交一个项目说明文档，要求思路流程清晰。
- 或者简单录制一个小视频介绍一下实现思路，并演示一下相关功能。
- 说明文档和代码统一提交至作业仓库。

代码:code/pages-boilerplate
说明文档:code/README.md
