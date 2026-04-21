import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import Sitemap from 'vite-plugin-sitemap'; // 1. 导入插件

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const SCHOOL_SITE_URL = 'https://gift.sjtu.edu.cn/ec-zero';
  
  return {
    base: './',
    
    plugins: [
      react(), 
      tailwindcss(),
      // 2. 配置 Sitemap
      Sitemap({
        hostname: SCHOOL_SITE_URL,
        
        // 1. 彻底停用手动路由，因为插件会自动扫描 dist 根目录下的 index, people, publications
        // 这样可以解决“双份”重复的问题
        dynamicRoutes: [], 

        // 2. 强力排除：既然通配符可能失效，我们直接把整个目录和不想见的页面列出来
        // 插件在处理路径时通常会去掉 .html，所以我们按它生成的路径来写
        exclude: [
          '/news',
          '/news.html',
          '/content/footer',
          '/content/footer_cn',
          '/content/navbar',
          '/content/navbar_cn',
          '/content/opportunities',
          '/content/opportunities_cn',
          '/content/research',
          '/content/research_cn',
          // 如果还有别的碎片，也按照这个格式往里填
        ],

        generateRobotsTxt: true,
        readable: true,
      }),
    ],
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          news: path.resolve(__dirname, 'news.html'),
          people: path.resolve(__dirname, 'people.html'),
          publications: path.resolve(__dirname, 'publications.html'),
        },
      },
    },
    // define: {
    //   'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    // },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
