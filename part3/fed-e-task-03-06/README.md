## 新作业

#### 解答题：

**1.说说 application/json 和 application/x-www-form-urlencoded 二者之间的区别。**

#### application/x-www-form-urlencoded
1. 是最常见的 POST 提交数据的方式，浏览器的原生表单如果不设置 enctype 属性则以该方式提交数据，它是未指定属性时的默认值。 
2. 数据发送过程中会对数据进行序列化处理，以键值对形式?key1=value1&key2=value2的方式发送到服务器。非字母或数字的字符会被 percent-encoding。
3. axios中当请求参数为qs.stringify(data)时，会以此方式提交数据。后台如果使用对象接收的话,可以自动封装成对象

优势: 所有浏览器都兼容。
问题：在数据结构及其复杂时，服务端数据解析变得很难

#### application/json
1. 在请求头中加入 content-type: application/json ，这样做可以方便的提交复杂的结构化数据,json 格式要支持比键值对复杂得多的结构化数据,这样特别适合restful接口。
2. 当在 axios 中请求参数为普通对象时，POST 请求默认发送的是 application/json 格式的数据。 
3. application/json 需要封装成对象的话，可以加上 @RequestBody 进行注解。

优势：是前端不需要关心数据结构的复杂度，后端解析方便。
问题：少数浏览器不兼容(目前不存在该问题)。

举例：向服务器发送数据 {a:"a",  b:"b"}
application/x-www-form-urlencoded,  则ajax.send("a='a'&b='b'");
application/json,  则ajax.send(JSON.stringify(data));
 
补充：
multipart/form-data： 主要用于文件上传，将文件转成二进制数据进行传输，不涉及转码。
text/plain： 是使用纯文本进行传输，平时用的很少
　
**2.说一说在前端这块，角色管理你是如何设计的。**

#### 登录权限控制
router.beforeEach实现, 如果用户没有登录并且要访问的页面又需要登录时就使用next跳转到登录页面,并将需要访问的页面路由名称通过redirect_page传递过去，在登录页面就可以拿到redirect_page等登录成功后直接跳转。
#### 页面权限控制
角色的出现是为了更加个性化配置权限列表, 前端要做的事情就是依据账户所拥有的角色身份从而给与它相应页面访问和操作的权限。但真正落地到前端项目中是不需要去处理角色逻辑的，那部分功能主要由后端完成。用户一旦登录后，后端接口直接返回该账号拥有的权限列表就行了，至于该账户属于什么角色以及角色拥有的页面权限合理方案应是后端处理。
1. 现在将所有路由分成两部分，静态路由routes和动态路由dynamic_routes。静态路由里面的页面是所有角色都能访问的，它里面主要区分登录访问和非登录访问,动态路由里面存放的是与角色定制化相关的的页面。
2. 我们先从vuex里面拿到当前用户的权限列表，然后遍历动态路由数组dynamic_routes，从里面过滤出允许访问的路由，最后将这些路由动态添加到路由实例里, 最好单独封装起来，因为用户登录和刷新页面时都需要调用。对于没有权限的路由来说，页面是被添加到 router 里面去的，当访问时则需要调转到 404 默认页面。
3. 嵌套子路由:将通过递归遍历后端的权限字段，从而将已有的路由结构给过滤一遍。
#### 切换用户
切换用户信息是非常常见的功能，但是应用在切换成不同账号后可能会引发一些问题，例如用户先使用超级管理员登录，由于超级管理员能访问所有页面，因此所有页面路由信息都会被添加到路由实例里。
此时该用户退出账号，使用一个普通成员的账号登录。在不刷新浏览器的情况下，路由实例里面仍然存放了所有页面的路由信息，即使当前账号只是一个普通成员，如果他越权访问相关页面，路由还是会跳转的，这样的结果并不是我们想要的。

解决方案有两种。

第一种是用户每次切换账户后刷新浏览器重新加载，刷新后的路由实例是重新配置的所以可以避免这个问题，但是刷新页面会带来不好的体验。
第二种方案是当用户选择登出后，清除掉路由实例里面处存放的路由栈信息#### 切换账号 
#### 内容权限控制
首先前端开发页面时要将页面分析一遍，把每一块内容按照权限编码分类。比如修改按钮就属于 U，删除按钮属于 D。并用 v-permission 将分析结果填写上去。

当页面加载后，页面上定义的所有 v-permission 指令就会运行起来。在自定义指令内部，它会从 vuex 中取出该用户所拥有的权限编码，再与该元素所设定的编码结合起来判端是否拥有显示权限，权限不具备就移除元素。对于特殊的业务场景，如隐藏后导致样式混乱、UI 设计不协调等。此时则应具体根据项目内的需求去判断是否隐藏还是弹出提示无权限等。

