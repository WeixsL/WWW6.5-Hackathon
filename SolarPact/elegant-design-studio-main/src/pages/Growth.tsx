import { motion } from "framer-motion";
import { CheckCircle2, Circle, Trophy, Flame, Target } from "lucide-react";

const weeks = [
  {
    week: 1,
    title: "认知重塑",
    tasks: [
      { text: "完成行业调研报告", done: true },
      { text: "参加1次线上分享会", done: true },
      { text: "更新个人简历", done: true },
    ],
    sbt: "勇气芽 SBT",
  },
  {
    week: 2,
    title: "技能提升",
    tasks: [
      { text: "完成Web3基础课程", done: true },
      { text: "提交课程作业", done: true },
      { text: "参加社区AMA", done: false },
    ],
    sbt: "破壁者 SBT",
  },
  {
    week: 3,
    title: "实战演练",
    tasks: [
      { text: "投递3份目标岗位", done: false },
      { text: "完成1次模拟面试", done: false },
      { text: "获得面试反馈", done: false },
    ],
    sbt: null,
  },
];

const Growth = () => {
  const totalTasks = weeks.flatMap((w) => w.tasks).length;
  const doneTasks = weeks.flatMap((w) => w.tasks).filter((t) => t.done).length;
  const progress = Math.round((doneTasks / totalTasks) * 100);

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="container mx-auto max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold mb-2">
            成长<span className="text-gradient-primary">追踪</span>
          </h1>
          <p className="text-muted-foreground mb-8">30天职场转型计划 — 每周链上打卡</p>
        </motion.div>

        {/* Progress overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-display text-2xl font-bold text-gradient-primary">{progress}%</div>
              <div className="text-muted-foreground text-sm">
                完成 {doneTasks}/{totalTasks} 个任务
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex flex-col items-center glass-card p-3 rounded-xl">
                <Flame className="w-5 h-5 text-secondary mb-1" />
                <span className="text-xs text-muted-foreground">连续</span>
                <span className="font-display font-bold">12天</span>
              </div>
              <div className="flex flex-col items-center glass-card p-3 rounded-xl">
                <Trophy className="w-5 h-5 text-primary mb-1" />
                <span className="text-xs text-muted-foreground">SBT</span>
                <span className="font-display font-bold">2枚</span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
            />
          </div>
        </motion.div>

        {/* Weekly timeline */}
        <div className="space-y-6">
          {weeks.map((week, wi) => (
            <motion.div
              key={week.week}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + wi * 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 flex items-center justify-center font-display font-bold text-primary">
                    {week.week}
                  </div>
                  <div>
                    <h3 className="font-display font-semibold">Week {week.week}: {week.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {week.tasks.filter((t) => t.done).length}/{week.tasks.length} 完成
                    </p>
                  </div>
                </div>
                {week.sbt && (
                  <span className="text-xs px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary">
                    🏅 {week.sbt}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {week.tasks.map((task, ti) => (
                  <div
                    key={ti}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                      task.done ? "bg-primary/5" : "bg-muted/30"
                    }`}
                  >
                    {task.done ? (
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
                    )}
                    <span className={`text-sm ${task.done ? "text-foreground" : "text-muted-foreground"}`}>
                      {task.text}
                    </span>
                    {task.done && (
                      <span className="ml-auto text-xs text-muted-foreground">已上链 ✓</span>
                    )}
                  </div>
                ))}
              </div>

              {week.tasks.some((t) => !t.done) && (
                <button className="mt-4 w-full py-2.5 rounded-xl bg-primary/10 border border-primary/30 text-primary text-sm font-medium hover:bg-primary/20 transition-colors flex items-center justify-center gap-2">
                  <Target className="w-4 h-4" />
                  提交本周打卡
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Growth;
