import { Request, Response } from 'express';
import { prisma } from '../app';

export const generateReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type } = req.params;

    let csvContent = "";
    
    switch (type) {
      case 'inventory':
        const inventory = await prisma.bloodUnit.findMany({
          include: { collectionCenter: true }
        });
        csvContent = "Unit Number,Blood Group,Status,Center,Expiry Date\n";
        inventory.forEach(unit => {
          csvContent += `${unit.unitNumber},${unit.bloodGroup},${unit.status},${unit.collectionCenter?.name || 'Unknown'},${unit.expiryDate?.toISOString().split('T')[0]}\n`;
        });
        break;

      case 'donors':
        const donors = await prisma.donor.findMany({
          include: { user: true }
        });
        csvContent = "Donor Number,Name,Blood Group,Age,Gender,Verification Status\n";
        donors.forEach(donor => {
          csvContent += `${donor.donorNumber},${donor.user.name},${donor.bloodGroup},${donor.age},${donor.gender},${donor.verificationStatus}\n`;
        });
        break;

      case 'collections':
        const donations = await prisma.donation.findMany({
          include: { 
            visit: { include: { appointment: { include: { donor: { include: { user: true } } } } } },
            collectionRecord: true
          }
        });
        csvContent = "Donation Number,Donor Name,Blood Group,Date,Volume,Status\n";
        donations.forEach(donation => {
          const donor = donation.visit.appointment.donor;
          csvContent += `${donation.donationNumber},${donor.user.name},${donor.bloodGroup},${donation.collectionDate.toISOString().split('T')[0]},${donation.collectionRecord?.actualVolumeCollected || 'N/A'},${donation.status}\n`;
        });
        break;

      case 'hospitals':
        const requests = await prisma.bloodRequest.findMany({
          include: { hospital: true, bloodIssues: true }
        });
        csvContent = "Request Number,Hospital,Blood Group,Units Required,Units Fulfilled,Urgency,Status,Date\n";
        requests.forEach(req => {
          csvContent += `${req.requestNumber},${req.hospital.name},${req.bloodGroup},${req.quantity},${req.bloodIssues.length},${req.urgency},${req.status},${req.requestedAt.toISOString().split('T')[0]}\n`;
        });
        break;
        
      default:
        res.status(400).json({ error: 'Invalid report type' });
        return;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${type}_report_${new Date().toISOString().split('T')[0]}.csv`);
    res.status(200).send(csvContent);

  } catch (error) {
    console.error("REPORT GENERATION ERROR:", error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};
