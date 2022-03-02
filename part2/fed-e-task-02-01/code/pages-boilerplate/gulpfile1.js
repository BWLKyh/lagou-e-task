// 实现这个项目的构建任务
const { src, dest, parallel, series, watch } = require("gulp");
const del = require("del");
const loadPlugins = require("gulp-load-plugins");
const plugins = loadPlugins();
const browserSync = require("browser-sync");
const bs = browserSync.create();
// 使用 load-plugins 简化导入后删除以下
const sass = require("gulp-sass")(require("node-sass"));
// const swig = require("gulp-swig");
// const babel = require("gulp-babel");
// const imagemin = require("gulp-imagemin");

const data = require("./data");

const clean = () => {
  return del(["dist", "temp"]);
};
const style = () => {
  return (
    src("src/assets/styles/*.scss", { base: "src" }) // base:基准路径
      .pipe(sass({ outputStyle: "expanded" })) // 完全展开
      // sass() 转换后,最终只生成没有_开头的文件,_的文件作为依赖文件
      .pipe(dest("temp"))
      .pipe(bs.reload({ stream: true }))
  ); // 推送流到服务器
};
const page = () => {
  return src("src/*.html", { base: "src" })
    .pipe(plugins.swig({ data, defaults: { cache: false } })) // 防止缓存造成不更新
    .pipe(dest("temp"))
    .pipe(bs.reload({ stream: true }));
};
const script = () => {
  return src("src/assets/scripts/*.js", { base: "src" })
    .pipe(plugins.babel({ presets: ["@babel/preset-env"] })) // babel 只是ECMAScript 转换平台,此处需指定使用插件做转换,preset-env 是 es 所有最新特性的集合
    .pipe(dest("temp"))
    .pipe(bs.reload({ stream: true }));
};
const image = () => {
  return src("src/assets/images/**", { base: "src" })
    .pipe(plugins.imagemin())
    .pipe(dest("dist"));
};
const font = () => {
  return src("src/assets/fonts/**", { base: "src" })
    .pipe(plugins.imagemin()) //无法转换的内容直接复制
    .pipe(dest("dist"));
};
const extra = () => {
  return src("public/**", { base: "src" }).pipe(dest("dist"));
};
const serve = () => {
  watch("src/assets/styles/*.scss", style);
  watch("src/assets/scripts/*.js", script);
  watch("src/*.html", page);
  // watch("src/assets/images/**", image); // 会降低开发阶段构建效率
  // watch("src/assets/fonts/**", font);
  // watch("public/**", extra);
  watch(
    ["src/assets/images/**", "src/assets/fonts/**", "public/**"],
    bs.reload
  );

  bs.init({
    notify: false, // 关闭可能造成影响的提示
    port: 2080,
    //open:false // 启动后自动打开浏览器
    // files: "dist/**", // 监听的文件,使用 bs.reload 后就不需要该参数
    server: {
      // baseDir: "dist", // 项目根目录
      baseDir: ["temp", "src", "public"], // 按顺序切换根目录查找资源,
      routes: {
        "/node_modules": "node_modules",
      },
    },
  });
};
// 上线前的工作
const useref = () => {
  return src("temp/*.html", { base: "temp" })
    .pipe(plugins.useref({ searchPath: ["temp", "."] })) //指定路径,转换构建注释时使用
    .pipe(plugins.if(/\.js$/, plugins.uglify()))
    .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
    .pipe(
      plugins.if(
        /\.html$/,
        plugins.htmlmin({
          collapseWhitespace: true, //折叠所有空白字符和换行符
          minifyCSS: true,
          minifyJS: true, // 自动压缩<style><script>标签中的内容
          removeComments: true, //删除 html 注释
        })
      )
    )
    .pipe(dest("dist")); // 防止读写冲突
};
// const compile = parallel(style, script, page, image, font);
// const build = series(clean, parallel(compile, extra));
// 优化后:
const compile = parallel(style, script, page);
const build = series(
  clean,
  parallel(series(compile, useref), image, font, extra)
);
const develop = series(compile, serve);
module.exports = {
  clean,
  // compile,
  build,
  // serve,
  develop,
  // useref,
};
