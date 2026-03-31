import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Search, Filter, Clock, Coins, Users, ArrowRight } from "lucide-react";
import { useState } from "react";

const categories = ["全部", "职场", "婚恋", "自我", "健康", "转型"];

const mockNeeds = [
  {
    id: 1,
    title: "30天内完成职场转型计划",
    category: "职场",
    description: "从传统行业转向Web3，需要有经验的导师指导",
    bounty: 200,
    bids: 5,
    deadline: "14天",
    level: "🔥 烈焰",
    author: "匿名用户 #3847",
    status: "竞拍中",
  },
  {
    id: 2,
    title: "建立每日冥想习惯",
    category: "健康",
    description: "坚持21天每日冥想15分钟，记录心理状态变化",
    bounty: 50,
    bids: 3,
    deadline: "21天",
    level: "🌱 萌芽",
    author: "匿名用户 #1204",
    status: "竞拍中",
  },
  {
    id: 3,
    title: "完成个人品牌打造",
    category: "自我",
    description: "从零开始建立社交媒体个人品牌，目标1000粉丝",
    bounty: 500,
    bids: 12,
    deadline: "30天",
    level: "⛰️ 巅峰",
    author: "匿名用户 #7721",
    status: "进行中",
  },
  {
    id: 4,
    title: "走出一段感情",
    category: "婚恋",
    description: "需要一位有心理咨询经验的伙伴帮助我重建信心",
    bounty: 150,
    bids: 8,
    deadline: "28天",
    level: "🔥 烈焰",
    author: "匿名用户 #5529",
    status: "竞拍中",
  },
  {
    id: 5,
    title: "学会公开演讲",
    category: "职场",
    description: "克服社交恐惧，完成3次公开演讲",
    bounty: 300,
    bids: 6,
    deadline: "45天",
    level: "⛰️ 巅峰",
    author: "匿名用户 #9103",
    status: "竞拍中",
  },
  {
    id: 6,
    title: "减脂10斤健康计划",
    category: "健康",
    description: "科学饮食+运动，每周打卡记录体脂变化",
    bounty: 100,
    bids: 4,
    deadline: "60天",
    level: "🔥 烈焰",
    author: "匿名用户 #2288",
    status: "进行中",
  },
];

const Marketplace = () => {
  const [activeCategory, setActiveCategory] = useState("全部");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = mockNeeds.filter((n) => {
    const matchCat = activeCategory === "全部" || n.category === activeCategory;
    const matchSearch = n.title.includes(searchQuery) || n.description.includes(searchQuery);
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="container mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            需求<span className="text-gradient-primary">市场</span>
          </h1>
          <p className="text-muted-foreground mb-8">发现正在等待投资的成长需求</p>
        </motion.div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索需求..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Filter className="w-4 h-4" />
            筛选
          </button>
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((need, i) => (
            <motion.div
              key={need.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-6 hover:border-primary/30 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                  {need.category}
                </span>
                <span className="text-sm">{need.level}</span>
              </div>

              <h3 className="font-display font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                {need.title}
              </h3>
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{need.description}</p>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-primary" />
                  {need.bounty} USDC
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {need.bids} 竞拍
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {need.deadline}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{need.author}</span>
                <Link
                  to={`/bid/${need.id}`}
                  className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                    need.status === "竞拍中"
                      ? "text-primary hover:text-primary/80"
                      : "text-secondary hover:text-secondary/80"
                  }`}
                >
                  {need.status === "竞拍中" ? "参与竞拍" : "查看进度"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
