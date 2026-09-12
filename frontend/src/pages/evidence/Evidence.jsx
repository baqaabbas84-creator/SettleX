import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import evidenceService from '../../services/evidenceService';
import {
  FileText,
  Upload,
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  Eye,
  Download,
  RotateCw,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import Modal from '../../components/ui/Modal';

const DEMO_EVIDENCE = [
  {
    id: 'EV-DEMO-001',
    dealId: 'demo',
    dealTitle: '500 Wooden Chairs — Office Furniture Order',
    milestone: 'M1 - Design Approval & Wood Specs',
    filename: 'design_specs_rev2.pdf',
    type: 'INVOICE',
    uploadedBy: 'Priya Sharma (Seller)',
    uploadDate: '2026-09-08T14:30:00Z',
    status: 'VERIFIED',
    demo: true,
    aiData: {
      orderId: 'ORD-8821',
      seller: 'Sharma Furniture Works',
      quantity: '500 Chairs',
      date: '2026-09-08',
      confidence: 98.5,
    },
  },
  {
    id: 'EV-DEMO-002',
    dealId: 'demo',
    dealTitle: '500 Wooden Chairs — Office Furniture Order',
    milestone: 'M2 - Batch Manufacturing QA',
    filename: 'factory_qc_certificate.pdf',
    type: 'OTHER',
    uploadedBy: 'Priya Sharma (Seller)',
    uploadDate: '2026-09-20T11:00:00Z',
    status: 'PROCESSING',
    demo: true,
    aiData: {
      orderId: 'ORD-8821',
      seller: 'Sharma Furniture Works',
      quantity: '500 Units',
      date: '2026-09-20',
      confidence: 94.2,
    },
  },
  {
    id: 'EV-DEMO-003',
    dealId: 'demo',
    dealTitle: 'Steel Shelving Units — Warehouse Storage',
    milestone: 'M1 - Raw Material Sourcing',
    filename: 'steel_batch_gst_invoice.pdf',
    type: 'INVOICE',
    uploadedBy: 'MetalCraft Fabrications',
    uploadDate: '2026-09-12T09:15:00Z',
    status: 'VERIFIED',
    demo: true,
    aiData: {
      orderId: 'MC-3310',
      seller: 'MetalCraft Fabrications',
      quantity: '120 Units',
      date: '2026-09-12',
      confidence: 99.1,
    },
  },
  {
    id: 'EV-DEMO-004',
    dealId: 'demo',
    dealTitle: 'Custom Packaging Materials',
    milestone: 'M2 - Dispatch & Delivery',
    filename: 'signed_delivery_challan.pdf',
    type: 'DELIVERY_DOCUMENT',
    uploadedBy: 'Apex Industrial Supplies',
    uploadDate: '2026-09-15T16:45:00Z',
    status: 'UNDER_REVIEW',
    demo: true,
    aiData: {
      orderId: 'APX-774',
      seller: 'Apex Industrial Supplies',
      quantity: '2,500 Boxes',
      date: '2026-09-15',
      confidence: 89.7,
    },
  },
];

const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;

function getAiData(aiResult) {
  if (!aiResult) return null;

  const fields = aiResult.extractedFields || aiResult.extractedData || aiResult;
  const rawConfidence =
    aiResult.confidence ??
    aiResult.score ??
    fields.confidence ??
    null;

  let confidence = null;
  if (typeof rawConfidence === 'number') {
    confidence = rawConfidence <= 1 ? rawConfidence * 100 : rawConfidence;
  } else if (typeof rawConfidence === 'string') {
    const parsed = parseFloat(rawConfidence.replace('%', ''));
    if (!Number.isNaN(parsed)) {
      confidence = parsed <= 1 ? parsed * 100 : parsed;
    }
  }

  return {
    orderId: fields.orderId || fields.orderID || fields.orderNumber || 'Not detected',
    seller: fields.seller || fields.sellerName || 'Not detected',
    quantity:
      fields.quantity ??
      fields.qty ??
      fields.deliveredQuantity ??
      'Not detected',
    date:
      fields.date ||
      fields.documentDate ||
      fields.relevantDates?.[0] ||
      'Not detected',
    documentType: fields.documentType || '',
    summary: fields.summary || '',
    confidence,
    inconsistencies: aiResult.inconsistencies || [],
  };
}

function normalizeEvidence(e) {
  const aiData = getAiData(e.aiResult || e.aiData);

  return {
    id: e._id || e.id,
    dealId: e.dealId?._id || e.dealId || '',
    dealTitle: e.dealId?.title || e.dealTitle || 'MSME Deal',
    milestone:
      e.milestoneId?.title ||
      e.milestoneTitle ||
      e.milestone ||
      'Escrow Milestone',
    filename:
      e.file?.originalName ||
      e.fileName ||
      e.filename ||
      'uploaded_document',
    fileSize: e.file?.size || e.fileSize || null,
    type: e.type || 'OTHER',
    uploadedBy: e.uploadedBy?.name
      ? `${e.uploadedBy.name} (${e.uploadedBy.role || 'Seller'})`
      : 'Seller',
    uploadDate: e.createdAt || e.uploadDate || new Date().toISOString(),
    status: e.status || 'PENDING',
    aiData,
    demo: false,
  };
}

export default function Evidence() {
  const { user } = useAuth();

  const [evidenceList, setEvidenceList] = useState(DEMO_EVIDENCE);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [uploadForm, setUploadForm] = useState({
    dealId: '',
    milestoneId: '',
    milestoneTitle: '',
    type: 'INVOICE',
    notes: '',
    quantity: '',
  });

  const fetchEvidence = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    setError('');

    /*
      The backend evidence listing endpoint is milestone-scoped:
      GET /api/evidence/milestone/:milestoneId

      Therefore we do not send the fake "deal_001" identifier here.
      The repository keeps the demo records and adds real records after upload.
    */
    try {
      const stored = JSON.parse(
        localStorage.getItem('settlex_real_evidence') || '[]'
      );

      const realItems = Array.isArray(stored) ? stored : [];

      setEvidenceList((prev) => {
        const combined = [...realItems, ...prev];
        const map = new Map();

        combined.forEach((item) => {
          if (item?.id && !map.has(item.id)) {
            map.set(item.id, item);
          }
        });

        return Array.from(map.values());
      });
    } catch {
      // Keep currently loaded records.
    } finally {
      if (isRefresh) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEvidence();
  }, [fetchEvidence]);

  const handleUploadSubmit = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      setFeedback({
        type: 'error',
        text: 'Please select the actual PDF or image file. A filename alone is not accepted.',
      });
      return;
    }

    if (!OBJECT_ID_REGEX.test(uploadForm.dealId.trim())) {
      setFeedback({
        type: 'error',
        text: 'Enter the real MongoDB Deal ID from Deal Details. Demo IDs such as deal_001 cannot be uploaded to the backend.',
      });
      return;
    }

    if (!OBJECT_ID_REGEX.test(uploadForm.milestoneId.trim())) {
      setFeedback({
        type: 'error',
        text: 'Enter the real MongoDB Milestone ID from the deal. Demo milestone IDs cannot be uploaded to the backend.',
      });
      return;
    }

    const allowedTypes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/webp',
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setFeedback({
        type: 'error',
        text: 'Only PDF, PNG, JPG/JPEG, and WEBP files are supported.',
      });
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setFeedback({
        type: 'error',
        text: 'File size must be 5 MB or less.',
      });
      return;
    }

    setActionLoading(true);
    setFeedback(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('dealId', uploadForm.dealId.trim());
      formData.append('milestoneId', uploadForm.milestoneId.trim());
      formData.append('type', uploadForm.type);
      formData.append('title', selectedFile.name);
      formData.append('notes', uploadForm.notes);
      formData.append('quantity', uploadForm.quantity);
      formData.append('milestoneTitle', uploadForm.milestoneTitle);

      const response = await evidenceService.uploadEvidence(formData);
      const savedEvidence =
        response?.data?.evidence ||
        response?.evidence ||
        null;

      if (!savedEvidence?._id && !savedEvidence?.id) {
        throw new Error('Backend did not return an evidence ID.');
      }

      const evidenceId = savedEvidence._id || savedEvidence.id;
      let latestEvidence = savedEvidence;

      setFeedback({
        type: 'success',
        text: `"${selectedFile.name}" uploaded successfully. Gemini AI is analyzing the document...`,
      });

      /*
        AI processing runs asynchronously in the backend.
        Poll until VERIFIED/PENDING or until the short demo timeout expires.
      */
      for (let attempt = 0; attempt < 12; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 1500));

        try {
          const result = await evidenceService.getEvidenceById(evidenceId);
          latestEvidence =
            result?.data?.evidence ||
            result?.evidence ||
            latestEvidence;

          if (
            latestEvidence?.status === 'VERIFIED' ||
            latestEvidence?.status === 'PENDING' ||
            latestEvidence?.status === 'DISPUTED'
          ) {
            break;
          }
        } catch (pollError) {
          console.warn('Evidence AI polling failed:', pollError);
        }
      }

      const normalized = normalizeEvidence(latestEvidence);

      setEvidenceList((prev) => [
        normalized,
        ...prev.filter((item) => item.id !== normalized.id),
      ]);

      try {
        const existing = JSON.parse(
          localStorage.getItem('settlex_real_evidence') || '[]'
        );

        localStorage.setItem(
          'settlex_real_evidence',
          JSON.stringify([
            normalized,
            ...existing.filter((item) => item.id !== normalized.id),
          ])
        );
      } catch {
        // Local cache is optional.
      }

      const confidence = normalized.aiData?.confidence;
      const confidenceText =
        typeof confidence === 'number'
          ? `${confidence.toFixed(1)}%`
          : 'pending';

      setFeedback({
        type:
          normalized.status === 'VERIFIED'
            ? 'success'
            : 'warning',
        text:
          normalized.status === 'VERIFIED'
            ? `Document "${normalized.filename}" analyzed by Gemini AI with ${confidenceText} confidence.`
            : `Document "${normalized.filename}" was uploaded. AI verification is ${normalized.status.toLowerCase()} and may require review.`,
      });

      setUploadModalOpen(false);
      setSelectedFile(null);
      setUploadForm({
        dealId: '',
        milestoneId: '',
        milestoneTitle: '',
        type: 'INVOICE',
        notes: '',
        quantity: '',
      });
    } catch (err) {
      console.error('Evidence upload failed:', err);

      setFeedback({
        type: 'error',
        text:
          err?.message ||
          'Evidence upload failed. Check the backend terminal for the exact error.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredList = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return evidenceList.filter((item) => {
      const matchesSearch =
        !query ||
        String(item.filename || '').toLowerCase().includes(query) ||
        String(item.dealTitle || '').toLowerCase().includes(query) ||
        String(item.milestone || '').toLowerCase().includes(query) ||
        String(item.id || '').toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === 'ALL' || item.status === statusFilter;

      const matchesType =
        typeFilter === 'ALL' || item.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [evidenceList, searchQuery, statusFilter, typeFilter]);

  const verifiedCount = evidenceList.filter(
    (item) => item.status === 'VERIFIED'
  ).length;

  const reviewCount = evidenceList.filter(
    (item) =>
      item.status === 'UNDER_REVIEW' ||
      item.status === 'PROCESSING' ||
      item.status === 'PENDING'
  ).length;

  const realEvidenceCount = evidenceList.filter(
    (item) => !item.demo
  ).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>AI Evidence Intelligence</span>
          </div>

          <h1 className="text-2xl font-bold text-surface-900">
            Evidence & Verification
          </h1>

          <p className="text-sm text-surface-500 mt-1">
            Upload real evidence documents and let Gemini analyze them.
            Financial decisions remain controlled by backend rules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchEvidence(true)}
            disabled={refreshing}
            className="p-2.5 rounded-lg border border-surface-200 hover:bg-surface-50 text-surface-600 transition-colors"
            title="Refresh"
          >
            <RotateCw
              className={`w-4 h-4 ${
                refreshing ? 'animate-spin text-brand-600' : ''
              }`}
            />
          </button>

          <Button
            type="button"
            onClick={() => setUploadModalOpen(true)}
            icon={Upload}
          >
            Submit Evidence
          </Button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-start justify-between gap-3 text-sm ${
            feedback.type === 'success'
              ? 'bg-accent-50 border-accent-200 text-accent-800'
              : feedback.type === 'warning'
                ? 'bg-warning-50 border-warning-200 text-warning-800'
                : 'bg-danger-50 border-danger-200 text-danger-800'
          }`}
        >
          <div className="flex items-start gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            ) : feedback.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>

          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="font-semibold underline text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-surface-200 shadow-xs">
          <p className="text-xs text-surface-500 font-semibold uppercase tracking-wider">
            Total Documents
          </p>
          <p className="text-xl font-bold text-surface-900 mt-1">
            {evidenceList.length}
          </p>
          <span className="text-[11px] text-surface-400 mt-0.5 block">
            {realEvidenceCount} real uploads
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-accent-200 shadow-xs">
          <p className="text-xs text-accent-700 font-semibold uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            AI Verified
          </p>
          <p className="text-xl font-bold text-accent-900 mt-1">
            {verifiedCount}
          </p>
          <span className="text-[11px] text-accent-600 mt-0.5 block">
            Backend AI status
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-warning-200 shadow-xs">
          <p className="text-xs text-warning-700 font-semibold uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Under Review
          </p>
          <p className="text-xl font-bold text-warning-900 mt-1">
            {reviewCount}
          </p>
          <span className="text-[11px] text-warning-600 mt-0.5 block">
            Pending verification/review
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-surface-200 shadow-xs">
          <p className="text-xs text-surface-500 font-semibold uppercase tracking-wider">
            AI Engine
          </p>
          <p className="text-xl font-bold text-surface-900 mt-1">
            Gemini
          </p>
          <span className="text-[11px] text-accent-600 mt-0.5 block">
            Real document analysis
          </span>
        </div>
      </div>

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
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="UNDER_REVIEW">Under Review</option>
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
            <option value="RECEIPT">Receipts</option>
            <option value="OTHER">QA & Certificates</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading evidence repository..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchEvidence()} />
      ) : filteredList.length === 0 ? (
        <EmptyState
          title="No evidence items found"
          description="Upload a PDF or image document to verify a milestone."
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
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileText className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-surface-900 text-base break-all">
                        {item.filename}
                      </span>

                      <StatusBadge status={item.status} size="xs" />

                      {item.demo && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-surface-100 text-surface-500">
                          DEMO
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-surface-500">
                      Deal:{' '}
                      <strong className="text-surface-700">
                        {item.dealTitle}
                      </strong>{' '}
                      • Milestone:{' '}
                      <strong className="text-brand-700">
                        {item.milestone}
                      </strong>
                    </p>

                    <div className="flex items-center gap-3 mt-1 text-xs text-surface-400">
                      <span>Uploaded by {item.uploadedBy}</span>
                      <span>•</span>
                      <span>
                        {new Date(item.uploadDate).toLocaleDateString()}
                      </span>
                    </div>

                    {item.aiData && (
                      <div className="mt-3 p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="font-bold flex items-center gap-1 text-indigo-700">
                          <Sparkles className="w-3.5 h-3.5" />
                          AI Extraction:
                        </span>

                        <span>
                          Order ID:{' '}
                          <strong>{item.aiData.orderId}</strong>
                        </span>

                        <span>
                          Quantity:{' '}
                          <strong>{String(item.aiData.quantity)}</strong>
                        </span>

                        <span>
                          Date:{' '}
                          <strong>{String(item.aiData.date)}</strong>
                        </span>

                        {typeof item.aiData.confidence === 'number' && (
                          <span className="bg-white text-accent-700 font-bold px-2 py-0.5 rounded border border-accent-200">
                            {item.aiData.confidence.toFixed(1)}% Confidence
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end lg:self-center flex-shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedItem(item);
                      setViewModalOpen(true);
                    }}
                    icon={Eye}
                  >
                    View Details
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setFeedback({
                        type: 'warning',
                        text: `Secure download for "${item.filename}" is not implemented yet.`,
                      })
                    }
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

      <Modal
        isOpen={uploadModalOpen}
        onClose={() => {
          if (!actionLoading) setUploadModalOpen(false);
        }}
        title="Submit Real Document for AI Verification"
        size="lg"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div className="p-3 rounded-lg bg-warning-50 border border-warning-200 text-xs text-warning-900">
            <strong>Real upload:</strong> select the actual PDF/image below.
            A filename typed manually is not accepted. The backend sends the
            document to Gemini for analysis.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">
                Real Deal ID *
              </label>
              <input
                type="text"
                required
                value={uploadForm.dealId}
                onChange={(e) =>
                  setUploadForm((prev) => ({
                    ...prev,
                    dealId: e.target.value,
                  }))
                }
                placeholder="e.g. 68c2..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-surface-300 text-sm font-mono"
              />
              <p className="text-[11px] text-surface-400 mt-1">
                Copy the MongoDB ID from the real Deal Details URL/backend.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">
                Real Milestone ID *
              </label>
              <input
                type="text"
                required
                value={uploadForm.milestoneId}
                onChange={(e) =>
                  setUploadForm((prev) => ({
                    ...prev,
                    milestoneId: e.target.value,
                  }))
                }
                placeholder="e.g. 68c3..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-surface-300 text-sm font-mono"
              />
              <p className="text-[11px] text-surface-400 mt-1">
                Copy the real milestone ID from the deal.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1.5">
              Milestone Title
            </label>
            <input
              type="text"
              value={uploadForm.milestoneTitle}
              onChange={(e) =>
                setUploadForm((prev) => ({
                  ...prev,
                  milestoneTitle: e.target.value,
                }))
              }
              placeholder="e.g. Final Delivery & Acceptance"
              className="w-full px-3.5 py-2.5 rounded-lg border border-surface-300 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">
                Evidence Type *
              </label>
              <select
                value={uploadForm.type}
                onChange={(e) =>
                  setUploadForm((prev) => ({
                    ...prev,
                    type: e.target.value,
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-lg border border-surface-300 text-sm bg-white"
              >
                <option value="INVOICE">Tax Invoice / Bill</option>
                <option value="DELIVERY_DOCUMENT">
                  Signed Delivery Challan
                </option>
                <option value="RECEIPT">Material Handover Receipt</option>
                <option value="OTHER">Inspection / QA Report</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">
                Delivered Quantity
              </label>
              <input
                type="text"
                value={uploadForm.quantity}
                onChange={(e) =>
                  setUploadForm((prev) => ({
                    ...prev,
                    quantity: e.target.value,
                  }))
                }
                placeholder="500 Units"
                className="w-full px-3.5 py-2.5 rounded-lg border border-surface-300 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1.5">
              Document File *
            </label>

            <input
              type="file"
              required
              accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full px-3.5 py-3 rounded-lg border border-surface-300 text-sm bg-white"
            />

            {selectedFile && (
              <div className="mt-2 flex items-center gap-2 text-xs text-accent-700">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  Selected: <strong>{selectedFile.name}</strong> (
                  {(selectedFile.size / 1024).toFixed(0)} KB)
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1.5">
              Verification Notes
            </label>
            <textarea
              rows={3}
              value={uploadForm.notes}
              onChange={(e) =>
                setUploadForm((prev) => ({
                  ...prev,
                  notes: e.target.value,
                }))
              }
              placeholder="Courier docket, invoice reference, QA remarks..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-surface-300 text-sm"
            />
          </div>

          <div className="p-3 bg-indigo-50/70 rounded-lg border border-indigo-100 flex items-start gap-2 text-xs text-indigo-900">
            <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
            <span>
              Gemini reads the actual uploaded document and returns extracted
              fields, confidence, and inconsistencies. AI does not release
              escrow funds.
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-surface-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setUploadModalOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              loading={actionLoading}
              icon={Upload}
              disabled={!selectedFile}
            >
              Upload & Run AI Verification
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Evidence Analysis Report"
        size="md"
      >
        {selectedItem && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 space-y-2">
              <div className="flex justify-between gap-4">
                <span className="text-surface-500">Document ID:</span>
                <span className="font-mono font-bold text-surface-900 break-all">
                  {selectedItem.id}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-surface-500">Filename:</span>
                <span className="font-semibold text-surface-800 break-all">
                  {selectedItem.filename}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-surface-500">Category:</span>
                <span>{selectedItem.type}</span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-surface-500">Status:</span>
                <StatusBadge status={selectedItem.status} size="xs" />
              </div>

              {selectedItem.fileSize && (
                <div className="flex justify-between gap-4">
                  <span className="text-surface-500">File Size:</span>
                  <span>{selectedItem.fileSize} bytes</span>
                </div>
              )}
            </div>

            {selectedItem.aiData ? (
              <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-200 space-y-3 text-indigo-950">
                <p className="font-bold flex items-center gap-1.5 text-indigo-800 text-sm">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  AI Document Intelligence
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-indigo-600 block text-[11px]">
                      Matched Order
                    </span>
                    <strong className="font-mono">
                      {selectedItem.aiData.orderId}
                    </strong>
                  </div>

                  <div>
                    <span className="text-indigo-600 block text-[11px]">
                      Seller
                    </span>
                    <strong>{selectedItem.aiData.seller}</strong>
                  </div>

                  <div>
                    <span className="text-indigo-600 block text-[11px]">
                      Quantity
                    </span>
                    <strong>
                      {String(selectedItem.aiData.quantity)}
                    </strong>
                  </div>

                  <div>
                    <span className="text-indigo-600 block text-[11px]">
                      Document Date
                    </span>
                    <strong>{String(selectedItem.aiData.date)}</strong>
                  </div>
                </div>

                {typeof selectedItem.aiData.confidence === 'number' && (
                  <div className="pt-2 border-t border-indigo-200">
                    <span className="text-indigo-600 block text-[11px]">
                      Confidence
                    </span>
                    <strong className="text-accent-700 text-base">
                      {selectedItem.aiData.confidence.toFixed(1)}%
                    </strong>
                  </div>
                )}

                {selectedItem.aiData.summary && (
                  <div className="pt-2 border-t border-indigo-200">
                    <span className="text-indigo-600 block text-[11px]">
                      AI Summary
                    </span>
                    <p className="mt-1">{selectedItem.aiData.summary}</p>
                  </div>
                )}

                {selectedItem.aiData.inconsistencies?.length > 0 && (
                  <div className="p-3 rounded-lg bg-warning-50 border border-warning-200 text-warning-900">
                    <div className="font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      Inconsistencies detected
                    </div>

                    <ul className="list-disc pl-5 mt-1">
                      {selectedItem.aiData.inconsistencies.map(
                        (item, index) => (
                          <li key={`${index}-${String(item)}`}>
                            {typeof item === 'string'
                              ? item
                              : JSON.stringify(item)}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 text-surface-600">
                AI result is not available yet. Refresh after processing
                completes.
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-surface-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => setViewModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
