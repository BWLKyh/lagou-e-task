const presets = [["@babel/preset-env"], ["@babel/preset-react"]];
const plugins = [];

if (process.env.NODE_ENV !== "production") {
  plugins.push(["react-refresh/babel"]); //热更新
}

module.exports = {
  presets,
  plugins,
};
