import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Upload, FileText, CheckCircle, XCircle, Clock,
  Search, Filter, Eye, Edit3, Shield, EyeOff
} from 'lucide-react';
import { Contract, ContractStatus } from '@/types/contract';
import { toast } from 'sonner';

function generateContractNumber(): string {
  const seq = String(Date.now()).slice(-6);
  return `CT${seq}`;
}

function calculateRemainingDays(expiryDate: string): string {
  const days = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return days >= 0 ? `${days}天` : `${days}天`;
}

const STATUS_LABELS: Record<ContractStatus, string> = {
  imported: '已导入',
  pending_approval: '待审批',
  approved: '已归档',
  rejected: '已驳回',
};

const STATUS_COLORS: Record<ContractStatus, string> = {
  imported: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  pending_approval: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  approved: 'bg-green-500/20 text-green-400 border border-green-500/30',
  rejected: 'bg-red-500/20 text-red-400 border border-red-500/30',
};

const SEED_CONTRACTS: Contract[] = [
  {
    id: 'seed-1', contractNumber: 'CT001', contractName: '保洁服务合同',
    partyB: 'XX保洁公司', amount: '50万元', signDate: '2023-01-01',
    expiryDate: '2024-06-30', status: 'pending_approval', remainingDays: '178天',
    statusHistory: [],
  },
  {
    id: 'seed-2', contractNumber: 'CT002', contractName: '市政维护合同',
    partyB: 'XX市政公司', amount: '80万元', signDate: '2023-03-01',
    expiryDate: '2024-02-28', status: 'pending_approval', remainingDays: '-30天',
    statusHistory: [],
  },
  {
    id: 'seed-3', contractNumber: 'CT003', contractName: '垃圾清运合同',
    partyB: 'XX清运公司', amount: '30万元', signDate: '2023-05-01',
    expiryDate: '2024-04-30', status: 'pending_approval', remainingDays: '-15天',
    statusHistory: [],
  },
  {
    id: 'seed-4', contractNumber: 'CT004', contractName: '绿化养护合同',
    partyB: 'XX绿化公司', amount: '40万元', signDate: '2023-07-01',
    expiryDate: '2024-06-30', status: 'pending_approval', remainingDays: '178天',
    statusHistory: [],
  },
  {
    id: 'seed-5', contractNumber: 'CT005', contractName: '设备采购合同',
    partyB: 'XX设备公司', amount: '20万元', signDate: '2023-09-01',
    expiryDate: '2024-08-31', status: 'pending_approval', remainingDays: '230天',
    statusHistory: [],
  },
];

const AI_TEMPLATES = [
  { keyword: '保洁', name: '保洁服务合同', partyB: 'XX保洁服务有限公司', amount: '50万元' },
  { keyword: '市政', name: '市政维护合同', partyB: 'XX市政工程有限公司', amount: '80万元' },
  { keyword: '垃圾', name: '垃圾清运合同', partyB: 'XX环境清运有限公司', amount: '30万元' },
  { keyword: '绿化', name: '绿化养护合同', partyB: 'XX园林绿化有限公司', amount: '40万元' },
  { keyword: '设备', name: '设备采购合同', partyB: 'XX设备有限公司', amount: '20万元' },
  { keyword: '物业', name: '物业管理合同', partyB: 'XX物业管理有限公司', amount: '35万元' },
  { keyword: '安保', name: '安保服务合同', partyB: 'XX安保服务有限公司', amount: '25万元' },
];

