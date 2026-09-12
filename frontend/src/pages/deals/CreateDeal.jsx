import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import dealService from '../../services/dealService';
import apiClient from '../../services/api';
import {
  Handshake,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Building2,
  DollarSign,
} from 'lucide-react';
import Button from '../../components/ui/Button';

export default function CreateDeal() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [loadingSellers, setLoadingSellers] = useState(true);

  const [sellers, setSellers] = useState([]);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // =========================================================
  // FORM STATE
  // =========================================================

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sellerId: '',
    sellerCompany: '',
    totalAmount: '',
    currency: 'INR',
  });

  // =========================================================
  // DEFAULT MILESTONES
  // =========================================================

  const [milestones, setMilestones] = useState([
    {
      id: crypto.randomUUID(),
      title: 'Initial Specification & Design Approval',
      description:
        'Review design proofs, CAD drawings, and raw material spec sheet.',
      amount: '',
      dueDate: '',
      conditions:
        'Design sign-off document approved by buyer representative',
    },
    {
      id: crypto.randomUUID(),
      title: 'Batch Production & Inspection',
      description:
        'Complete primary manufacturing batch with factory QA report.',
      amount: '',
      dueDate: '',
      conditions:
        'QA inspection certificate & factory packing photos uploaded',
    },
    {
      id: crypto.randomUUID(),
      title: 'Final Delivery & Acceptance',
      description:
        'Physical receipt and stock verification at warehouse.',
      amount: '',
      dueDate: '',
      conditions:
        'Signed delivery challan & e-way bill verification',
    },
  ]);

  // =========================================================
  // FETCH REAL REGISTERED SELLERS
  // =========================================================

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        setLoadingSellers(true);
        setError('');

        const response = await apiClient.get(
          '/api/users?role=SELLER'
        );

        console.log(
          'FULL SELLER API RESPONSE:',
          response
        );

        const users =
          response?.data?.users ||
          response?.users ||
          [];

        console.log(
          'SELLERS FROM API:',
          users
        );

        setSellers(
          Array.isArray(users)
            ? users
            : []
        );
      } catch (err) {
        console.error(
          'Failed to fetch sellers:',
          err
        );

        setError(
          err?.message ||
            'Unable to load registered sellers.'
        );
      } finally {
        setLoadingSellers(false);
      }
    };

    fetchSellers();
  }, []);

  // =========================================================
  // CALCULATIONS
  // =========================================================

  const dealTotal =
    parseFloat(formData.totalAmount) || 0;

  const milestoneTotal =
    milestones.reduce(
      (acc, milestone) =>
        acc +
        (parseFloat(milestone.amount) || 0),
      0
    );

  const remainingAmount =
    dealTotal - milestoneTotal;

  const isBalanced =
    dealTotal > 0 &&
    Math.abs(remainingAmount) < 0.01;

  const allocationPercent =
    dealTotal > 0
      ? Math.min(
          100,
          Math.round(
            (milestoneTotal / dealTotal) *
              100
          )
        )
      : 0;

  // =========================================================
  // INPUT CHANGE
  // =========================================================

  const handleInputChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError('');
  };

  // =========================================================
  // SELLER SELECT
  // =========================================================

  const handleSellerSelect = (e) => {
    const sellerId =
      e.target.value;

    const selectedSeller =
      sellers.find(
        (seller) =>
          seller._id === sellerId
      );

    setFormData((prev) => ({
      ...prev,
      sellerId,
      sellerCompany:
        selectedSeller?.businessName ||
        '',
    }));

    setError('');
  };

  // =========================================================
  // MILESTONE CHANGE
  // =========================================================

  const handleMilestoneChange = (
    id,
    field,
    value
  ) => {
    setMilestones((prev) =>
      prev.map((milestone) =>
        milestone.id === id
          ? {
              ...milestone,
              [field]: value,
            }
          : milestone
      )
    );

    setError('');
  };

  // =========================================================
  // ADD MILESTONE
  // =========================================================

  const addMilestone = () => {
    setMilestones((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: `Milestone ${prev.length + 1}`,
        description: '',
        amount: '',
        dueDate: '',
        conditions: '',
      },
    ]);

    setError('');
  };

  // =========================================================
  // REMOVE MILESTONE
  // =========================================================

  const removeMilestone = (id) => {
    if (milestones.length <= 1) {
      setError(
        'At least one milestone is required for escrow scheduling.'
      );
      return;
    }

    setMilestones((prev) =>
      prev.filter(
        (milestone) =>
          milestone.id !== id
      )
    );

    setError('');
  };

  // =========================================================
  // AI MILESTONE GENERATION
  // =========================================================

  const handleAiSuggest = async () => {
    if (
      !formData.description &&
      !formData.title
    ) {
      setError(
        'Please provide a deal title or description first so AI can suggest appropriate milestones.'
      );
      return;
    }

    setAiLoading(true);
    setError('');

    try {
      const res =
        await dealService.suggestMilestones(
          `${formData.title}: ${formData.description}`
        );

      if (
        res?.data?.milestones &&
        Array.isArray(
          res.data.milestones
        )
      ) {
        setMilestones(
          res.data.milestones.map(
            (milestone) => ({
              ...milestone,
              id: crypto.randomUUID(),
            })
          )
        );
      } else {
        const total =
          dealTotal || 100000;

        setMilestones([
          {
            id: crypto.randomUUID(),
            title:
              'Procurement & Kickoff',
            description:
              'Material sourcing and technical alignment for ' +
              (formData.title ||
                'order'),
            amount:
              (total * 0.2).toFixed(0),
            dueDate:
              new Date(
                Date.now() +
                  7 *
                    86400000
              )
                .toISOString()
                .split('T')[0],
            conditions:
              'Bill of materials & sourcing confirmation receipt',
          },
          {
            id: crypto.randomUUID(),
            title:
              'Core Production / Execution',
            description:
              'Midway milestone validation for ' +
              (formData.title ||
                'deliverables'),
            amount:
              (total * 0.5).toFixed(0),
            dueDate:
              new Date(
                Date.now() +
                  21 *
                    86400000
              )
                .toISOString()
                .split('T')[0],
            conditions:
              'Interim progress report with visual evidence',
          },
          {
            id: crypto.randomUUID(),
            title:
              'Final Dispatch & Delivery',
            description:
              'Order fulfillment, dispatch, and final handover.',
            amount:
              (total * 0.3).toFixed(0),
            dueDate:
              new Date(
                Date.now() +
                  35 *
                    86400000
              )
                .toISOString()
                .split('T')[0],
            conditions:
              'Signed delivery receipt and stamped invoice',
          },
        ]);
      }
    } catch {
      const total =
        dealTotal || 100000;

      setMilestones([
        {
          id: crypto.randomUUID(),
          title:
            'Milestone 1: Advance / Sourcing',
          description:
            'Initial advance for raw material procurement.',
          amount:
            (total * 0.25).toFixed(0),
          dueDate:
            new Date(
              Date.now() +
                7 *
                  86400000
            )
              .toISOString()
              .split('T')[0],
          conditions:
            'Purchase order signoff',
        },
        {
          id: crypto.randomUUID(),
          title:
            'Milestone 2: Completion of Production',
          description:
            'Factory production completion & QA check.',
          amount:
            (total * 0.5).toFixed(0),
          dueDate:
            new Date(
              Date.now() +
                20 *
                  86400000
            )
              .toISOString()
              .split('T')[0],
          conditions:
            'QA clearance certificate',
        },
        {
          id: crypto.randomUUID(),
          title:
            'Milestone 3: Final Delivery',
          description:
            'Delivery to destination and buyer acceptance.',
          amount:
            (total * 0.25).toFixed(0),
          dueDate:
            new Date(
              Date.now() +
                30 *
                  86400000
            )
              .toISOString()
              .split('T')[0],
          conditions:
            'Signed delivery challan',
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');

    if (!formData.title.trim()) {
      setError(
        'Please enter a descriptive deal title.'
      );
      return;
    }

    if (!formData.sellerId) {
      setError(
        'Please select a registered seller.'
      );
      return;
    }

    if (dealTotal <= 0) {
      setError(
        'Deal total amount must be greater than zero.'
      );
      return;
    }

    if (milestones.length === 0) {
      setError(
        'You must specify at least one milestone.'
      );
      return;
    }

    for (
      let i = 0;
      i < milestones.length;
      i++
    ) {
      const milestone =
        milestones[i];

      if (
        !milestone.title.trim()
      ) {
        setError(
          `Milestone ${i + 1} is missing a title.`
        );
        return;
      }

      const amount =
        parseFloat(
          milestone.amount
        );

      if (
        !amount ||
        amount <= 0
      ) {
        setError(
          `Milestone ${i + 1} (${milestone.title}) must have a valid positive amount.`
        );
        return;
      }
    }

    if (!isBalanced) {
      setError(
        `Milestone total (${formData.currency === 'INR' ? '₹' : '$'}${milestoneTotal.toLocaleString()}) must exactly match Deal Total (${formData.currency === 'INR' ? '₹' : '$'}${dealTotal.toLocaleString()}). Difference: ${formData.currency === 'INR' ? '₹' : '$'}${Math.abs(remainingAmount).toLocaleString()}`
      );
      return;
    }

    setLoading(true);

    const dealPayload = {
      title:
        formData.title.trim(),

      description:
        formData.description.trim(),

      sellerId:
        formData.sellerId,

      totalAmount:
        dealTotal,

      currency:
        formData.currency,

      milestones:
        milestones.map(
          (milestone) => ({
            title:
              milestone.title.trim(),

            description:
              milestone.description.trim(),

            amount:
              parseFloat(
                milestone.amount
              ),

            dueDate:
              milestone.dueDate ||
              null,

            conditions:
              milestone.conditions.trim(),

            status:
              'CREATED',
          })
        ),
    };

    console.log(
      'CREATE DEAL PAYLOAD:',
      dealPayload
    );

    try {
      const response =
        await dealService.createDeal(
          dealPayload
        );

      console.log(
        'CREATE DEAL RESPONSE:',
        response
      );

      const createdDeal =
        response?.data?.deal ||
        response?.deal ||
        null;

      const newDealId =
        createdDeal?._id ||
        createdDeal?.id ||
        response?.data?._id ||
        response?.data?.id;

      if (!newDealId) {
        throw new Error(
          'Deal was created but the server did not return a deal ID.'
        );
      }

      setSuccess(true);

      setTimeout(() => {
        navigate(
          `/deals/${newDealId}`
        );
      }, 1200);
    } catch (err) {
      console.error(
        'CREATE DEAL ERROR:',
        err
      );

      setError(
        err?.message ||
          'Failed to create deal. Please verify connection to backend.'
      );
    } finally {
      setLoading(false);
    }
  };

  const currencySymbol =
    formData.currency === 'INR'
      ? '₹'
      : '$';

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">
            <Handshake className="w-4 h-4" />

            <span>
              Digital Escrow Agreement
            </span>
          </div>

          <h1 className="text-2xl font-bold text-surface-900">
            Create New Deal
          </h1>

          <p className="text-sm text-surface-500 mt-1">
            Define terms, select seller, and schedule automated milestone releases.
          </p>
        </div>

        <button
          type="button"
          onClick={
            handleAiSuggest
          }
          disabled={aiLoading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-sm font-semibold transition-all cursor-pointer shadow-xs disabled:opacity-60"
        >
          <Sparkles
            className={`w-4 h-4 ${
              aiLoading
                ? 'animate-spin'
                : 'text-indigo-600'
            }`}
          />

          <span>
            {aiLoading
              ? 'Analyzing Scope...'
              : 'AI Suggest Milestones'}
          </span>
        </button>

      </div>

      {/* SUCCESS */}
      {success && (
        <div className="p-4 rounded-xl bg-accent-50 border border-accent-200 text-accent-800 flex items-center gap-3 animate-fade-in shadow-xs">

          <CheckCircle2 className="w-5 h-5 text-accent-600 flex-shrink-0" />

          <div>
            <p className="text-sm font-bold">
              Deal agreement created successfully!
            </p>

            <p className="text-xs text-accent-700">
              Redirecting to Deal Details and Escrow status...
            </p>
          </div>

        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="p-4 rounded-xl bg-danger-50 border border-danger-200 text-danger-800 flex items-start gap-3 animate-fade-in shadow-xs">

          <AlertCircle className="w-5 h-5 text-danger-600 flex-shrink-0 mt-0.5" />

          <div className="flex-1">

            <p className="text-sm font-semibold">
              Please check your deal requirements
            </p>

            <p className="text-xs text-danger-700 mt-0.5">
              {error}
            </p>

          </div>

        </div>
      )}

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >

        {/* DEAL OVERVIEW */}
        <div className="bg-white rounded-xl border border-surface-200 p-6 shadow-xs space-y-5">

          <h2 className="text-base font-bold text-surface-900 flex items-center gap-2 pb-3 border-b border-surface-100">

            <Building2 className="w-4 h-4 text-brand-600" />

            <span>
              Deal Overview & Counterparty
            </span>

          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* TITLE */}
            <div className="md:col-span-2">

              <label className="block text-sm font-medium text-surface-700 mb-1.5">
                Deal Title{' '}
                <span className="text-danger-500">
                  *
                </span>
              </label>

              <input
                type="text"
                name="title"
                value={
                  formData.title
                }
                onChange={
                  handleInputChange
                }
                placeholder="e.g. 500 Wooden Chairs — Office Furniture Order"
                className="w-full px-4 py-2.5 rounded-lg border border-surface-300 text-surface-900 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all placeholder:text-surface-400"
                required
              />

            </div>

            {/* SELLER */}
            <div>

              <label className="block text-sm font-medium text-surface-700 mb-1.5">
                Contracted Seller{' '}
                <span className="text-danger-500">
                  *
                </span>
              </label>

              <select
                name="sellerId"
                value={
                  formData.sellerId
                }
                onChange={
                  handleSellerSelect
                }
                disabled={
                  loadingSellers
                }
                className="w-full px-4 py-2.5 rounded-lg border border-surface-300 text-surface-900 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all bg-white disabled:bg-surface-50"
              >

                <option value="">
                  {loadingSellers
                    ? 'Loading sellers...'
                    : sellers.length === 0
                      ? 'No registered sellers'
                      : 'Select a seller'}
                </option>

                {sellers.map(
                  (seller) => (
                    <option
                      key={
                        seller._id
                      }
                      value={
                        seller._id
                      }
                    >
                      {seller.businessName
                        ? `${seller.businessName} (${seller.name}${seller.trustScore != null ? ` — Trust Score: ${seller.trustScore}` : ''})`
                        : `${seller.name}${seller.trustScore != null ? ` — Trust Score: ${seller.trustScore}` : ''}`}
                    </option>
                  )
                )}

              </select>

              {!loadingSellers &&
                sellers.length ===
                  0 && (
                  <p className="mt-1.5 text-xs text-danger-600">
                    No registered SELLER account was found.
                  </p>
                )}

            </div>

            {/* TOTAL */}
            <div>

              <label className="block text-sm font-medium text-surface-700 mb-1.5">
                Total Deal Value{' '}
                <span className="text-danger-500">
                  *
                </span>
              </label>

              <div className="flex gap-2">

                <select
                  name="currency"
                  value={
                    formData.currency
                  }
                  onChange={
                    handleInputChange
                  }
                  className="w-24 px-3 py-2.5 rounded-lg border border-surface-300 text-surface-900 text-sm font-semibold bg-surface-50 focus:border-brand-500"
                >

                  <option value="INR">
                    INR (₹)
                  </option>

                  <option value="USD">
                    USD ($)
                  </option>

                </select>

                <div className="relative flex-1">

                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 text-sm font-medium">
                    {currencySymbol}
                  </span>

                  <input
                    type="number"
                    name="totalAmount"
                    value={
                      formData.totalAmount
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="250000"
                    min="1"
                    step="any"
                    className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-surface-300 text-surface-900 text-sm font-semibold focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all placeholder:text-surface-400 font-mono"
                    required
                  />

                </div>

              </div>

            </div>

            {/* DESCRIPTION */}
            <div className="md:col-span-2">

              <label className="block text-sm font-medium text-surface-700 mb-1.5">
                Scope Description & Deliverables
              </label>

              <textarea
                name="description"
                value={
                  formData.description
                }
                onChange={
                  handleInputChange
                }
                rows={3}
                placeholder="Detail technical requirements, specifications, packaging criteria, and delivery terms..."
                className="w-full px-4 py-2.5 rounded-lg border border-surface-300 text-surface-900 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all placeholder:text-surface-400"
              />

            </div>

          </div>

        </div>

        {/* MILESTONES */}
        <div className="bg-white rounded-xl border border-surface-200 p-6 shadow-xs space-y-5">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-100">

            <div>

              <h2 className="text-base font-bold text-surface-900 flex items-center gap-2">

                <DollarSign className="w-4 h-4 text-brand-600" />

                <span>
                  Milestone & Escrow Release Schedule
                </span>

              </h2>

              <p className="text-xs text-surface-500 mt-0.5">
                Funds are released in stages as evidence is verified by AI and approved by you.
              </p>

            </div>

            {/* ADD MILESTONE */}
            <button
              type="button"
              onClick={
                addMilestone
              }
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-lg transition-colors self-start sm:self-auto cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >

              <Plus className="w-3.5 h-3.5" />

              <span>
                Add Milestone
              </span>

            </button>

          </div>

          {/* ALLOCATION */}
          <div className="p-4 rounded-xl bg-surface-50 border border-surface-200">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 text-xs">

              <div className="flex items-center gap-2 font-medium text-surface-700">

                <span>
                  Escrow Allocation:
                </span>

                <span className="font-bold text-surface-900">
                  {currencySymbol}
                  {milestoneTotal.toLocaleString()}{' '}
                  of{' '}
                  {currencySymbol}
                  {dealTotal.toLocaleString()}
                </span>

                <span>
                  ({allocationPercent}%)
                </span>

              </div>

              <div className="flex items-center gap-1.5 font-bold">

                {isBalanced ? (
                  <span className="text-accent-600 flex items-center gap-1">

                    <CheckCircle2 className="w-3.5 h-3.5" />

                    100% Balanced

                  </span>
                ) : remainingAmount >
                  0 ? (
                  <span className="text-warning-600">
                    Remaining to Allocate:{' '}
                    {currencySymbol}
                    {remainingAmount.toLocaleString()}
                  </span>
                ) : (
                  <span className="text-danger-600">
                    Overallocated by{' '}
                    {currencySymbol}
                    {Math.abs(
                      remainingAmount
                    ).toLocaleString()}
                  </span>
                )}

              </div>

            </div>

            {/* PROGRESS */}
            <div className="h-2 rounded-full bg-surface-200 overflow-hidden">

              <div
                className={`h-full transition-all duration-300 ${
                  isBalanced
                    ? 'bg-accent-500'
                    : remainingAmount >
                        0
                      ? 'bg-brand-500'
                      : 'bg-danger-500'
                }`}
                style={{
                  width: `${Math.min(
                    100,
                    allocationPercent
                  )}%`,
                }}
              />

            </div>

          </div>

          {/* MILESTONE LIST */}
          <div className="space-y-4">

            {milestones.map(
              (
                milestone,
                index
              ) => (
                <div
                  key={
                    milestone.id
                  }
                  className="p-4 sm:p-5 rounded-xl border border-surface-200 bg-surface-50/40 hover:bg-white hover:border-brand-200 transition-all space-y-4"
                >

                  {/* STAGE HEADER */}
                  <div className="flex items-center justify-between gap-2">

                    <div className="flex items-center gap-2">

                      <span className="w-6 h-6 rounded-full bg-surface-900 text-white text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </span>

                      <span className="text-xs font-bold text-surface-600 uppercase tracking-wider">
                        Stage {index + 1}
                      </span>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        removeMilestone(
                          milestone.id
                        )
                      }
                      className="text-surface-400 hover:text-danger-600 p-1 rounded-md transition-colors cursor-pointer"
                      title="Remove milestone"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </div>

                  {/* MILESTONE FIELDS */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    {/* TITLE */}
                    <div className="md:col-span-2">

                      <label className="block text-xs font-medium text-surface-600 mb-1">
                        Milestone Title{' '}
                        <span className="text-danger-500">
                          *
                        </span>
                      </label>

                      <input
                        type="text"
                        value={
                          milestone.title
                        }
                        onChange={(e) =>
                          handleMilestoneChange(
                            milestone.id,
                            'title',
                            e.target.value
                          )
                        }
                        placeholder="e.g. Design Spec Approval"
                        className="w-full px-3.5 py-2 rounded-lg border border-surface-300 text-surface-900 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white"
                        required
                      />

                    </div>

                    {/* AMOUNT */}
                    <div>

                      <label className="block text-xs font-medium text-surface-600 mb-1">
                        Milestone Amount{' '}
                        <span className="text-danger-500">
                          *
                        </span>
                      </label>

                      <div className="relative">

                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 text-xs font-semibold">
                          {currencySymbol}
                        </span>

                        <input
                          type="number"
                          value={
                            milestone.amount
                          }
                          onChange={(e) =>
                            handleMilestoneChange(
                              milestone.id,
                              'amount',
                              e.target.value
                            )
                          }
                          placeholder="50000"
                          min="1"
                          step="any"
                          className="w-full pl-7 pr-3 py-2 rounded-lg border border-surface-300 text-surface-900 text-sm font-semibold focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white font-mono"
                          required
                        />

                      </div>

                    </div>

                    {/* DATE */}
                    <div>

                      <label className="block text-xs font-medium text-surface-600 mb-1 flex items-center gap-1">

                        <Calendar className="w-3 h-3 text-surface-400" />

                        Target Due Date

                      </label>

                      <input
                        type="date"
                        value={
                          milestone.dueDate
                        }
                        onChange={(e) =>
                          handleMilestoneChange(
                            milestone.id,
                            'dueDate',
                            e.target.value
                          )
                        }
                        className="w-full px-3.5 py-2 rounded-lg border border-surface-300 text-surface-700 text-sm bg-white focus:border-brand-500"
                      />

                    </div>

                    {/* CONDITIONS */}
                    <div className="md:col-span-2">

                      <label className="block text-xs font-medium text-surface-600 mb-1 flex items-center gap-1">

                        <ShieldCheck className="w-3.5 h-3.5 text-accent-600" />

                        Required Release Condition / Evidence

                      </label>

                      <input
                        type="text"
                        value={
                          milestone.conditions
                        }
                        onChange={(e) =>
                          handleMilestoneChange(
                            milestone.id,
                            'conditions',
                            e.target.value
                          )
                        }
                        placeholder="e.g. Factory inspection report, signed bill of lading, or buyer QA approval"
                        className="w-full px-3.5 py-2 rounded-lg border border-surface-300 text-surface-900 text-sm bg-white focus:border-brand-500"
                      />

                    </div>

                    {/* DESCRIPTION */}
                    <div className="md:col-span-3">

                      <label className="block text-xs font-medium text-surface-600 mb-1">
                        Milestone Description
                      </label>

                      <textarea
                        value={
                          milestone.description
                        }
                        onChange={(e) =>
                          handleMilestoneChange(
                            milestone.id,
                            'description',
                            e.target.value
                          )
                        }
                        rows={2}
                        placeholder="Describe what needs to be completed in this milestone..."
                        className="w-full px-3.5 py-2 rounded-lg border border-surface-300 text-surface-900 text-sm bg-white focus:border-brand-500"
                      />

                    </div>

                  </div>

                </div>
              )
            )}

          </div>

        </div>

        {/* ESCROW PRINCIPLE */}
        <div className="p-4 rounded-xl bg-brand-50/50 border border-brand-100 flex items-start gap-3">

          <ShieldCheck className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />

          <div className="text-xs text-brand-900">

            <p className="font-semibold">
              SettleX Escrow Principle
            </p>

            <p className="text-brand-700 mt-0.5 leading-relaxed">
              "AI understands. Rules decide. Money moves only when conditions are satisfied."
              Funds remain safely held in simulated escrow and cannot be released without verified completion.
            </p>

          </div>

        </div>

        {/* SUBMIT */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              navigate('/deals')
            }
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            loading={loading}
            size="lg"
            className="w-full sm:w-auto"
            icon={ArrowRight}
            disabled={
              loadingSellers ||
              sellers.length === 0
            }
          >
            Create & Initialize Escrow
          </Button>

        </div>

      </form>

    </div>
  );
}