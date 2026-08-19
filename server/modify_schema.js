const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// Update User
schema = schema.replace('staffTests LabReport[] @relation("StaffTests")',
`staffTests LabReport[] @relation("StaffTests")
  labSessions LaboratorySession[]
  testResults LaboratoryTestResult[]
  amendedReports LabReportVersion[]
  verifiedReports LabReport[] @relation("ReportVerifiers")
  createdLabExceptions LabException[] @relation("ExceptionCreators")
  resolvedLabExceptions LabException[] @relation("ExceptionResolvers")`);

// Update BloodUnit
schema = schema.replace('issue            BloodIssue?',
`issue            BloodIssue?
  labSessions      LaboratorySession[]
  testResults      LaboratoryTestResult[]
  labExceptions    LabException[]`);

// Replace LabReport and add new models
const labReportRegex = /model LabReport \{[\s\S]*?\}(?=\s*model InventoryTransaction)/;

const newModels = `
model LabReport {
  id                  String       @id @default(uuid())
  reportNumber        String       @unique
  bloodUnitId         String       @unique
  bloodUnit           BloodUnit    @relation(fields: [bloodUnitId], references: [id])
  
  labSessionId        String?      @unique
  labSession          LaboratorySession? @relation(fields: [labSessionId], references: [id])
  
  technicianId        String?
  technician          User?        @relation("StaffTests", fields: [technicianId], references: [id])
  
  testResults         Json         // Legacy or fast access structured results
  internalRemarks     String?
  internalReason      String?
  donorFacingReason   String?
  
  decision            String       @default("PENDING") // PENDING, APPROVED, REJECTED
  status              String       @default("DRAFT")   // DRAFT, FINALIZED, AMENDED
  reportVersion       Int          @default(1)
  
  verifiedById        String?
  verifiedBy          User?        @relation("ReportVerifiers", fields: [verifiedById], references: [id])
  verifiedAt          DateTime?
  
  documentStoragePath String?
  
  generatedAt         DateTime     @default(now())
  createdAt           DateTime     @default(now())
  updatedAt           DateTime     @updatedAt

  versions            LabReportVersion[]
}

model LaboratorySession {
  id            String       @id @default(uuid())
  sessionId     String       @unique
  bloodUnitId   String
  bloodUnit     BloodUnit    @relation(fields: [bloodUnitId], references: [id])
  stickerId     String
  
  technicianId  String
  technician    User         @relation(fields: [technicianId], references: [id])
  centerId      String
  center        BloodBank    @relation(fields: [centerId], references: [id])
  
  status        String       @default("IN_PROGRESS") // NOT_STARTED, IN_PROGRESS, COMPLETED, CANCELLED
  startedAt     DateTime     @default(now())
  completedAt   DateTime?
  
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  results       LaboratoryTestResult[]
  labReport     LabReport?
  exceptions    LabException[]
}

model LaboratoryTest {
  id                   String     @id @default(uuid())
  testCode             String     @unique
  testName             String
  category             String
  resultType           String     // TEXT, NUMERIC, QUALITATIVE, ENUM, BOOLEAN
  unit                 String?
  referenceInformation String?
  isRequired           Boolean    @default(true)
  isActive             Boolean    @default(true)
  
  createdAt            DateTime   @default(now())
  updatedAt            DateTime   @updatedAt

  results              LaboratoryTestResult[]
}

model LaboratoryTestResult {
  id             String             @id @default(uuid())
  labSessionId   String
  labSession     LaboratorySession  @relation(fields: [labSessionId], references: [id], onDelete: Cascade)
  bloodUnitId    String
  bloodUnit      BloodUnit          @relation(fields: [bloodUnitId], references: [id], onDelete: Cascade)
  testId         String
  test           LaboratoryTest     @relation(fields: [testId], references: [id])
  
  resultValue    String
  resultStatus   String             // NORMAL, ABNORMAL, POSITIVE, NEGATIVE, INCONCLUSIVE
  remarks        String?
  
  performedById  String
  performedBy    User               @relation(fields: [performedById], references: [id])
  performedAt    DateTime           @default(now())
  
  createdAt      DateTime           @default(now())
  updatedAt      DateTime           @updatedAt
}

model LabReportVersion {
  id             String       @id @default(uuid())
  labReportId    String
  labReport      LabReport    @relation(fields: [labReportId], references: [id], onDelete: Cascade)
  versionNumber  Int
  testResults    Json
  decision       String
  internalRemarks String?
  amendedById    String
  amendedBy      User         @relation(fields: [amendedById], references: [id])
  amendedAt      DateTime     @default(now())
  reasonForAmendment String
}

model LabException {
  id             String             @id @default(uuid())
  exceptionId    String             @unique
  bloodUnitId    String?
  bloodUnit      BloodUnit?         @relation(fields: [bloodUnitId], references: [id])
  stickerId      String?
  labSessionId   String?
  labSession     LaboratorySession? @relation(fields: [labSessionId], references: [id])
  
  type           String             // BARCODE_UNREADABLE, STICKER_MISMATCH, MISSING_SAMPLE, etc.
  description    String
  status         String             @default("OPEN") // OPEN, UNDER_REVIEW, RESOLVED, CANCELLED
  
  createdById    String
  createdBy      User               @relation("ExceptionCreators", fields: [createdById], references: [id])
  resolvedById   String?
  resolvedBy     User?              @relation("ExceptionResolvers", fields: [resolvedById], references: [id])
  resolvedAt     DateTime?
  resolution     String?
  
  createdAt      DateTime           @default(now())
  updatedAt      DateTime           @updatedAt
}
`;

schema = schema.replace(labReportRegex, newModels);
fs.writeFileSync('prisma/schema.prisma', schema);
console.log('Schema updated successfully');
