"use client";

import {
  useAccount,
  useDisconnect,
  useReadContract,
  useWriteContract,
} from "wagmi";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  LogOut,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Upload,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { internSbtAddress, internSbtAbi } from "@/lib/contract";

const FUJI_CHAIN_ID = 43113;

// TODO: 后端部署后填入真实地址（env: NEXT_PUBLIC_API_BASE）
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

type MintStep =
  | "upload"
  | "verifying"
  | "signing"
  | "minting"
  | "success"
  | "error";

type IssuedCredential = {
  credentialId: string;
  companyId: string;
  companyName: string;
  credentialHash: `0x${string}`;
  expireTime: number; // unix seconds
  signature: `0x${string}`;
};

const STEP_ORDER: Exclude<MintStep, "error">[] = [
  "upload",
  "verifying",
  "signing",
  "minting",
  "success",
];
const STEP_LABELS: Record<Exclude<MintStep, "error">, string> = {
  upload: "上传图片",
  verifying: "AI 验证",
  signing: "获取签名",
  minting: "链上铸造",
  success: "完成",
};

// ── Loading step descriptions ──────────────────────────────
const LOADING_TEXT: Partial<Record<MintStep, { title: string; sub: string }>> =
  {
    verifying: { title: "AI 正在验证 Offer...", sub: "请稍候" },
    signing: { title: "正在获取铸造签名...", sub: "请稍候" },
    minting: {
      title: "请在钱包中确认铸造交易",
      sub: "交易确认后请勿关闭页面",
    },
  };

