/*
 * @Author       : 杨浩
 * @Date         : 2022-01-14 17:32:32
 * @LastEditors  : 杨浩
 * @LastEditTime : 2022-01-16 22:07:20
 * @FilePath     : /code/code1.js
 */

const { reject } = require("bluebird");

/*
  将下面异步代码使用 Promise 的方法改进
  尽量用看上去像同步代码的方式
  setTimeout(function () {
    var a = 'hello'
    setTimeout(function () {
      var b = 'lagou'
      setTimeout(function () {
        var c = 'I ♥ U'
        console.log(a + b +c)
      }, 10)
    }, 10)
  }, 10)
*/
const add = (value, word, time) =>
  new Promise((resolve, reject) =>
    setTimeout(() => resolve(value + word), time)
  );
Promise.resolve("")
  .then((value) => add(value, "hello", 10))
  .then((value) => add(value, "lagou", 10))
  .then((value) => add(value, "I ♥ U", 10))
  .then((value) => console.log(value));
