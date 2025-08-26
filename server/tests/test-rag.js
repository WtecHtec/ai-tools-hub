
const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters');

const ollama = require("ollama").default;
const cosineSimilarity = require("cosine-similarity");
const { docs } = require("../docs");
// 使用LangChain的分割器
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 800,
  chunkOverlap: 150,
  separators: ['\n\n', '\n', '。', '！', '？', '；', ' ', '']
});

// 知识库

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
async function retrieve(query, topK = 3, threshold = 0.6) {
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
  await answer("深K是代表是什么")
})();

// 分割文档
// 向量
// 检索