export function AuthContent() {
  const { address, isConnected, chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const { writeContractAsync } = useWriteContract();
  const router = useRouter();

  const [step, setStep] = useState<MintStep>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Check if user already holds an SBT ────────────────
  const { data: sbtBalance, isLoading: isCheckingSbt } = useReadContract({
    address: internSbtAddress,
    abi: internSbtAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address && chainId === FUJI_CHAIN_ID,
    },
  });

  const hasSBT = sbtBalance !== undefined && sbtBalance > 0n;
  const isWrongChain = isConnected && chainId !== FUJI_CHAIN_ID;

  useEffect(() => {
    if (isConnected && !isCheckingSbt && hasSBT) {
      router.push("/review");
    }
  }, [isConnected, isCheckingSbt, hasSBT, router]);

  // ── File handling ──────────────────────────────────────
  const handleFileSelect = useCallback((selected: File) => {
    if (!selected.type.startsWith("image/")) {
      setErrorMsg("只支持图片格式（JPG / PNG / WebP / GIF）");
      setStep("error");
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setErrorMsg("");
    setStep("upload");
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFileSelect(dropped);
    },
    [handleFileSelect]
  );

  const clearFile = useCallback(() => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [preview]);

  // ── Main mint flow ─────────────────────────────────────
  const handleStartMint = async () => {
    if (!file || !address) return;

    try {
      // Step 1: AI verify offer image
      // TODO: 后端部署后替换为真实接口 POST /api/ai/verify-offer
      // Mock：只要上传了图片即视为验证通过，不发网络请求
      setStep("verifying");
      await new Promise((r) => setTimeout(r, 600));

      // Step 2: Get mint signature from backend
      setStep("signing");
      const signRes = await fetch(`${API_BASE}/api/auth/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userAddress: address }),
      });
      const signData = await signRes.json().catch(() => ({})) as {
        success?: boolean;
        message?: string;
        data?: IssuedCredential;
      };
      if (!signRes.ok || !signData.success || !signData.data) {
        throw new Error(signData.message ?? "获取签名失败，请稍后重试");
      }
      const cred = signData.data;

      // Step 3: Mint SBT on-chain
      setStep("minting");
      await writeContractAsync({
        address: internSbtAddress,
        abi: internSbtAbi,
        functionName: "mintSBT",
        args: [
          cred.credentialId,
          cred.companyId,
          cred.credentialHash,
          BigInt(cred.expireTime),
          cred.signature,
        ],
      });

      setStep("success");
      setTimeout(() => router.push("/review"), 2000);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "发生未知错误，请重试"
      );
      setStep("error");
    }
  };

  // ── Step progress indicator ────────────────────────────
  const activeIndex = STEP_ORDER.indexOf(
    (step === "error" ? "upload" : step) as Exclude<MintStep, "error">
  );

  const StepBar = () => (
    <div className="flex items-start">
      {STEP_ORDER.map((s, i) => {
        const done = i < activeIndex;
        const current = i === activeIndex;
        return (
          <div key={s} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              {i > 0 && (
                <div
                  className={`h-px flex-1 transition-colors ${
                    i <= activeIndex ? "bg-accent" : "bg-border/60"
                  }`}
                />
              )}
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
                  done
                    ? "bg-accent text-accent-foreground"
                    : current
                    ? "bg-accent/25 ring-2 ring-accent/40 text-accent-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {done ? "✓" : i + 1}
              </div>
              {i < STEP_ORDER.length - 1 && (
                <div
                  className={`h-px flex-1 transition-colors ${
                    i < activeIndex ? "bg-accent" : "bg-border/60"
                  }`}
                />
              )}
            </div>
            <span
              className={`mt-1 text-[10px] leading-tight ${
                current
                  ? "font-medium text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {STEP_LABELS[s]}
            </span>
          </div>
        );
      })}
    </div>
  );

  // ══════════════════════════════════════════════════════
  // Render: states before reaching the mint flow
  // ══════════════════════════════════════════════════════

  if (!isConnected) {
    return (
      <Card className="space-y-6 border-border/80 p-6">
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">
            请连接你的钱包，系统将自动检查你是否持有实习凭证（SBT）。
          </p>
        </div>
        <div className="flex justify-center">
          <ConnectButton />
        </div>
      </Card>
    );
  }

  if (isWrongChain) {
    return (
      <Card className="space-y-6 border-border/80 p-6">
        <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-4 dark:bg-amber-950/20">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
              请切换到 Avalanche Fuji 测试网
            </p>
            <p className="text-xs text-amber-600/80 dark:text-amber-400/80">
              当前网络 (chainId {chainId}) 不受支持。合约部署在 Avalanche Fuji
              (43113)。
            </p>
          </div>
        </div>
        <div className="flex justify-center">
          <ConnectButton />
        </div>
        <Button
          variant="outline"
          className="w-full border-border/80 text-destructive hover:bg-destructive/5 hover:text-destructive"
          onClick={() => disconnect()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          断开钱包连接
        </Button>
      </Card>
    );
  }

  if (isCheckingSbt) {
    return (
      <Card className="space-y-6 border-border/80 p-6">
        <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">正在检查凭证...</p>
            <p className="text-xs text-muted-foreground">
              正在查询链上 SBT 持有状态
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full border-border/80 text-destructive hover:bg-destructive/5 hover:text-destructive"
          onClick={() => disconnect()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          断开钱包连接
        </Button>
      </Card>
    );
  }

  if (hasSBT) {
    return (
      <Card className="space-y-6 border-border/80 p-6">
        <div className="flex items-center gap-3 rounded-lg bg-green-50 p-4 dark:bg-green-950/20">
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
          <div>
            <p className="text-sm font-medium text-green-700 dark:text-green-300">
              凭证验证成功
            </p>
            <p className="text-xs text-green-600/80 dark:text-green-400/80">
              正在跳转到评价页面...
            </p>
          </div>
        </div>
        <Button className="w-full" onClick={() => router.push("/review")}>
          前往提交评价
        </Button>
      </Card>
    );
  }

  // ══════════════════════════════════════════════════════
  // Render: mint flow (no SBT detected)
  // ══════════════════════════════════════════════════════
  const loadingInfo = LOADING_TEXT[step];

  return (
    <Card className="space-y-6 border-border/80 p-6">
      {/* Header */}
      <div>
        <h3 className="text-sm font-semibold">铸造实习凭证（SBT）</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          上传你的实习 Offer 截图，完成 AI 验证后即可在链上铸造凭证
        </p>
      </div>

      <StepBar />

      {/* ── Upload / Error state ── */}
      {(step === "upload" || step === "error") && (
        <>
          {/* Drop zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
              isDragging
                ? "border-accent bg-accent/5"
                : "border-border/80 hover:border-accent/50 hover:bg-muted/30"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileSelect(f);
              }}
            />
            {preview ? (
              <div className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Offer 预览"
                  className="max-h-44 rounded object-contain"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFile();
                  }}
                  className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Upload className="h-8 w-8" />
                <p className="text-sm">点击或拖拽上传 Offer 截图</p>
                <p className="text-xs">支持 JPG / PNG / WebP，最大 10MB</p>
              </div>
            )}
          </div>

          {/* Error banner */}
          {step === "error" && errorMsg && (
            <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <Button
            className="w-full"
            disabled={!file}
            onClick={handleStartMint}
          >
            提交验证并铸造 SBT
          </Button>
        </>
      )}

      {/* ── Loading states (verifying / signing / minting) ── */}
      {loadingInfo && (
        <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
          <Loader2 className="h-5 w-5 shrink-0 animate-spin text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">{loadingInfo.title}</p>
            <p className="text-xs text-muted-foreground">{loadingInfo.sub}</p>
          </div>
        </div>
      )}

      {/* ── Success ── */}
      {step === "success" && (
        <div className="flex items-center gap-3 rounded-lg bg-green-50 p-4 dark:bg-green-950/20">
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
          <div>
            <p className="text-sm font-medium text-green-700 dark:text-green-300">
              SBT 铸造成功！
            </p>
            <p className="text-xs text-green-600/80 dark:text-green-400/80">
              正在跳转到评价页面...
            </p>
          </div>
        </div>
      )}

      {/* ── Disconnect (hidden while tx is pending or done) ── */}
      {step !== "minting" && step !== "success" && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground hover:text-destructive"
          onClick={() => disconnect()}
        >
          <LogOut className="mr-2 h-3.5 w-3.5" />
          断开钱包连接
        </Button>
      )}
    </Card>
  );
}
