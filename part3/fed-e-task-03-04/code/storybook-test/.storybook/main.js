module.exports = {
  stories: [
    // '../stories/**/*.stories.mdx',
    '../packages/**/*.stories.js',
    '../stories/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  // 插件
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: '@storybook/vue',
}