权限控制在前端更多的应为优化用户体验，除此以外也为应用加固了一层防护，但是需要注意的是前端的相关校验是可以通过技术手段破解的。然而权限问题关乎到软件系统所有数据的安危。

**３.@vue/cli 跟 vue-cli 相比，@vue/cli 的优势在哪？**

#### vue-cli
1. 2.x版本时vue的脚手架
2. 命令 vue init webpack, npm run dev
3. CLI 2 可以选择根据模板初始化项目
4. Vue-cli 所生成的项目中，是把 webpack 的配置也一起放到了项目的配置文件中了。
 
#### @vue/cli
1. 3.x版本的脚手架
2. 命令 vue create, npm run serve
3. CLI 3 并未重新开发使用模板， 如果开发者想要像 CLI 2 一样使用模板初始化项目，可全局安装一个桥接工具@vue/cli-init
4. CLI 3的 name 也不能使用驼峰命名
5. 支持 vue ui 通过图形化界面创建
6. 生成的 vue 项目目录的命名、目录结构改变。 项目结构更简单，文件变少，结构更清晰
7. 移除了 static 静态资源文件夹，新增 public 文件夹，静态资源转移到public目录中，通过/xx.xx可以直接访问，并且 index.html 移动到 public 中
8. 在 src 文件夹中新增了 views 文件夹，用于分类 视图组件 和 公共组件, 移除了配置文件目录 config 和 build 文件夹。CLI 3 也隐藏了 webpack 配置文件, 如果需要自定义配置，需要自己新建vue.config.js文件。同时vue.config.js支持webpack-chain写法
9. 安装项目时会自动下载node-model文件夹
10. @vue/cli 所生成的项目中，它会把关于项目的webpack配置隐藏起来，并且它会抛出一个配置文件让开发者去做定制化。@vue/cli的好处在于，如果当脚手架中的一些配置官方进行更新，那么开发者更新起来就不会这么麻烦，并且官方也希望开发者，如有需要可以通过配置文件的方式去定制他们各自的需求，使用了 webpack merge 进行了合并。
　
**４.详细讲一讲生产环境下前端项目的自动化部署的流程。**

1. 代码扫描 yarn lint检查代码是否规范
2. yarn unit进行单元测试
3. git push提交更改到远端仓库
4. 登录服务器，git pull拉取最新代码
5. yarn build构建项目
6. 配置 nginx 访问路径
7. 将上面的操作细节都集成到一个 shell 脚本里，通知执行 shell 能减少很多重复的工作
#### DevOps-CI/CD 　
1. Github + Jenkins 的实现链路
vscode提交代码-Github合并到master分支-通知Jenkins执行任务拉取代码-Jenkins构建项目-推送到服务器-服务器配置nginx访问路径-用户通过浏览器访问项目部署地址
2. Github Actions 的实现链路
vscode提交代码-Github合并到master分支-触发钩子-执行build任务-推送到服务器-服务器配置nginx访问路径-用户通过浏览器访问项目部署地址

**５.你在开发过程中，遇到过哪些问题，又是怎样解决的？请讲出两点。**

变量更改不符预期, 过程中通过debugger和log发现可能是某些方法调用时更改了数据源, 通过深拷贝解决
循环递归时的调试问题, 不易调试, 通过log逐步调试发现问题, 没有经过严格测试, 如果有计算步骤容易产生null/undefined/NaN等问题, js需要增加校验　

**６.针对新技术，你是如何过渡到项目中？**

1. 明确需求,技术选型,选择合适的技术稳定的版本
2. 在官网的在线示例中确定是否有符合要求的示例或功能
3. 局部页面/组件中引入, 按官方示例测试
4. 如果无明显问题接入开发
5. 经过测试验证符合要求且可用进行上线

　



## 原作业(作废)

1.完成视频中老师提出的作业要求

2.100% 还原视频中所讲到的内容

3.完成剩下的几个模块

4.没有权限的模块，暂时不做啊，比如删除（删除东西容易导致服务器崩了）



**作业接口文档地址**

http://113.31.104.154:8081/doc.html#/home

http://113.31.104.154:8010/doc.html#/home

如果ip访问出现问题 请访问下面的

```
http://edufront.lagou.com/front/doc.html#/home
```

```
http://eduboss.lagou.com/boss/doc.html#/home
```

　

**原型图 地址**

eduboss.lagou.com

用户账号 密码

[http://eduboss.lagou.com](http://eduboss.lagou.com/)

用户名：15510792995     密码：111111
用户名：18201288771     密码：111111

　

**硬性要求**

大家不要在3-6的系统中删除数据，可以自己新增，修改或是删除自己新增的数据，否则服务器总是出问题哈

学员自己的资源 name有固定前缀 比如: 共用前缀test + 自己前缀+业务名称diy， 比如： test_lnw_menu1

作业要求:凡是里面没有权限的模块，都可以不用做哈
