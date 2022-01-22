/*
尽可能还原 Promise 中的每一个 API, 并通过注释的方式描述思路和原理.
*/
const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "resjected";
class MyPromise {
  // 构造Promise对象时会首先将resolve和reject传入到执行器中立即执行
  // 如果发生异常直接进入rejected状态
  constructor(executor) {
    try {
      executor(this.resolve, this.reject);
    } catch (e) {
      this.reject(e);
    }
  }
  // promise状态
  status = PENDING;
  // 成功之后的值
  value = undefined;
  // 失败之后的值
  reason = undefined;
  // 成功回调函数栈
  successCallback = [];
  // 失败回调函数栈
  failCallback = [];
  resolve = (value) => {
    if (this.status !== PENDING) return;
    this.status = FULFILLED;
    // 判断状态，只有等待状态才能继续执行
    this.value = value;
    // 出栈执行一个成功回调函数，直到栈空
    while (this.successCallback.length) this.successCallback.shift()();
  };
  reject = (reason) => {
    if (this.status !== PENDING) return;
    this.status = REJECTED;
    this.reason = reason;
    while (this.failCallback.length) this.failCallback.shift()();
  };
  then(successCallback, failCallback) {
    // then方法没有传入成功回调时默认返回上一个promise返回的结果
    successCallback = successCallback ? successCallback : (value) => value;
    // then方法没有传入失败回调时默认将上一个promise返回的结果作为异常抛出
    failCallback = failCallback
      ? failCallback
      : (reason) => {
          throw reason;
        };
    // then方法始终返回一个新的promise对象
    let promise2 = new MyPromise((resolve, reject) => {
      // 成功状态，传入的成功回调立即执行，并将结果传入resolvePromise统一处理
      if (this.status === FULFILLED) {
        // 使用setTimeout模拟异步操作，等待promise2生成
        setTimeout(() => {
          try {
            let x = successCallback(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      } else if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            let x = failCallback(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      } else {
        // promise为等待状态，先将成功/失败回调及其相关处理代码块作为回调函数压栈，直至状态改变
        this.successCallback.push(() => {
          // 模拟异步操作，等待promise生成后使用resolvePromise后续处理
          setTimeout(() => {
            try {
              // 将回调函数处理结果传入resolvePromis后续处理
              let x = successCallback(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        });
        this.failCallback.push(() => {
          setTimeout(() => {
            try {
              let x = failCallback(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        });
      }
    });
    return promise2;
  }
  // 静态方法，解决异步并发问题
  static all(array) {
    // 存储结果的数组
    let result = [];
    // 当前已处理任务的数量
    let index = 0;
    return new MyPromise((resolve, reject) => {
      // 将处理结果存储到数组指定位置，以实现按传入顺序返回结果
      function addData(key, value) {
        result[key] = value;
        index++;
        // 直到所有任务处理完成后使用resolve改变promise状态返回执行结果
        if (index === array.length) resolve(result);
      }
      for (let i = 0; i < array.length; i++) {
        let current = array[i];
        // 当前任务为promise对象时，使用then处理后续（addData）
        if (current instanceof MyPromise) {
          current.then(
            (value) => addData(i, value),
            (reason) => reject(reason)
          );
        } else {
          // 普通值
          addData(i, array[i]);
        }
      }
    });
  }
  // 静态方法，将给定值转换为包裹该值的promise对象，使后面的then方法能够通过链式调用拿到该值
  static resolve(value) {
    if (value instanceof MyPromise) return value;
    return new MyPromise((resolve) => resolve(value));
  }
  // 不管当前promise状态如何最终都会执行的方法，调用then处理callBack
  finally(callBack) {
    return this.then(
      (value) => {
        // 使用resolve静态方法执行callBack后使用then将value值穿透
        return MyPromise.resolve(callBack()).then(() => value);
      },
      (reason) => {
        return MyPromise.resolve(callBack()).then(() => {
          throw reason;
        });
      }
    );
  }
  // 捕获异常，原理是将failCallback作为失败回调传递给then处理
  catch(failCallback) {
    return this.then(undefined, failCallback);
  }
}
function resolvePromise(promise2, x, resolve, reject) {
  // 防止循环链式调用
  if (promise2 === x) {
    return reject(new TypeError("Chaining cycle detected for promise"));
  }
  // 如果传入的处理结果x是promise对象，将传入的成功/失败回调传入then进行后续处理
  if (x instanceof MyPromise) {
    x.then(resolve, reject);
  } else {
    // 普通值
    resolve(x);
  }
}
