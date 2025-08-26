
const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters');

const ollama = require("ollama").default;
const cosineSimilarity = require("cosine-similarity");

// 使用LangChain的分割器
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 800,
  chunkOverlap: 150,
  separators: ['\n\n', '\n', '。', '！', '？', '；', ' ', '']
});

// 知识库
const docs = [
  "Node.js 是一个基于 Chrome V8 引擎的 JavaScript 运行时环境。它使用事件驱动、非阻塞 I/O 模型，使其轻量且高效。Node.js 非常适合构建数据密集型的实时应用程序。",
  "RAG（Retrieval-Augmented Generation）是一种结合检索和生成的模型架构。它通过从外部知识库检索相关信息来增强大语言模型的回答准确性和时效性。RAG 模型特别适用于需要最新信息或专业知识的场景。",
  "深圳是中国广东省的一个副省级市，位于珠江三角洲东岸。作为中国的经济特区之一，深圳以其快速的经济发展和创新能力而闻名。这座城市是许多高科技公司的总部所在地，被誉为中国的硅谷。"
];

let vectorStore  = [];

// Embedding
async function embed(text) {
  const res = await ollama.embeddings({
    model: "mxbai-embed-large",
    prompt: text,
  });
  return res.embedding;
}

// 初始化知识库
async function init() {
   for (const doc of docs) {
    // 使用LangChain分割文档
    const chunks = await textSplitter.splitText(doc);
      for (const chunk of chunks) {
      const vec = await embed(chunk);
      vectorStore.push({
        text: chunk,
        vec,
        source: doc.substring(0, 50) + "...",
        length: chunk.length
      });
    }
  }
}

// 检索
async function retrieve(query, topK = 1, threshold = 0.6) {
  const qVec = await embed(query);
  
  const results = vectorStore
    .map(d => ({ 
      ...d, 
      score: cosineSimilarity(qVec, d.vec) 
    }))
    .filter(d => d.score > threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
  
  console.log(`检索到 ${results.length} 个相关片段`);
  results.forEach((r, i) => {
    console.log(`[${i+1}] 相似度: ${r.score.toFixed(3)}, 长度: ${r.length}`);
    console.log(`内容: ${r.text.substring(0, 100)}...`);
  });
  
  return results;
}

// 调用本地 LLM 生成答案
async function answer(query) {
  const contextDocs = await retrieve(query);
  const context = contextDocs.map(d => d.text).join("\n");

  console.log("answer::",context )
}


(async () => {
  await init();
  await answer("RAG是什么")
})();

// 分割文档
// 向量
// 检索