import { defineConfig } from "vite";
export default defineConfig({
  build: {
    // 输出目录
    outDir: 'dist',
    // 构建 npm 包时需要开启 “库模式”
    lib: {
      // 指定入口文件
      entry: 'src/index.ts',
      // 输出 UMD 格式时，需要指定一个全局变量的名称
      name: 'dResource',
      // 最终输出的格式，这里指定了三种
      formats: ['es', 'cjs', 'umd'],
      // 针对不同输出格式对应的文件名
      fileName: (format) => {
        switch (format) {
          // ES Module 格式的文件名
          case 'es':
            return 'd-resource.es.js'
          // CommonJS 格式的文件名
          case 'cjs':
            return 'd-resource.cjs.js'
          // UMD 格式的文件名
          default:
            return 'd-resource.umd.js'
        }
      },
    },
    // 压缩混淆构建后的文件代码
    minify: true,
  },
})