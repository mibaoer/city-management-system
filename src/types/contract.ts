export type ContractStatus = 'imported' | 'pending_approval' | 'approved' | 'rejected';

export interface ContractStatusHistory {
  status: ContractStatus;
  timestamp: string;
  operator: string;
  message?: string;
  signatureImage?: string;
}

export interface Contract {
  id: string;
  contractNumber: string;
  contractName: string;
  partyB: string;
  amount: string;
  signDate: string;
  expiryDate: string;
  status: ContractStatus;
  remainingDays: string;
  sourceFile?: string;
  sourceFileName?: string;
  approvalMessage?: string;
  qrCode?: string;
  statusHistory: ContractStatusHistory[];
}