export default function ContractManagementPage() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'approval'>('list');
  const [searchText, setSearchText] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  // Import modal state
  const [importFile, setImportFile] = useState<string | null>(null);
  const [importFileName, setImportFileName] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedContract, setParsedContract] = useState<Partial<Contract> | null>(null);
  const [editForm, setEditForm] = useState({
    contractName: '', partyB: '', amount: '', signDate: '', expiryDate: '',
  });

  // Approval modal state
  const [approvalMessage, setApprovalMessage] = useState('');
  const [signatureImage, setSignatureImage] = useState('');
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null);

  // 审批管理筛选状态
  const [approvalSearchText, setApprovalSearchText] = useState('');
  const [approvalFilterStatus, setApprovalFilterStatus] = useState<'all' | 'pending_approval' | 'rejected'>('all');
  const [approvalDateFrom, setApprovalDateFrom] = useState('');
  const [approvalDateTo, setApprovalDateTo] = useState('');

  // Load contracts from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('contracts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Contract[];
        setContracts(parsed);
      } catch {
        setContracts(SEED_CONTRACTS);
        localStorage.setItem('contracts', JSON.stringify(SEED_CONTRACTS));
      }
    } else {
      setContracts(SEED_CONTRACTS);
      localStorage.setItem('contracts', JSON.stringify(SEED_CONTRACTS));
    }
  }, []);

  // Save contracts to localStorage
  useEffect(() => {
    if (contracts.length > 0) {
      localStorage.setItem('contracts', JSON.stringify(contracts));
    }
  }, [contracts]);

  const filteredContracts = contracts.filter(c => {
    const matchSearch = !searchText ||
      c.contractNumber.toLowerCase().includes(searchText.toLowerCase()) ||
      c.contractName.includes(searchText) ||
      c.partyB.includes(searchText);
    if (activeTab === 'approval') {
      if (c.status !== 'pending_approval' && c.status !== 'rejected') return false;
      const matchApprovalSearch = !approvalSearchText ||
        c.contractNumber.toLowerCase().includes(approvalSearchText.toLowerCase()) ||
        c.contractName.includes(approvalSearchText) ||
        c.partyB.includes(approvalSearchText);
      const matchApprovalStatus = approvalFilterStatus === 'all' || c.status === approvalFilterStatus;
      const matchDateFrom = !approvalDateFrom || c.signDate >= approvalDateFrom;
      const matchDateTo = !approvalDateTo || c.signDate <= approvalDateTo;
      return matchApprovalSearch && matchApprovalStatus && matchDateFrom && matchDateTo;
    }
    return matchSearch;
  });

  // 重置审批筛选
  const resetApprovalFilter = () => {
    setApprovalSearchText('');
    setApprovalFilterStatus('all');
    setApprovalDateFrom('');
    setApprovalDateTo('');
  };

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('仅支持 PDF、JPG、PNG 格式文件');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('文件大小不能超过 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && typeof event.target.result === 'string') {
        setImportFile(event.target.result);
        setImportFileName(file.name);
        // Start AI parsing simulation
        setIsParsing(true);
        setParsedContract(null);
        setTimeout(() => {
          const template = AI_TEMPLATES.find(t => file.name.includes(t.keyword)) || AI_TEMPLATES[0];
          const today = new Date().toISOString().split('T')[0];
          const expiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          setParsedContract({
            contractNumber: generateContractNumber(),
            contractName: template.name,
            partyB: template.partyB,
            amount: template.amount,
            signDate: today,
            expiryDate: expiry,
          });
          setEditForm({
            contractName: template.name,
            partyB: template.partyB,
            amount: template.amount,
            signDate: today,
            expiryDate: expiry,
          });
          setIsParsing(false);
        }, 2000);
      }
    };
    reader.readAsDataURL(file);
  };

  const confirmImport = () => {
    if (!parsedContract) return;
    const newContract: Contract = {
      id: `contract-${Date.now()}`,
      contractNumber: parsedContract.contractNumber || generateContractNumber(),
      contractName: editForm.contractName || '未知合同',
      partyB: editForm.partyB || '',
      amount: editForm.amount || '',
      signDate: editForm.signDate || '',
      expiryDate: editForm.expiryDate || '',
      status: 'imported',
      remainingDays: calculateRemainingDays(editForm.expiryDate || ''),
      sourceFile: importFile || undefined,
      sourceFileName: importFileName,
      statusHistory: [{
        status: 'imported',
        timestamp: new Date().toLocaleString('zh-CN'),
        operator: '系统',
        message: 'AI 解析导入',
      }],
    };
    setContracts(prev => [...prev, newContract]);
    toast.success('合同导入成功');
    resetImportModal();
    setShowImportModal(false);
  };

  const resetImportModal = () => {
    setImportFile(null);
    setImportFileName('');
    setIsParsing(false);
    setParsedContract(null);
    setEditForm({ contractName: '', partyB: '', amount: '', signDate: '', expiryDate: '' });
  };

  const openApprovalModal = (contract: Contract, action: 'approve' | 'reject') => {
    setSelectedContract(contract);
    setApprovalAction(action);
    setApprovalMessage('');
    setSignatureImage('');
    setShowApprovalModal(true);
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          setSignatureImage(event.target.result);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const submitApproval = () => {
    if (!selectedContract || !approvalAction) return;
    if (!signatureImage) {
      toast.error('请上传签名');
      return;
    }
    if (!approvalMessage.trim()) {
      toast.error('请填写审批意见');
      return;
    }

    const newStatus: ContractStatus = approvalAction === 'approve' ? 'approved' : 'rejected';
    const updatedContracts = contracts.map(c => {
      if (c.id === selectedContract.id) {
        return {
          ...c,
          status: newStatus,
          approvalMessage,
          statusHistory: [
            ...c.statusHistory,
            {
              status: newStatus,
              timestamp: new Date().toLocaleString('zh-CN'),
              operator: '管理员',
              message: approvalMessage,
              signatureImage,
            },
          ],
        };
      }
      return c;
    });
    setContracts(updatedContracts);
    toast.success(approvalAction === 'approve' ? '审批通过，合同已归档' : '合同已驳回');
    setShowApprovalModal(false);
    setSelectedContract(null);
    setSignatureImage('');
    setApprovalMessage('');
    setApprovalAction(null);
  };

  const submitForApproval = (contract: Contract) => {
    const updated = contracts.map(c => {
      if (c.id === contract.id) {
        return {
          ...c,
          status: 'pending_approval' as ContractStatus,
          statusHistory: [
            ...c.statusHistory,
            {
              status: 'pending_approval',
              timestamp: new Date().toLocaleString('zh-CN'),
              operator: '管理员',
              message: '提交审批',
            },
          ],
        };
      }
      return c;
    });
    setContracts(updated);
    toast.success('已提交审批');
  };

  const resubmitRejected = (contract: Contract) => {
    submitForApproval(contract);
  };

  const statusBadge = (status: ContractStatus) => (
    <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );

  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      {/* Header */}
      <div className="bg-[#0e2a47] border-b border-[#1e4976] px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin')}
            className="p-2 hover:bg-[#1e4976] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#00e5ff]" />
          </button>
          <h1 className="text-xl font-bold text-[#00e5ff]">审批管理</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4 flex gap-2">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'list'
              ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/40'
              : 'bg-[#0e2a47] text-gray-400 border border-[#1e4976] hover:text-white'
          }`}
        >
          合同列表
        </button>
        <button
          onClick={() => setActiveTab('approval')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'approval'
              ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/40'
              : 'bg-[#0e2a47] text-gray-400 border border-[#1e4976] hover:text-white'
          }`}
        >
          审批管理
          {contracts.filter(c => c.status === 'pending_approval' || c.status === 'rejected').length > 0 && (
            <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
              {contracts.filter(c => c.status === 'pending_approval' || c.status === 'rejected').length}
            </span>
          )}
        </button>
      </div>

      {/* 合同列表筛选 */}
      {activeTab === 'list' && (
        <div className="px-6 py-4 flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              placeholder="搜索合同编号、名称、乙方..."
              className="w-full pl-10 pr-4 py-2 bg-[#0e2a47] border border-[#1e4976] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00e5ff]"
            />
          </div>
          <button
            onClick={() => { resetImportModal(); setShowImportModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#00e5ff] text-[#0a1628] rounded-lg text-sm font-medium hover:bg-[#00e5ff]/90 transition-colors"
          >
            <Upload className="w-4 h-4" />
            导入合同
          </button>
        </div>
      )}

      {/* 审批管理筛选 */}
      {activeTab === 'approval' && (
        <div className="px-6 py-4 space-y-3">
          <div className="grid grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-xs text-gray-400 mb-1">关键词搜索</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  value={approvalSearchText}
                  onChange={e => setApprovalSearchText(e.target.value)}
                  placeholder="合同编号、名称、乙方"
                  className="w-full pl-8 pr-3 py-2 bg-[#0e2a47] border border-[#1e4976] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00e5ff]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">审批状态</label>
              <select
                value={approvalFilterStatus}
                onChange={e => setApprovalFilterStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#0e2a47] border border-[#1e4976] rounded-lg text-sm text-white focus:outline-none focus:border-[#00e5ff]"
              >
                <option value="all">全部</option>
                <option value="pending_approval">待审批</option>
                <option value="rejected">已驳回</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">签订日期起</label>
              <input
                type="date"
                value={approvalDateFrom}
                onChange={e => setApprovalDateFrom(e.target.value)}
                className="w-full px-3 py-2 bg-[#0e2a47] border border-[#1e4976] rounded-lg text-sm text-white focus:outline-none focus:border-[#00e5ff]"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs text-gray-400 mb-1">签订日期止</label>
                <input
                  type="date"
                  value={approvalDateTo}
                  onChange={e => setApprovalDateTo(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0e2a47] border border-[#1e4976] rounded-lg text-sm text-white focus:outline-none focus:border-[#00e5ff]"
                />
              </div>
              <button
                onClick={resetApprovalFilter}
                className="px-3 py-2 bg-[#1e4976] border border-[#1e4976] text-white rounded-lg hover:bg-[#2d5a8a] transition-colors text-sm whitespace-nowrap self-end"
              >
                重置
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="px-6 pb-6">
        <div className="bg-[#0e2a47] border border-[#1e4976] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#0a1628]/50 border-b border-[#1e4976]">
                <th className="px-4 py-3 text-left text-gray-400 font-medium">合同编号</th>
                <th className="px-4 py-3 text-left text-gray-400 font-medium">合同名称</th>
                <th className="px-4 py-3 text-left text-gray-400 font-medium">乙方</th>
                <th className="px-4 py-3 text-left text-gray-400 font-medium">金额</th>
                <th className="px-4 py-3 text-left text-gray-400 font-medium">签订日期</th>
                <th className="px-4 py-3 text-left text-gray-400 font-medium">到期日期</th>
                <th className="px-4 py-3 text-left text-gray-400 font-medium">剩余天数</th>
                <th className="px-4 py-3 text-left text-gray-400 font-medium">状态</th>
                <th className="px-4 py-3 text-left text-gray-400 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    暂无数据
                  </td>
                </tr>
              ) : (
                filteredContracts.map(contract => (
                  <tr
                    key={contract.id}
                    className="border-b border-[#1e4976]/50 hover:bg-[#1e4976]/10 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-[#00e5ff]">{contract.contractNumber}</td>
                    <td className="px-4 py-3">{contract.contractName}</td>
                    <td className="px-4 py-3">{contract.partyB}</td>
                    <td className="px-4 py-3 text-[#00e5ff]">{contract.amount}</td>
                    <td className="px-4 py-3">{contract.signDate}</td>
                    <td className="px-4 py-3">{contract.expiryDate}</td>
                    <td className={`px-4 py-3 ${parseInt(contract.remainingDays) < 0 ? 'text-red-400' : ''}`}>
                      {contract.remainingDays}
                    </td>
                    <td className="px-4 py-3">{statusBadge(contract.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setSelectedContract(contract); setShowDetailModal(true); }}
                          className="p-1.5 hover:bg-[#1e4976] rounded transition-colors"
                          title="查看详情"
                        >
                          <Eye className="w-4 h-4 text-[#00e5ff]" />
                        </button>
                        {activeTab === 'list' && contract.status === 'imported' && (
                          <button
                            onClick={() => submitForApproval(contract)}
                            className="px-2 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded text-xs hover:bg-yellow-500/30 transition-colors"
                          >
                            提交审批
                          </button>
                        )}
                        {activeTab === 'approval' && (contract.status === 'pending_approval' || contract.status === 'rejected') && (
                          <>
                            <button
                              onClick={() => openApprovalModal(contract, 'approve')}
                              className="px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded text-xs hover:bg-green-500/30 transition-colors"
                            >
                              通过
                            </button>
                            <button
                              onClick={() => openApprovalModal(contract, 'reject')}
                              className="px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-xs hover:bg-red-500/30 transition-colors"
                            >
                              驳回
                            </button>
                            {contract.status === 'rejected' && (
                              <button
                                onClick={() => resubmitRejected(contract)}
                                className="px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-xs hover:bg-blue-500/30 transition-colors"
                              >
                                重新提交
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0e2a47] border border-[#1e4976] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-[#1e4976]">
              <h2 className="text-lg font-bold text-[#00e5ff]">导入合同</h2>
              <button onClick={() => { setShowImportModal(false); resetImportModal(); }} className="text-gray-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-5">
              {/* File Upload */}
              {!importFile && (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#1e4976] rounded-xl cursor-pointer hover:border-[#00e5ff]/50 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-400">点击上传合同文件（PDF / JPG / PNG，最大 5MB）</span>
                  <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} />
                </label>
              )}

              {/* AI Parsing Loading */}
              {isParsing && (
                <div className="flex flex-col items-center py-8">
                  <div className="w-12 h-12 border-4 border-[#00e5ff]/30 border-t-[#00e5ff] rounded-full animate-spin mb-4" />
                  <p className="text-[#00e5ff] font-medium">AI 解析中...</p>
                  <p className="text-xs text-gray-500 mt-1">正在识别合同内容并提取字段</p>
                </div>
              )}

              {/* Parsed Result */}
              {parsedContract && !isParsing && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-400">AI 解析完成，请核对信息</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">合同编号</label>
                      <input
                        type="text"
                        value={parsedContract.contractNumber || ''}
                        readOnly
                        className="w-full px-3 py-2 bg-[#0a1628] border border-[#1e4976] rounded-lg text-sm text-gray-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">合同名称</label>
                      <input
                        type="text"
                        value={editForm.contractName}
                        onChange={e => setEditForm(prev => ({ ...prev, contractName: e.target.value }))}
                        className="w-full px-3 py-2 bg-[#0a1628] border border-[#1e4976] rounded-lg text-sm text-white focus:border-[#00e5ff] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">乙方</label>
                      <input
                        type="text"
                        value={editForm.partyB}
                        onChange={e => setEditForm(prev => ({ ...prev, partyB: e.target.value }))}
                        className="w-full px-3 py-2 bg-[#0a1628] border border-[#1e4976] rounded-lg text-sm text-white focus:border-[#00e5ff] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">金额</label>
                      <input
                        type="text"
                        value={editForm.amount}
                        onChange={e => setEditForm(prev => ({ ...prev, amount: e.target.value }))}
                        className="w-full px-3 py-2 bg-[#0a1628] border border-[#1e4976] rounded-lg text-sm text-white focus:border-[#00e5ff] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">签订日期</label>
                      <input
                        type="date"
                        value={editForm.signDate}
                        onChange={e => setEditForm(prev => ({ ...prev, signDate: e.target.value }))}
                        className="w-full px-3 py-2 bg-[#0a1628] border border-[#1e4976] rounded-lg text-sm text-white focus:border-[#00e5ff] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">到期日期</label>
                      <input
                        type="date"
                        value={editForm.expiryDate}
                        onChange={e => setEditForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                        className="w-full px-3 py-2 bg-[#0a1628] border border-[#1e4976] rounded-lg text-sm text-white focus:border-[#00e5ff] focus:outline-none"
                      />
                    </div>
                  </div>
                  {importFileName && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <FileText className="w-3 h-3" />
                      源文件：{importFileName}
                    </div>
                  )}
                </div>
              )}
            </div>
            {parsedContract && !isParsing && (
              <div className="flex justify-end gap-3 p-5 border-t border-[#1e4976]">
                <button
                  onClick={() => { setShowImportModal(false); resetImportModal(); }}
                  className="px-4 py-2 bg-[#0a1628] border border-[#1e4976] rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={confirmImport}
                  className="px-4 py-2 bg-[#00e5ff] text-[#0a1628] rounded-lg text-sm font-medium hover:bg-[#00e5ff]/90 transition-colors"
                >
                  确认导入
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedContract && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0e2a47] border border-[#1e4976] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-[#1e4976]">
              <h2 className="text-lg font-bold text-[#00e5ff]">
                {approvalAction === 'approve' ? '审批通过' : '审批驳回'}
              </h2>
              <button onClick={() => { setShowApprovalModal(false); setSelectedContract(null); }} className="text-gray-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Contract Info */}
              <div className="bg-[#0a1628] border border-[#1e4976] rounded-lg p-4 space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-400">合同编号：</span><span className="text-[#00e5ff]">{selectedContract.contractNumber}</span></div>
                  <div><span className="text-gray-400">合同名称：</span>{selectedContract.contractName}</div>
                  <div><span className="text-gray-400">乙方：</span>{selectedContract.partyB}</div>
                  <div><span className="text-gray-400">金额：</span><span className="text-[#00e5ff]">{selectedContract.amount}</span></div>
                </div>
              </div>

              {/* Approval Message */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">审批意见</label>
                <textarea
                  value={approvalMessage}
                  onChange={e => setApprovalMessage(e.target.value)}
                  placeholder="请输入审批意见..."
                  rows={3}
                  className="w-full px-3 py-2 bg-[#0a1628] border border-[#1e4976] rounded-lg text-sm text-white placeholder-gray-500 focus:border-[#00e5ff] focus:outline-none resize-none"
                />
              </div>

              {/* Signature */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">审批签名</label>
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-[#1e4976] rounded-xl cursor-pointer hover:border-[#00e5ff]/50 transition-colors">
                  {signatureImage ? (
                    <img src={signatureImage} alt="签名预览" className="h-20 object-contain" />
                  ) : (
                    <>
                      <Shield className="w-6 h-6 text-gray-400 mb-1" />
                      <span className="text-xs text-gray-400">点击上传签名图片</span>
                    </>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={handleSignatureUpload} />
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t border-[#1e4976]">
              <button
                onClick={() => { setShowApprovalModal(false); setSelectedContract(null); }}
                className="px-4 py-2 bg-[#0a1628] border border-[#1e4976] rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
              >
                取消
              </button>
              <button
                onClick={submitApproval}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  approvalAction === 'approve'
                    ? 'bg-green-500 text-white hover:bg-green-500/90'
                    : 'bg-red-500 text-white hover:bg-red-500/90'
                }`}
              >
                确认{approvalAction === 'approve' ? '通过' : '驳回'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedContract && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0e2a47] border border-[#1e4976] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-[#1e4976]">
              <h2 className="text-lg font-bold text-[#00e5ff]">合同详情</h2>
              <button onClick={() => { setShowDetailModal(false); setSelectedContract(null); }} className="text-gray-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Basic Info */}
              <div className="bg-[#0a1628] border border-[#1e4976] rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-medium text-[#00e5ff] mb-3">基本信息</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-400">合同编号：</span><span className="text-[#00e5ff] font-mono">{selectedContract.contractNumber}</span></div>
                  <div><span className="text-gray-400">合同名称：</span>{selectedContract.contractName}</div>
                  <div><span className="text-gray-400">乙方：</span>{selectedContract.partyB}</div>
                  <div><span className="text-gray-400">金额：</span><span className="text-[#00e5ff]">{selectedContract.amount}</span></div>
                  <div><span className="text-gray-400">签订日期：</span>{selectedContract.signDate}</div>
                  <div><span className="text-gray-400">到期日期：</span>{selectedContract.expiryDate}</div>
                  <div><span className="text-gray-400">剩余天数：</span><span className={parseInt(selectedContract.remainingDays) < 0 ? 'text-red-400' : 'text-green-400'}>{selectedContract.remainingDays}</span></div>
                  <div><span className="text-gray-400">状态：</span>{statusBadge(selectedContract.status)}</div>
                </div>
              </div>

              {/* Source File */}
              {selectedContract.sourceFileName && (
                <div className="bg-[#0a1628] border border-[#1e4976] rounded-lg p-4">
                  <h3 className="text-sm font-medium text-[#00e5ff] mb-2">源文件</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <FileText className="w-4 h-4 text-[#00e5ff]" />
                    {selectedContract.sourceFileName}
                  </div>
                </div>
              )}

              {/* Status History */}
              {selectedContract.statusHistory.length > 0 && (
                <div className="bg-[#0a1628] border border-[#1e4976] rounded-lg p-4">
                  <h3 className="text-sm font-medium text-[#00e5ff] mb-3">操作记录</h3>
                  <div className="space-y-3">
                    {selectedContract.statusHistory.map((history, index) => (
                      <div key={index} className="flex gap-3 text-sm">
                        <div className="flex flex-col items-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#00e5ff]" />
                          {index < selectedContract.statusHistory.length - 1 && (
                            <div className="w-px h-6 bg-[#1e4976]" />
                          )}
                        </div>
                        <div className="flex-1 pb-3">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-white">{STATUS_LABELS[history.status] || history.status}</span>
                            <span className="text-xs text-gray-500">{history.timestamp}</span>
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {history.operator}{history.message ? `：${history.message}` : ''}
                          </div>
                          {history.signatureImage && (
                            <div className="mt-2">
                              <span className="text-xs text-gray-500">签名：</span>
                              <img src={history.signatureImage} alt="审批签名" className="h-8 object-contain inline-block ml-1 border border-[#1e4976] rounded" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end p-5 border-t border-[#1e4976]">
              <button
                onClick={() => { setShowDetailModal(false); setSelectedContract(null); }}
                className="px-4 py-2 bg-[#00e5ff] text-[#0a1628] rounded-lg text-sm font-medium hover:bg-[#00e5ff]/90 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
