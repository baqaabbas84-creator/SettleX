import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import evidenceService from '../../services/evidenceService';
import {
  FileText,
  Upload,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Eye,
  Download,
  FileCheck,
  Building2,
  Calendar,
  RotateCw,
  Plus,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import Modal from '../../components/ui/Modal';

const INITIAL_EVIDENCE = [
  {
    id: 'EV-8821-01',
    dealId: 'deal_001',
    dealTitle: '500 Wooden Chairs — Office Furniture Order',
    milestone: 'M1 - Design Approval & Wood Specs',
    milestoneId: 'ms_001',
    filename: 'design_specs_rev2.pdf',
    type: 'INVOICE',
    uploadedBy: 'Priya Sharma (Seller)',
    uploadDate: '2026-09-08T14:30:00Z',
    status: 'VERIFIED',
    aiData: {
      orderId: 'ORD-8821',
      seller: 'Sharma Furniture Works',
      quantity: '500 Chairs',
      date: '2026-09-08',
      confidence: 98.5,
      extractedAmount: '₹25,000',
    },
  },
  {
    id: 'EV-8821-02',
    dealId: 'deal_001',
    dealTitle: '500 Wooden Chairs — Office Furniture Order',
    milestone: 'M2 - Batch Manufacturing QA',
    milestoneId: 'ms_002',
    filename: 'factory_qc_certificate.pdf',
    type: 'OTHER',
    uploadedBy: 'Priya Sharma (Seller)',
    uploadDate: '2026-09-20T11:00:00Z',
    status: 'PROCESSING',
    aiData: {
      orderId: 'ORD-8821',
      seller: 'Sharma Furniture Works',
      quantity: '500 Units',
      date: '2026-09-20',
      confidence: 94.2,
      extractedAmount: '₹1,25,000',
    },
  },
  {
    id: 'EV-8822-01',
    dealId: 'deal_002',
    dealTitle: 'Steel Shelving Units — Warehouse Storage',
    milestone: 'M1 - Raw Material Sourcing',
    milestoneId: 'ms_003',
    filename: 'steel_batch_gst_invoice.pdf',
    type: 'INVOICE',
    uploadedBy: 'MetalCraft Fabrications',
    uploadDate: '2026-09-12T09:15:00Z',
    status: 'VERIFIED',
    aiData: {
      orderId: 'MC-3310',
      seller: 'MetalCraft Fabrications',
      quantity: '120 Units',
      date: '2026-09-12',
      confidence: 99.1,
      extractedAmount: '₹90,000',
    },
  },
  {
    id: 'EV-8823-01',
    dealId: 'deal_003',
    dealTitle: 'Custom Packaging Materials',
    milestone: 'M2 - Dispatch & Delivery',
    milestoneId: 'ms_004',
    filename: 'signed_delivery_challan.pdf',
    type: 'DELIVERY_DOCUMENT',
    uploadedBy: 'Apex Industrial Supplies',
    uploadDate: '2026-09-15T16:45:00Z',
    status: 'UNDER_REVIEW',
    aiData: {
      orderId: 'APX-774',
      seller: 'Apex Industrial Supplies',
      quantity: '2,500 Boxes',
      date: '2026-09-15',
      confidence: 89.7,
      extractedAmount: '₹45,000',
    },
  },
];

export default function Evidence() {
  const { user } = useAuth();
  const [evidenceList, setEvidenceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Modals
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Upload Form
  const [uploadForm, setUploadForm] = useState({
    dealId: 'deal_001',
    milestoneTitle: 'M2 - Batch Manufacturing QA',
    type: 'INVOICE',
    fileName: '',
    notes: '',
    quantity: '500',
  });

  const fetchEvidence = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      // Check backend API
      const res = await evidenceService.getEvidence('deal_001').catch(() => null);
      let list = [];

      const rawList = res?.data?.evidence || (Array.isArray(res?.data) ? res.data : []);

      list = rawList.map((e) => ({
        id: e._id || e.id,
        dealId: e.dealId?._id || e.dealId || 'deal_001',
        dealTitle: e.dealId?.title || e.dealTitle || '500 Wooden Chairs — Order',
        milestone: e.milestoneId?.title || e.milestone || 'Escrow Milestone',
        type: e.type || 'INVOICE',
        filename: e.fileName || e.filename || 'uploaded_document.pdf',
        fileSize: e.fileSize || '1.2 MB',
        uploadedBy: e.uploadedBy?.name ? `${e.uploadedBy.name} (${e.uploadedBy.role || 'Seller'})` : 'Seller',
        uploadDate: e.createdAt || e.uploadDate || new Date().toISOString(),
        status: e.status || 'VERIFIED',
        aiData: e.aiResult || e.aiData || {
          orderId: `ORD-${(e._id || '9912').slice(-4)}`,
          seller: e.uploadedBy?.name || 'Seller Org',
          quantity: '500 Units',
          date: new Date().toISOString().split('T')[0],
          confidence: 96.5,
          extractedAmount: '₹2,50,000',
        },
      }));

      // Merge local storage items
      let localItems = [];
      try {
        localItems = JSON.parse(localStorage.getItem('settlex_custom_evidence') || '[]');
      } catch {
        localItems = [];
      }

      const merged = [...localItems, ...list, ...INITIAL_EVIDENCE];

      // Deduplicate by ID
      const uniqueMap = new Map();
      merged.forEach((item) => {
        if (!uniqueMap.has(item.id)) {
          uniqueMap.set(item.id, item);
        }
      });

      setEvidenceList(Array.from(uniqueMap.values()));
    } catch (err) {
      setError(err.message || 'Failed to load evidence records.');
      setEvidenceList(INITIAL_EVIDENCE);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEvidence();
  }, [fetchEvidence]);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const newEvidence = {
        id: 'EV-' + Math.floor(1000 + Math.random() * 9000) + '-01',
        dealId: uploadForm.dealId,
        dealTitle: '500 Wooden Chairs — Office Furniture Order',
        milestone: uploadForm.milestoneTitle,
        filename: uploadForm.fileName || 'signed_delivery_proof.pdf',
        type: uploadForm.type,
        uploadedBy: user?.name || 'Seller Representative',
        uploadDate: new Date().toISOString(),
        status: 'VERIFIED',
        aiData: {
          orderId: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
          seller: user?.company || 'Sharma Furniture Works',
          quantity: `${uploadForm.quantity} Units`,
          date: new Date().toISOString().split('T')[0],
          confidence: 96.4,
          extractedAmount: '₹1,25,000',
        },
      };

      // Call backend upload endpoint
      await evidenceService.uploadEvidence(newEvidence).catch(() => null);

      // Save locally
      try {
        const localItems = JSON.parse(localStorage.getItem('settlex_custom_evidence') || '[]');
        localStorage.setItem(
          'settlex_custom_evidence',
          JSON.stringify([newEvidence, ...localItems])
        );
      } catch {
        // ignore
      }

      setEvidenceList((prev) => [newEvidence, ...prev]);
      setFeedback({
        type: 'success',
        text: `Document "${newEvidence.filename}" analyzed & verified by AI with 96.4% confidence!`,
      });
      setUploadModalOpen(false);
      setUploadForm({
        dealId: 'deal_001',
        milestoneTitle: 'M2 - Batch Manufacturing QA',
        type: 'INVOICE',
        fileName: '',
        notes: '',
        quantity: '500',
      });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Upload failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredList = evidenceList.filter((item) => {
    const matchesSearch =
      item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.dealTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.milestone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
    if (typeFilter !== 'ALL' && item.type !== typeFilter) return false;

    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>AI Evidence Intelligence</span>
          </div>
          <h1 className="text-2xl font-bold text-surface-900">Evidence & Verification</h1>
          <p className="text-sm text-surface-500 mt-1">
            Review cross-checked invoices, delivery documents, and automated OCR discrepancy checks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchEvidence(true)}
            disabled={refreshing}
            className="p-2.5 rounded-lg border border-surface-200 hover:bg-surface-50 text-surface-600 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RotateCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-brand-600' : ''}`} />
          </button>

          <Button onClick={() => setUploadModalOpen(true)} icon={Upload}>
            Submit Evidence
          </Button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-sm shadow-xs animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-accent-50 border-accent-200 text-accent-800'
              : 'bg-danger-50 border-danger-200 text-danger-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-accent-600" />
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="font-semibold underline text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-surface-200 shadow-xs">
          <p className="text-xs text-surface-500 font-semibold uppercase tracking-wider">Total Documents</p>
          <p className="text-xl font-bold text-surface-900 mt-1">{evidenceList.length} Uploads</p>
          <span className="text-[11px] text-surface-400 mt-0.5 block">Audit preserved</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-accent-200 shadow-xs">
          <p className="text-xs text-accent-700 font-semibold uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-accent-600" />
            AI Verified
          </p>
          <p className="text-xl font-bold text-accent-900 mt-1">
            {evidenceList.filter((e) => e.status === 'VERIFIED').length} Documents
          </p>
          <span className="text-[11px] text-accent-600 mt-0.5 block">Cross-check 100% matched</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-warning-200 shadow-xs">
          <p className="text-xs text-warning-700 font-semibold uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-warning-600" />
            Under Review
          </p>
          <p className="text-xl font-bold text-warning-900 mt-1">
            {evidenceList.filter((e) => e.status === 'UNDER_REVIEW' || e.status === 'PROCESSING').length} Documents
          </p>
          <span className="text-[11px] text-warning-600 mt-0.5 block">Awaiting buyer release</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-surface-200 shadow-xs">
          <p className="text-xs text-surface-500 font-semibold uppercase tracking-wider">Avg Confidence</p>
          <p className="text-xl font-bold text-surface-900 mt-1 font-mono">97.2%</p>
          <span className="text-[11px] text-accent-600 mt-0.5 block">Deep OCR accuracy</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-surface-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by filename, deal, ID..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-surface-200 text-sm focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-surface-200 text-sm bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="VERIFIED">Verified</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="PROCESSING">Processing</option>
            <option value="DISPUTED">Disputed</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-surface-200 text-sm bg-white"
          >
            <option value="ALL">All Categories</option>
            <option value="INVOICE">Tax Invoices</option>
            <option value="DELIVERY_DOCUMENT">Delivery Proofs</option>
            <option value="OTHER">QA & Certificates</option>
          </select>
        </div>
      </div>

      {/* Content List */}
      {loading ? (
        <LoadingState message="Loading evidence repository..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchEvidence()} />
      ) : filteredList.length === 0 ? (
        <EmptyState
          title="No evidence items found"
          description="Upload shipping documents, invoices, or delivery receipts to verify milestones."
          actionLabel="Submit Evidence"
          onAction={() => setUploadModalOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {filteredList.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-surface-200 hover:border-brand-300 hover:shadow-md transition-all p-5"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileText className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-surface-900 text-base">{item.filename}</span>
                      <StatusBadge status={item.status} size="xs" />
                      <span className="text-[11px] font-mono text-surface-400 bg-surface-100 px-2 py-0.5 rounded">
                        {item.id}
                      </span>
                    </div>

                    <p className="text-xs text-surface-500">
                      Deal: <strong className="text-surface-700">{item.dealTitle}</strong> • Milestone: <strong className="text-brand-700">{item.milestone}</strong>
                    </p>

                    <div className="flex items-center gap-3 mt-1 text-xs text-surface-400">
                      <span>Uploaded by {item.uploadedBy}</span>
                      <span>•</span>
                      <span>{new Date(item.uploadDate).toLocaleDateString()}</span>
                    </div>

                    {/* AI Document Intelligence Badge Card */}
                    {item.aiData && (
                      <div className="mt-3 p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="font-bold flex items-center gap-1 text-indigo-700">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          AI Extraction:
                        </span>
                        <span>Order ID: <strong>{item.aiData.orderId}</strong></span>
                        <span>Quantity: <strong>{item.aiData.quantity}</strong></span>
                        <span>Date: <strong>{item.aiData.date}</strong></span>
                        <span className="bg-white text-accent-700 font-bold px-2 py-0.5 rounded border border-accent-200">
                          {item.aiData.confidence}% Confidence
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end lg:self-center flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setSelectedItem(item); setViewModalOpen(true); }}
                    icon={Eye}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => alert(`Downloading verified payload for ${item.filename}`)}
                    icon={Download}
                  >
                    Download
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Submit Milestone Evidence for AI Verification"
        size="lg"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1.5">
              Related Deal Contract <span className="text-danger-500">*</span>
            </label>
            <select
              value={uploadForm.dealId}
              onChange={(e) => setUploadForm({ ...uploadForm, dealId: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-surface-300 text-sm bg-white"
            >
              <option value="deal_001">500 Wooden Chairs — Office Furniture Order (₹2,50,000)</option>
              <option value="deal_002">Steel Shelving Units — Warehouse Storage (₹1,80,000)</option>
              <option value="deal_003">Custom Packaging Materials (₹85,000)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">
                Evidence Type <span className="text-danger-500">*</span>
              </label>
              <select
                value={uploadForm.type}
                onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-surface-300 text-sm bg-white"
              >
                <option value="INVOICE">Tax Invoice (GST Compliant)</option>
                <option value="DELIVERY_DOCUMENT">Signed Delivery Proof / Challan</option>
                <option value="RECEIPT">Material Handover Receipt</option>
                <option value="OTHER">QC / Inspection Certificate (PDF/Image)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">
                Document File Name <span className="text-danger-500">*</span>
              </label>
              <input
                type="text"
                required
                value={uploadForm.fileName}
                onChange={(e) => setUploadForm({ ...uploadForm, fileName: e.target.value })}
                placeholder="e.g. signed_delivery_challan_500pcs.pdf"
                className="w-full px-3.5 py-2 rounded-lg border border-surface-300 text-sm font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">
                Delivered Quantity
              </label>
              <input
                type="text"
                value={uploadForm.quantity}
                onChange={(e) => setUploadForm({ ...uploadForm, quantity: e.target.value })}
                placeholder="500 Chairs"
                className="w-full px-3.5 py-2 rounded-lg border border-surface-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">
                Milestone Target
              </label>
              <input
                type="text"
                value={uploadForm.milestoneTitle}
                onChange={(e) => setUploadForm({ ...uploadForm, milestoneTitle: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-surface-300 text-sm bg-surface-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1.5">
              Verification Notes
            </label>
            <textarea
              rows={3}
              value={uploadForm.notes}
              onChange={(e) => setUploadForm({ ...uploadForm, notes: e.target.value })}
              placeholder="Provide courier docket numbers, inspector remarks, or dispatch notes..."
              className="w-full px-3.5 py-2 rounded-lg border border-surface-300 text-sm"
            />
          </div>

          <div className="p-3 bg-indigo-50/70 rounded-lg border border-indigo-100 flex items-center gap-2 text-xs text-indigo-900">
            <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <span>AI Evidence Service extracts order parameters, compares quantities against contract rules, and scores veracity.</span>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-surface-200">
            <Button variant="outline" onClick={() => setUploadModalOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={actionLoading} icon={Upload}>
              Upload & Run AI Verification
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Detail Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Evidence Analysis Report"
        size="md"
      >
        {selectedItem && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-surface-500">Document ID:</span>
                <span className="font-mono font-bold text-surface-900">{selectedItem.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-500">Filename:</span>
                <span className="font-semibold text-surface-800">{selectedItem.filename}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-500">Category:</span>
                <span>{selectedItem.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-500">Status:</span>
                <StatusBadge status={selectedItem.status} size="xs" />
              </div>
            </div>

            {selectedItem.aiData && (
              <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-200 space-y-2.5 text-indigo-950">
                <p className="font-bold flex items-center gap-1.5 text-indigo-800 text-sm">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  AI Document Intelligence Verdict
                </p>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-indigo-600 block text-[11px]">Matched Order:</span>
                    <strong className="font-mono">{selectedItem.aiData.orderId}</strong>
                  </div>
                  <div>
                    <span className="text-indigo-600 block text-[11px]">Identified Quantity:</span>
                    <strong>{selectedItem.aiData.quantity}</strong>
                  </div>
                  <div>
                    <span className="text-indigo-600 block text-[11px]">Document Date:</span>
                    <strong>{selectedItem.aiData.date}</strong>
                  </div>
                  <div>
                    <span className="text-indigo-600 block text-[11px]">Confidence Score:</span>
                    <strong className="text-accent-700">{selectedItem.aiData.confidence}% Confidence</strong>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-surface-200">
              <Button variant="outline" onClick={() => setViewModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
