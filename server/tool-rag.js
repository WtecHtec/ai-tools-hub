const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters');
const ollama = require("ollama").default;
const cosineSimilarity = require("cosine-similarity");

class RAGTool {
  constructor(options = {}) {
    // 初始化文本分割器
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: options.chunkSize || 800,
      chunkOverlap: options.chunkOverlap || 150,
      separators: options.separators || ['\n\n', '\n', '。', '！', '？', '；', ' ', '']
    });
    
    // 初始化向量存储
    this.vectorStore = [];
    
    // 配置选项
    this.embeddingModel = options.embeddingModel || "mxbai-embed-large";
  }

  // Embedding方法
  async embed(text) {
    const res = await ollama.embeddings({
      model: this.embeddingModel,
      prompt: text,
    });
    return res.embedding;
  }

  // 初始化知识库
  async init(docs) {
    if (!docs || !Array.isArray(docs)) {
      throw new Error('docs参数必须是一个数组');
    }
    
    for (const doc of docs) {
      // 使用LangChain分割文档
      const chunks = await this.textSplitter.splitText(doc);
      for (const chunk of chunks) {
        const vec = await this.embed(chunk);
        this.vectorStore.push({
          text: chunk,
          vec,
          source: doc.substring(0, 50) + "...",
          length: chunk.length
        });
      }
    }
    
    console.log(`知识库初始化完成，共处理 ${this.vectorStore.length} 个文档片段`);
  }

  // 检索方法
  async retrieve(query, topK = 3, threshold = 0.6) {
    if (this.vectorStore.length === 0) {
      throw new Error('知识库为空，请先调用init方法初始化');
    }
    
    const qVec = await this.embed(query);
    
    const results = this.vectorStore
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

  // 生成答案方法
  async answer(query) {
    const contextDocs = await this.retrieve(query);
    const context = contextDocs.map(d => d.text).join("\n");

    console.log("answer::", context);
    return context;
  }

  // 清空知识库
  clearVectorStore() {
    this.vectorStore = [];
    console.log('知识库已清空');
  }

  // 获取知识库状态
  getStatus() {
    return {
      vectorStoreSize: this.vectorStore.length,
      embeddingModel: this.embeddingModel,
      textSplitterConfig: {
        chunkSize: this.textSplitter.chunkSize,
        chunkOverlap: this.textSplitter.chunkOverlap
      }
    };
  }
}

module.exports = RAGTool;