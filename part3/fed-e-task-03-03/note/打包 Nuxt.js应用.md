#### 打包 Nuxt.js应用

```
npm run build	# 打包
npm run start # 发布前测试
```



#### 最简单的部署方式

1. 配置 Host+Port

   nuxt.config.js 中配置 server 属性

   ```javascript
   module.exports={
     router:{//...},
     server:{
       // host:'localhost', // 只能本机访问
       host:'0.0.0.0', // 监听所有网卡地址, 生产环境下可通过外网地址访问, 本地环境可通过局域网访问
       port:3000,
       
     },
     plugins:[],
   }
   ```

   

2. 压缩发布包

   打包项

   ```
   .nuxt
   static
   nuxt.config.js
   package.json
   package-lock.json
   ```

   

3. 把发布包传到服务端

4. 解压

5. 安装依赖

6. 启动服务