'use client';
import { useState, useEffect } from 'react';

export default function Mine() {
  const [text, setText] = useState('');
  const [ores, setOres] = useState([]);

  // ================================
  // 【接口 1】页面加载时：获取我的矿石列表
  // 队友对接：GET /api/ores
  // ================================
  useEffect(() => {
    const fetchOres = async () => {
      try {
        // 调用后端接口获取矿石数据
        const res = await fetch('/api/ores');
        const data = await res.json();
        setOres(data); // 把后端返回的列表渲染到页面
      } catch (error) {
        console.log('获取矿石失败，使用演示数据');
        // 接口没好之前，用假数据不影响页面显示
        setOres([
          { id: 1, title: '学习 Solidity 3天', dimension: '技术', score: 80 },
        ]);
      }
    };

    fetchOres();
  }, []);

  // ================================
  // 【接口 2】点击提交：把文字发给后端 → AI 生成矿石
  // 队友对接：POST /api/mine
  // ================================
  const handleSubmit = async () => {
    if (!text) return;

    try {
      // 发送用户输入的内容给后端
      const res = await fetch('/api/mine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: text, // 传给后端的文字
        }),
      });

      const newOre = await res.json(); // 后端返回生成好的矿石
      setOres([newOre, ...ores]); // 加到页面列表
      setText('');
      alert('矿石提炼成功！');
    } catch (error) {
      // 接口没好时，前端模拟不影响演示
      const mockOre = {
        id: ores.length + 1,
        title: text.slice(0, 20) + '...',
        dimension: '智慧',
        score: 75,
      };
      setOres([mockOre, ...ores]);
      setText('');
      alert('（演示模式）矿石提炼成功！');
    }
  };

  // —————————— 页面界面 ——————————
  return (
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold">🔨 灵光采集</h1>

      <div className="mt-6">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-3 rounded-lg bg-gray-800"
          placeholder="记录今天的成长..."
          rows={4}
        />
        <button
          onClick={handleSubmit}
          className="mt-3 bg-purple-600 py-2 px-4 rounded-lg"
        >
          提炼矿石
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-lg">你的矿石</h2>
        <div className="mt-2 space-y-2">
          {ores.map((ore) => (
            <div key={ore.id} className="p-3 bg-gray-800 rounded-lg">
              {ore.title}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
