import { Request, Response } from 'express';
import { prisma } from '../server';

export const getDonorMilestones = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = (req as any).user;
    const donor = await prisma.donor.findUnique({ where: { userId } });
    
    if (!donor) {
      res.status(404).json({ error: 'Donor not found' });
      return;
    }

    // 1. Calculate strictly verified donations
    const completedDonations = await prisma.donation.count({
      where: {
        visit: { appointment: { donorId: donor.id } },
        status: { in: ['OTP_VERIFIED'] } // Strict requirement
      }
    });

    // 2. Fetch all defined milestones, ordered by required donations
    const allMilestones = await prisma.donorMilestone.findMany({
      orderBy: { requiredDonations: 'asc' },
      include: {
        rewards: true
      }
    });

    // 3. Check and unlock if needed
    for (const milestone of allMilestones) {
      if (completedDonations >= milestone.requiredDonations) {
        // Unlock if not already unlocked
        await prisma.donorMilestoneAchievement.upsert({
          where: {
            donorId_milestoneId: {
              donorId: donor.id,
              milestoneId: milestone.id
            }
          },
          update: {},
          create: {
            donorId: donor.id,
            milestoneId: milestone.id,
            donationCountAtUnlock: completedDonations
          }
        });

        // Also make physical rewards eligible if not already claimed
        for (const reward of milestone.rewards) {
          if (reward.rewardType === 'PHYSICAL') {
             const existingClaim = await prisma.rewardClaim.findFirst({
               where: { donorId: donor.id, rewardId: reward.id }
             });
             
             if (!existingClaim) {
               await prisma.rewardClaim.create({
                 data: {
                   donorId: donor.id,
                   milestoneId: milestone.id,
                   rewardId: reward.id,
                   status: reward.stockQuantity > 0 ? 'ELIGIBLE' : 'OUT_OF_STOCK'
                 }
               });
             }
          }
        }
      }
    }

    // 4. Return the data to the frontend
    const achievements = await prisma.donorMilestoneAchievement.findMany({
      where: { donorId: donor.id },
      include: { milestone: { include: { rewards: true } } }
    });

    const rewardClaims = await prisma.rewardClaim.findMany({
      where: { donorId: donor.id },
      include: { reward: true }
    });

    // Determine current level and next level strictly based on the 1, 5, 10, 25 thresholds
    let currentLevel = null;
    let nextLevel = allMilestones[0];
    
    for (const m of allMilestones) {
      if (completedDonations >= m.requiredDonations) {
        currentLevel = m;
      } else {
        nextLevel = m;
        break;
      }
    }
    
    if (currentLevel && currentLevel.requiredDonations === 25) {
       nextLevel = null as any; // Legend is the highest
    }

    res.json({
      verifiedDonations: completedDonations,
      currentLevel,
      nextLevel,
      achievements,
      rewardClaims,
      allMilestones
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch milestones' });
  }
};

export const claimReward = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = (req as any).user;
    const { claimId, tshirtSize } = req.body;
    
    const donor = await prisma.donor.findUnique({ where: { userId } });
    if (!donor) {
      res.status(404).json({ error: 'Donor not found' });
      return;
    }

    const claim = await prisma.rewardClaim.findUnique({
      where: { id: claimId },
      include: { reward: true }
    });

    if (!claim || claim.donorId !== donor.id) {
      res.status(404).json({ error: 'Reward claim not found' });
      return;
    }

    if (claim.status !== 'ELIGIBLE') {
      res.status(400).json({ error: 'Reward is not eligible for claiming' });
      return;
    }

    if (claim.reward.stockQuantity <= 0) {
      // Stock went to 0 before they clicked claim
      await prisma.rewardClaim.update({
        where: { id: claimId },
        data: { status: 'OUT_OF_STOCK' }
      });
      res.status(400).json({ error: 'Reward is out of stock' });
      return;
    }

    // Deduct stock and update claim
    await prisma.$transaction([
      prisma.milestoneReward.update({
        where: { id: claim.rewardId },
        data: { stockQuantity: { decrement: 1 } }
      }),
      prisma.rewardClaim.update({
        where: { id: claimId },
        data: { 
          status: 'CLAIMED',
          claimedAt: new Date(),
          tshirtSize: tshirtSize || null
        }
      })
    ]);

    res.json({ success: true, message: 'Reward claimed successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to claim reward' });
  }
};

export const getAdminRewards = async (req: Request, res: Response): Promise<void> => {
  try {
    const rewards = await prisma.milestoneReward.findMany({
      include: { milestone: true }
    });
    res.json(rewards);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rewards' });
  }
};

export const updateRewardStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { stockQuantity } = req.body;
    
    const updated = await prisma.milestoneReward.update({
      where: { id },
      data: { stockQuantity }
    });

    // Check if we can change OUT_OF_STOCK claims back to ELIGIBLE
    if (stockQuantity > 0) {
      await prisma.rewardClaim.updateMany({
        where: { rewardId: id, status: 'OUT_OF_STOCK' },
        data: { status: 'ELIGIBLE' }
      });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update stock' });
  }
};
