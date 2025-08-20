const express = require("express");
const cors = require("cors");
const OpenAI =   require("openai");
const fetch = require("node-fetch");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 3100;

const {  
    CopilotRuntime,
    OpenAIAdapter,
    copilotRuntimeNodeHttpEndpoint,

     } = require("@copilotkit/runtime");
const { fetchWebContent } = require("./tools");
  




// 中间件
app.use(cors());
app.use(express.json());


 
const apiKey = process.env.GITHUB_API_KEY;
// 自定义fetch封装，改成请求智谱API
async function customFetch(url, options) {
    // 你可以根据 url 和 options 自行改造请求，转发到智谱API
  
    // 这里示范替换 URL 和 headers，假设智谱API地址是 https://api.zhipu.com/v1/chat/completions
    const newUrl = "https://models.github.ai/inference/chat/completions";
    const originalBody = JSON.parse(options.body);
    const newBody = { ...originalBody, model: "openai/gpt-4.1"}

    // 重新构造请求体，headers 等，确保符合智谱API格式
    const newOptions = {
      ...options,
      headers: {
        // ...options.headers,
        Authorization: `Bearer ${apiKey}`, // 智谱token
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newBody) , // 如果需要，改写body格式
    };
 
   
    return fetch(newUrl, newOptions);
  }

  

const openai = new OpenAI({
  apiKey,
  baseURL: "https://open.bigmodel.cn/api/paas/v4/chat/completions", // 可以留着默认
  fetch: customFetch
});

const serviceAdapter = new OpenAIAdapter( {openai});
 
app.use('/copilotkit', (req, res, next) => {
  (async () => {
    const runtime = new CopilotRuntime({
      actions:  ({properties, url}) => { 
        return [
          {
            name: "getWebpageContent",
            description: "Fetch and return webpage text",
            parameters: [
              {
                name: "url",
                type: "string",
                description: "web page url",
                required: true,
              },
            ],
            handler: async ({url}) => {
              // do something with the userId
              // return the user data
              return await  fetchWebContent(url)
            },
          },
    
        ]
      }
    });
    const handler = copilotRuntimeNodeHttpEndpoint({
      endpoint: '/copilotkit',
      runtime,
      serviceAdapter,
    });

    return handler(req, res);
  })().catch(next);
});

// 健康检查端点

app.get("/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "AG-UI Node.js Server",
    });
  });
  
// 错误处理中间件
app.use((err, req, res, next) => {
    console.error("Server error:", err.stack);
    res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  });
  
  // 404 处理
  app.use("/*", (req, res) => {
    res.status(404).json({
      error: "Endpoint not found",
      path: req.originalUrl,
    });
  });

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 AG-UI Node.js 服务器运行在 http://localhost:${PORT}`);
    console.log(`📝 健康检查: http://localhost:${PORT}/health`);
    console.log(`⏰ 启动时间: ${new Date().toLocaleString()}`);
  });
  