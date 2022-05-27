### Strapi

一个通用的内容管理系统, 可以轻松实现内容管理

- 自定义内容结构
- 对开发者友好的 api(默认提供 restful 风格, 也可以通过插件提供graphQL 风格的 api)
- 内置用户系统, 支持权限角色管理
- 内置插件系统, 可扩展功能
- 可自定义源代码

#### 快速开始

```shell
npx create-strapi-app@latest my-project --quickstart
```

使用SQLite数据库, 适用于本地快速开发



在 gridsome 预渲染前拿到 strapi数据渲染静态网页内容

- 使用gridsome插件