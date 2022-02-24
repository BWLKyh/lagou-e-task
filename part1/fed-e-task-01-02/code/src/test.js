// function fn1() {
//   console.log("fn1 start");
//   return new Promise((resolve) => {
//     resolve("syy1");
//   });
// }

// function fn2() {
//   console.log("fn2 start");
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve("syy2");
//     }, 10);
//   });
// }

// console.log("a");

// setTimeout(async () => {
//   console.log("b");
//   await fn1();
//   console.log("c");
// }, 20);

// for (let i = 0; i < 88888888; i++) {} // 90ms

// console.log("d");

// fn1().then((result) => {
//   console.log("f");
// });

// fn2().then((result) => {
//   console.log("g");
// });

// setTimeout(() => {
//   console.log("h");
// }, 0);

// console.log("end");

var tmp = 123;
if (true) {
  console.log(tmp);
  let tmp;
}
