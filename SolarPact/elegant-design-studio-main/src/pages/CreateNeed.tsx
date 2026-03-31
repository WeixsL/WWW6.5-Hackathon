import { motion } from "framer-motion";
import { useState } from "react";
import { Sparkles, Info } from "lucide-react";

const categories = ["职场", "婚恋", "自我", "健康", "转型"];

const CreateNeed = () => {
  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    goal: "",
    bounty: "",
    deadline: "",
    anonymous: true,
  });

  const update = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="container mx-auto max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold mb-2">
            发布<span className="text-gradient-primary">需求</span>
          </h1>
          <p className="text-muted-foreground mb-8">将你的恐惧转化为链上任务资产</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8 space-y-6"
        >
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">需求主题</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="例如：30天内完成职场转型"
              className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2">分类</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => update("category", cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    form.category === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-muted-foreground hover:text-foreground border border-border/50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">需求描述</label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="详细描述你的需求和期望..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          {/* Goal */}
          <div>
            <label className="block text-sm font-medium mb-2">
              目标行动
              <span className="text-muted-foreground font-normal ml-1">（可验证结果）</span>
            </label>
            <input
              type="text"
              value={form.goal}
              onChange={(e) => update("goal", e.target.value)}
              placeholder="例如：完成3次面试"
              className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Bounty & Deadline */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">奖金 (USDC)</label>
              <input
                type="number"
                value={form.bounty}
                onChange={(e) => update("bounty", e.target.value)}
                placeholder="100"
                className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">期限（天）</label>
              <input
                type="number"
                value={form.deadline}
                onChange={(e) => update("deadline", e.target.value)}
                placeholder="30"
                className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* Anonymous */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/30">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">匿名发布</span>
            </div>
            <button
              onClick={() => update("anonymous", !form.anonymous)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                form.anonymous ? "bg-primary" : "bg-muted"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-foreground absolute top-0.5 transition-transform ${
                  form.anonymous ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {/* Info */}
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-sm text-muted-foreground">
            <p>📋 发布后将铸造「需求NFT」，奖金将锁入智能合约。</p>
            <p className="mt-1">💡 伙伴不履约 → 扣保证金 | 发布者作弊 → 信誉扣分</p>
          </div>

          {/* Submit */}
          <button className="w-full flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary to-amber-400 text-primary-foreground font-display font-semibold text-lg glow-primary hover:scale-[1.02] transition-transform">
            <Sparkles className="w-5 h-5" />
            铸造需求 NFT 并发布
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateNeed;
