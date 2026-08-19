import { prisma } from './src/server';

async function run() {
  try {
    const visit = await prisma.visit.findFirst({ where: { visitNumber: "VIS-2026-000006" }, include: { appointment: true } });
    if (!visit) { console.log("Visit not found"); return; }
    
    console.log("Found visit:", visit.id);
    
    // Simulate startCollection transaction
    const userId = "SYSTEM"; // wait, let's test what happened
    const result = await prisma.$transaction(async (tx) => {
        let onDemandBatch = await tx.bloodBagLabelBatch.findFirst({
          where: { centerId: visit.appointment.bloodBankId, batchNumber: 'ON-DEMAND-PRINT' }
        });
        if (!onDemandBatch) {
          onDemandBatch = await tx.bloodBagLabelBatch.create({
            data: {
              batchNumber: 'ON-DEMAND-PRINT',
              centerId: visit.appointment.bloodBankId,
              prefix: 'STK',
              startNumber: 1,
              endNumber: 999999,
              quantity: 999999,
              status: 'ACTIVE',
              createdById: visit.appointment.donorId // fallback
            }
          });
        }
  
        const stickerIdStr = `STK-${Date.now()}`;
        const label = await tx.bloodBagLabel.create({
          data: {
            stickerId: stickerIdStr,
            batchId: onDemandBatch.id,
            centerId: visit.appointment.bloodBankId,
            status: 'ASSIGNED',
            assignedAt: new Date()
          }
        });
  
        const donation = await tx.donation.create({
          data: {
            donationNumber: `DON-${Date.now()}`,
            visitId: visit.id,
            collectionDate: new Date(),
            collectionStartTime: new Date(),
            status: 'COLLECTION_STARTED',
            stickerId: label.id
          }
        });
        return { label, donation };
    });
    console.log("Success:", result);
  } catch(e) {
    console.error("Error:", e);
  }
}
run();
