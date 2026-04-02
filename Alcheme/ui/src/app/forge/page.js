'use client';
import { useState, useEffect } from 'react';

export default function Forge() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false); // 炼金加载状态
  const [progress, setProgress] = useState(0);   // 进度条（视觉更舒服）

  // ================================
  // 【接口 1】获取已合成的卡片
  // GET /api/cards
  // ================================
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await fetch('/api/cards');
        const data = await res.json();
        setCards(data);
      } catch (err) {
        // 演示假数据
        setCards([
          { id: 1, name: "学习达人", description: "持续学习成长" },
          { id: 2, name: "运动健将", description: "坚持运动锻炼" },
        ]);
      }
    };
    fetchCards();
  }, []);

  // ================================
  // 【接口 2】铸造SBT勋章（上链）
  // POST /api/forge
  // ================================
  const handleForge = async () => {
    if (loading) return;

    try {
      // 1. 开启加载动画（40秒）
      setLoading(true);
      setProgress(0);

      // 模拟40秒进度条（用户视觉超舒服）
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 0.4;
        });
      }, 160);

      // 2. 调用后端接口（真正锻造）
      const res = await fetch('/api/forge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardIds: cards.map(c => c.id) }),
      });

      const result = await res.json();
      clearInterval(interval);
      setProgress(100);
      alert("勋章铸造成功！交易哈希：" + result.txHash);
    } catch (err) {
      alert("演示模式：勋章锻造成功！");
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-yellow-400 mb-6">✨ 身份铸造</h1>

        {/* 炼金动画：队友要求的精美长加载 */}
        {loading && (
          <div className="mb-8">
            <div className="text-center mb-2">
              <div className="text-lg text-yellow-300 animate-pulse">
                🔨 勋章锻造中，请稍候（约40秒）
              </div>
              <div className="text-sm text-gray-400">正在生成图片并上链...</div>
            </div>

            {/* 旋转炼金动画 */}
            <div className="flex justify-center my-4">
              <div className="w-16 h-16 border-4 border-y-yellow-400 border-gray-700 rounded-full animate-spin"></div>
            </div>

            {/* 40秒进度条（用户不会以为卡死） */}
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 transition-all duration-150"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-xs text-center mt-1 text-gray-400">
              {Math.round(progress)}%
            </div>
          </div>
        )}

        {/* 卡片列表（不变） */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl mb-4">可用于铸造的卡片</h2>
          {cards.map(card => (
            <div key={card.id} className="p-4 bg-yellow-600 rounded-lg mb-2">
              {card.name}
            </div>
          ))}
        </div>

        {/* 按钮：加载中不可点击 */}
        <button
          onClick={handleForge}
          disabled={loading}
          className={`w-full py-4 rounded-xl text-xl font-bold transition-all ${
            loading
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-gradient-to-r from-yellow-500 to-orange-400"
          }`}
        >
          {loading ? "锻造中，请勿关闭..." : "铸造区块链勋章（SBT）"}
        </button>
      </div>
    </main>
  );
}
