import type { Metadata } from "next";
import { AuthContent } from "./_components/AuthContent";

export const metadata: Metadata = {
  title: "登录",
};

export default function AuthPage() {
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">身份验证</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        连接钱包后系统自动验证 SBT，若未持有将引导你上传 Offer 完成铸造。
      </p>
      <div className="mt-8">
        <AuthContent />
      </div>
    </div>
  );
}
