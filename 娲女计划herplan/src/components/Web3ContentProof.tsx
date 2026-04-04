import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Lock, 
  ExternalLink, 
  Clock, 
  User,
  Hash,
  CheckCircle
} from "lucide-react";

interface ContentProofProps {
  contentId: string;
  title: string;
  author?: string;
  createdAt?: string;
  isProven?: boolean;
  size?: "small" | "medium";
}

interface ProofInfo {
  blockchainNetwork: string;
  transactionHash: string;
  blockNumber: string;
  timestamp: string;
  ipfsHash?: string;
  smartContractAddress: string;
}

export const Web3ContentProof = ({ 
  contentId, 
  title, 
  author, 
  createdAt,
  isProven = false,
  size = "medium"
}: ContentProofProps) => {
  const [isProving, setIsProving] = useState(false);
  const [proofData, setProofData] = useState<ProofInfo | null>(
    isProven ? {
      blockchainNetwork: "Ethereum",
      transactionHash: "0xabcd1234...ef567890",
      blockNumber: "18,567,892",
      timestamp: "2024-01-15 14:30:25 UTC",
      ipfsHash: "QmX4j2K8...Vy9Rp2",
      smartContractAddress: "0x9876...5432"
    } : null
  );
  const { toast } = useToast();

  const handleProveContent = async () => {
    setIsProving(true);
    
    try {
      // 模拟区块链存证过程
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockProof: ProofInfo = {
        blockchainNetwork: "Ethereum",
        transactionHash: "0x" + Math.random().toString(16).substr(2, 40),
        blockNumber: (18567892 + Math.floor(Math.random() * 1000)).toLocaleString(),
        timestamp: new Date().toISOString().replace('T', ' ').split('.')[0] + ' UTC',
        ipfsHash: "Qm" + Math.random().toString(36).substr(2, 44),
        smartContractAddress: "0x9876543210abcdef9876543210abcdef98765432"
      };
      
      setProofData(mockProof);
      
      toast({
        title: "内容存证成功",
        description: "您的内容已成功记录在区块链上，获得永久的版权保护",
      });
    } catch (error) {
      toast({
        title: "存证失败",
        description: "区块链网络繁忙，请稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsProving(false);
    }
  };

  const handleViewOnChain = () => {
    if (proofData?.transactionHash) {
      toast({
        title: "查看区块链记录",
        description: `打开以太坊浏览器查看交易: ${proofData.transactionHash.slice(0, 10)}...`,
      });
    }
  };

  if (size === "small") {
    return (
      <div className="flex items-center gap-2">
        {proofData ? (
          <Dialog>
            <DialogTrigger asChild>
              <Badge variant="outline" className="cursor-pointer font-fangsong">
                <Shield className="w-3 h-3 mr-1" />
                已存证
              </Badge>
            </DialogTrigger>
            <DialogContent className="ancient-card max-w-md">
              <DialogHeader>
                <DialogTitle className="font-fangsong flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  区块链存证信息
                </DialogTitle>
              </DialogHeader>
              <ProofDetails proofData={proofData} title={title} onViewOnChain={handleViewOnChain} />
            </DialogContent>
          </Dialog>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={handleProveContent}
            disabled={isProving}
            className="font-fangsong"
          >
            <Lock className="w-3 h-3 mr-1" />
            {isProving ? "存证中..." : "链上存证"}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium font-fangsong text-primary">内容溯源</h4>
        {proofData ? (
          <Badge variant="outline" className="font-fangsong">
            <CheckCircle className="w-4 h-4 mr-1" />
            已在链上存证
          </Badge>
        ) : (
          <Badge variant="outline" className="font-fangsong opacity-60">
            <Lock className="w-4 h-4 mr-1" />
            未存证
          </Badge>
        )}
      </div>

      {proofData ? (
        <div className="p-4 bg-green-50/50 border border-green-200 rounded-lg space-y-3">
          <div className="flex items-center gap-2 text-green-700">
            <Shield className="w-5 h-5" />
            <span className="font-medium font-fangsong">内容已受区块链保护</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground font-fangsong">网络:</span>
              <p className="font-medium">{proofData.blockchainNetwork}</p>
            </div>
            <div>
              <span className="text-muted-foreground font-fangsong">区块:</span>
              <p className="font-medium">#{proofData.blockNumber}</p>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground font-fangsong">交易哈希:</span>
              <p className="font-mono text-xs break-all">{proofData.transactionHash}</p>
            </div>
          </div>
          
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleViewOnChain}
            className="w-full font-fangsong"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            在区块浏览器中查看
          </Button>
        </div>
      ) : (
        <div className="p-4 bg-muted/30 border border-border rounded-lg space-y-3">
          <p className="text-sm text-muted-foreground font-fangsong">
            将您的创作内容永久记录在区块链上，获得不可篡改的版权证明
          </p>
          
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4" />
              <span>内容哈希将被计算并上链</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>创作时间将被永久记录</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>作者身份将被验证保护</span>
            </div>
          </div>
          
          <Button 
            onClick={handleProveContent}
            disabled={isProving}
            className="w-full font-fangsong"
          >
            <Lock className="w-4 h-4 mr-2" />
            {isProving ? "正在存证..." : "提交到区块链"}
          </Button>
        </div>
      )}
    </div>
  );
};

const ProofDetails = ({ 
  proofData, 
  title, 
  onViewOnChain 
}: { 
  proofData: ProofInfo; 
  title: string; 
  onViewOnChain: () => void;
}) => {
  return (
    <div className="space-y-4">
      <div className="p-3 bg-green-50 rounded-lg">
        <h5 className="font-medium font-fangsong text-green-800 mb-2">
          《{title}》
        </h5>
        <p className="text-sm text-green-700 font-fangsong">
          此内容已获得区块链永久保护，任何未经授权的使用都可被追溯。
        </p>
      </div>
      
      <div className="space-y-3">
        <div>
          <span className="text-sm font-medium font-fangsong">区块链网络</span>
          <p className="text-sm text-muted-foreground">{proofData.blockchainNetwork}</p>
        </div>
        
        <div>
          <span className="text-sm font-medium font-fangsong">交易哈希</span>
          <p className="text-xs font-mono text-muted-foreground break-all">
            {proofData.transactionHash}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-sm font-medium font-fangsong">区块高度</span>
            <p className="text-sm text-muted-foreground">#{proofData.blockNumber}</p>
          </div>
          <div>
            <span className="text-sm font-medium font-fangsong">上链时间</span>
            <p className="text-sm text-muted-foreground">{proofData.timestamp}</p>
          </div>
        </div>
        
        {proofData.ipfsHash && (
          <div>
            <span className="text-sm font-medium font-fangsong">IPFS 哈希</span>
            <p className="text-xs font-mono text-muted-foreground break-all">
              {proofData.ipfsHash}
            </p>
          </div>
        )}
        
        <div>
          <span className="text-sm font-medium font-fangsong">智能合约</span>
          <p className="text-xs font-mono text-muted-foreground">
            {proofData.smartContractAddress}
          </p>
        </div>
      </div>
      
      <Button 
        onClick={onViewOnChain}
        className="w-full font-fangsong"
      >
        <ExternalLink className="w-4 h-4 mr-2" />
        在区块浏览器中验证
      </Button>
    </div>
  );
};