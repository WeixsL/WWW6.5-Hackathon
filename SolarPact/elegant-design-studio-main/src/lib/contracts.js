import { ethers } from "ethers";

// 替换为你的部署地址
const GOAL_MANAGER_ADDR = "0x..."; 

// 导入 ABI (建议放在 src/lib/abi/GoalManager.json)
import GoalManagerABI from "./abi/GoalManager.json";

export const getGoalManagerContract = async () => {
  if (!window.ethereum) throw new Error("Wallet not found");
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(GOAL_MANAGER_ADDR, GoalManagerABI, signer);
};

export const contractActions = {
  // 发起目标 [cite: 50, 51]
  createGoal: async (desc, duration, milestones, rewardEth) => {
    try {
      const contract = await getGoalManagerContract();
      const tx = await contract.createGoal(desc, duration, milestones, {
        value: ethers.parseEther(rewardEth)
      });
      return await tx.wait(); // [cite: 51]
    } catch (error) {
      console.error("Create Goal Error:", error);
      throw error;
    }
  },

  // 参与竞拍 [cite: 54, 55]
  bid: async (goalId, shareRatio, mode, depositEth) => {
    try {
      const contract = await getGoalManagerContract();
      const tx = await contract.bid(goalId, shareRatio, mode, {
        value: ethers.parseEther(depositEth)
      });
      return await tx.wait(); // [cite: 55]
    } catch (error) {
      console.error("Bid Error:", error);
      throw error;
    }
  },

  // 提交证明 [cite: 64, 65]
  submitProof: async (goalId, proofHash) => {
    try {
      const contract = await getGoalManagerContract();
      const tx = await contract.submitProof(goalId, proofHash);
      return await tx.wait(); // [cite: 66]
    } catch (error) {
      console.error("Submit Proof Error:", error);
      throw error;
    }
  },

  // 仲裁结算 [cite: 77, 79]
  settle: async (goalId, reason) => {
    try {
      const contract = await getGoalManagerContract();
      const tx = await contract.settle(goalId, reason);
      return await tx.wait(); // [cite: 86]
    } catch (error) {
      console.error("Settle Error:", error);
      throw error;
    }
  }
};