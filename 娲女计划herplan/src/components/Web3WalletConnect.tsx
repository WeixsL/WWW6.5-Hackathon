import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Wallet, User, ChevronDown, LogOut, Shield } from "lucide-react";

interface WalletInfo {
  address: string;
  ensName?: string;
  balance?: string;
}

export const Web3WalletConnect = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const connectWallet = async () => {
    setIsConnecting(true);
    
    // 模拟钱包连接过程
    try {
      // 这里将来会接入真实的Web3钱包
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockWallet = {
        address: "0x1234...5678",
        ensName: "user.eth",
        balance: "2.5 ETH"
      };
      
      setWalletInfo(mockWallet);
      setIsConnected(true);
      
      toast({
        title: "钱包连接成功",
        description: "您已成功连接到Web3钱包",
      });
    } catch (error) {
      toast({
        title: "连接失败",
        description: "请确保您已安装MetaMask钱包",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletInfo(null);
    
    toast({
      title: "钱包已断开",
      description: "您已成功断开钱包连接",
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isConnected && walletInfo) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <div className="flex items-center gap-2 p-2 rounded-lg book-spine cursor-pointer hover:bg-accent/10 transition-colors">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary/10 text-primary">
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col">
              <span className="text-sm font-medium font-fangsong">
                {walletInfo.ensName || formatAddress(walletInfo.address)}
              </span>
              <span className="text-xs text-muted-foreground">
                {walletInfo.balance}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </div>
        </DialogTrigger>
        
        <DialogContent className="ancient-card max-w-md">
          <DialogHeader>
            <DialogTitle className="font-fangsong flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Web3 身份
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-primary/10 text-primary">
                  <User className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium font-fangsong">
                  {walletInfo.ensName || formatAddress(walletInfo.address)}
                </p>
                <p className="text-sm text-muted-foreground">
                  余额：{walletInfo.balance}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium font-fangsong text-primary">已获得徽章</h4>
              <div className="grid grid-cols-3 gap-2">
                <Badge variant="outline" className="justify-center p-2 font-fangsong">
                  🎯 新手
                </Badge>
                <Badge variant="outline" className="justify-center p-2 font-fangsong">
                  📚 阅读者
                </Badge>
                <Badge variant="outline" className="justify-center p-2 font-fangsong opacity-50">
                  ✍️ 创作者
                </Badge>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              onClick={disconnectWallet}
              className="w-full font-fangsong"
            >
              <LogOut className="w-4 h-4 mr-2" />
              断开连接
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Button
      onClick={connectWallet}
      disabled={isConnecting}
      variant="outline"
      size="sm"
      className="font-fangsong book-spine"
    >
      <Wallet className="w-4 h-4 mr-2" />
      {isConnecting ? "连接中..." : "连接钱包"}
    </Button>
  );
};