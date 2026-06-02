import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Activity, PlusCircle, CheckCircle2, Circle, Trash2, Calculator, Info } from 'lucide-react';
import type { DebtType, RepaymentMethod } from '../types';
import { CustomSelect } from './CustomSelect';
import { formatThousand, parseThousand } from '../utils/format';

export const DebtTab: React.FC = () => {
  const { debts, addDebt, toggleDebtStatus, deleteDebt, showToast, confirm } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'list' | 'calculator'>('list');

  // Form states for adding new debt
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [interestRate, setInterestRate] = useState('0');
  const [termMonths, setTermMonths] = useState('12');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [debtType, setDebtType] = useState<DebtType>('to_pay');
  const [repaymentMethod, setRepaymentMethod] = useState<RepaymentMethod>('emi');
  const [notes, setNotes] = useState('');

  // Interactive Calculator states
  const [calcAmount, setCalcAmount] = useState('50,000,000');
  const [calcInterest, setCalcInterest] = useState('10');
  const [calcTerm, setCalcTerm] = useState('12');
  const [calcMethod, setCalcMethod] = useState<RepaymentMethod>('emi');

  // Helper: Format currency in VNĐ
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleAddDebtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseThousand(amount);
    const parsedRate = parseFloat(interestRate);
    const parsedTerm = parseInt(termMonths);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      showToast('Vui lòng nhập số tiền nợ hợp lệ.', 'error');
      return;
    }
    if (isNaN(parsedRate) || parsedRate < 0) {
      showToast('Vui lòng nhập lãi suất hợp lệ.', 'error');
      return;
    }
    if (isNaN(parsedTerm) || parsedTerm <= 0) {
      showToast('Vui lòng nhập kỳ hạn thanh toán.', 'error');
      return;
    }
    if (!name.trim()) {
      showToast('Vui lòng điền tên khoản nợ.', 'error');
      return;
    }

    addDebt(name.trim(), parsedAmount, parsedRate, parsedTerm, startDate, debtType, repaymentMethod, notes.trim());
    
    // Reset Form
    setName('');
    setAmount('');
    setInterestRate('0');
    setStartDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setShowAddForm(false);
    showToast('Lưu khoản nợ mới thành công!', 'success');
  };

  // Repayment Calculation Engine (Used both for active debt view & standalone calculator)
  const calculateRepayments = (p: number, annualRate: number, months: number, method: RepaymentMethod) => {
    const monthlyRate = (annualRate / 100) / 12;
    const schedule = [];
    let remainingPrincipal = p;
    let totalInterest = 0;

    if (method === 'emi') {
      // Equated Monthly Installment (EMI) formula: EMI = [P x R x (1+R)^N]/[(1+R)^N - 1]
      let monthlyPayment = 0;
      if (monthlyRate > 0) {
        monthlyPayment = (p * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
      } else {
        monthlyPayment = p / months;
      }

      for (let i = 1; i <= months; i++) {
        const interest = remainingPrincipal * monthlyRate;
        const principal = monthlyPayment - interest;
        remainingPrincipal -= principal;
        totalInterest += interest;

        schedule.push({
          month: i,
          payment: monthlyPayment,
          principal,
          interest,
          remaining: Math.max(0, remainingPrincipal)
        });
      }
    } else {
      // Reducing Balance method: Principal paid equally each month, Interest calculated on remaining balance
      const monthlyPrincipal = p / months;
      for (let i = 1; i <= months; i++) {
        const interest = remainingPrincipal * monthlyRate;
        const payment = monthlyPrincipal + interest;
        remainingPrincipal -= monthlyPrincipal;
        totalInterest += interest;

        schedule.push({
          month: i,
          payment,
          principal: monthlyPrincipal,
          interest,
          remaining: Math.max(0, remainingPrincipal)
        });
      }
    }

    return {
      schedule,
      totalInterest,
      totalPaid: p + totalInterest,
      monthlyPaymentAverage: (p + totalInterest) / months
    };
  };

  //standalone calculator computations
  const pAmount = parseThousand(calcAmount) || 0;
  const pRate = parseFloat(calcInterest) || 0;
  const pTerm = parseInt(calcTerm) || 12;
  const calcResults = calculateRepayments(pAmount, pRate, pTerm, calcMethod);

  return (
    <div className="pb-24 px-4 pt-6 max-w-md mx-auto space-y-6">
      
      {/* Tab Header & Quick Info */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-vietnam text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
          <Activity className="text-[#6f8d6d]" />
          Quản Lý Nợ & Trả Góp
        </h2>
      </div>

      {/* Sub-tab selection */}
      <div className="bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl flex gap-1">
        <button
          onClick={() => setActiveSubTab('list')}
          className={`flex-1 py-2 text-xs font-bold font-vietnam rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'list'
              ? 'bg-white dark:bg-zinc-800 text-[#6f8d6d] shadow-sm'
              : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-500'
          }`}
        >
          Danh sách nợ
        </button>
        <button
          onClick={() => setActiveSubTab('calculator')}
          className={`flex-1 py-2 text-xs font-bold font-vietnam rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'calculator'
              ? 'bg-white dark:bg-zinc-800 text-[#6f8d6d] shadow-sm'
              : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-500'
          }`}
        >
          <Calculator size={14} />
          Công cụ tính
        </button>
      </div>

      {/* SUBTAB 1: DEBTS LIST */}
      {activeSubTab === 'list' && (
        <div className="space-y-4">
          
          {/* Collapse Form Button */}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold font-vietnam text-[#6f8d6d] hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.01)]"
          >
            <PlusCircle size={16} />
            {showAddForm ? 'Đóng form nhập nợ' : 'Thêm khoản nợ mới'}
          </button>

          {/* Collapsible Add Debt Form */}
          {showAddForm && (
            <form onSubmit={handleAddDebtSubmit} className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-md space-y-4 animate-slide-down">
              <h3 className="text-xs font-bold font-vietnam text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">Nhập khoản nợ mới</h3>
              
              <div className="space-y-3">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-vietnam text-zinc-400 dark:text-zinc-500 uppercase">Tên khoản nợ / Đối tác</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ví dụ: Vay mua iPhone, Cho Nam mượn..."
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl px-3 py-2 text-xs font-medium font-vietnam focus:outline-none focus:ring-1 focus:ring-[#8fae8d]"
                  />
                </div>

                {/* Amount & Interest */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold font-vietnam text-zinc-400 dark:text-zinc-500 uppercase">Số tiền gốc (VNĐ)</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      required
                      value={amount}
                      onChange={(e) => setAmount(formatThousand(e.target.value))}
                      placeholder="0"
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl px-3 py-2 text-xs font-bold font-vietnam focus:outline-none focus:ring-1 focus:ring-[#8fae8d]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold font-vietnam text-zinc-400 dark:text-zinc-500 uppercase">Lãi suất (% / năm)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      placeholder="0"
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl px-3 py-2 text-xs font-bold font-vietnam focus:outline-none focus:ring-1 focus:ring-[#8fae8d]"
                    />
                  </div>
                </div>

                {/* Term & Start Date */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold font-vietnam text-zinc-400 dark:text-zinc-500 uppercase">Kỳ hạn (Tháng)</label>
                    <CustomSelect
                      value={termMonths}
                      onChange={setTermMonths}
                      options={[
                        { value: '3', label: '3 tháng' },
                        { value: '6', label: '6 tháng' },
                        { value: '9', label: '9 tháng' },
                        { value: '12', label: '12 tháng' },
                        { value: '18', label: '18 tháng' },
                        { value: '24', label: '24 tháng' },
                        { value: '36', label: '36 tháng' },
                      ]}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold font-vietnam text-zinc-400 dark:text-zinc-500 uppercase">Ngày bắt đầu</label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl px-3 py-2 text-xs font-medium font-vietnam focus:outline-none focus:ring-1 focus:ring-[#8fae8d]"
                    />
                  </div>
                </div>

                {/* Debt Type & Method */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold font-vietnam text-zinc-400 dark:text-zinc-500 uppercase">Loại nợ</label>
                    <div className="bg-zinc-50 dark:bg-zinc-950 p-1 border border-zinc-100 dark:border-zinc-850 rounded-xl flex gap-1">
                      <button
                        type="button"
                        onClick={() => setDebtType('to_pay')}
                        className={`flex-1 py-1.5 text-[10px] font-bold font-vietnam rounded-lg transition-all ${
                          debtType === 'to_pay' ? 'bg-[#8fae8d] text-white shadow-sm' : 'text-zinc-400'
                        }`}
                      >
                        Vay nợ (-)
                      </button>
                      <button
                        type="button"
                        onClick={() => setDebtType('to_collect')}
                        className={`flex-1 py-1.5 text-[10px] font-bold font-vietnam rounded-lg transition-all ${
                          debtType === 'to_collect' ? 'bg-emerald-500 text-white shadow-sm' : 'text-zinc-400'
                        }`}
                      >
                        Cho vay (+)
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold font-vietnam text-zinc-400 dark:text-zinc-500 uppercase">Cách tính lãi</label>
                    <div className="bg-zinc-50 dark:bg-zinc-950 p-1 border border-zinc-100 dark:border-zinc-850 rounded-xl flex gap-1">
                      <button
                        type="button"
                        onClick={() => setRepaymentMethod('emi')}
                        className={`flex-1 py-1.5 text-[10px] font-bold font-vietnam rounded-lg transition-all ${
                          repaymentMethod === 'emi' ? 'bg-[#6f8d6d] text-white shadow-sm' : 'text-zinc-400'
                        }`}
                      >
                        EMI (Đều)
                      </button>
                      <button
                        type="button"
                        onClick={() => setRepaymentMethod('reducing_balance')}
                        className={`flex-1 py-1.5 text-[10px] font-bold font-vietnam rounded-lg transition-all ${
                          repaymentMethod === 'reducing_balance' ? 'bg-[#6f8d6d] text-white shadow-sm' : 'text-zinc-400'
                        }`}
                      >
                        Dư nợ giảm
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-vietnam text-zinc-400 dark:text-zinc-500 uppercase">Ghi chú thêm</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Mô tả cụ thể (ngân hàng nào, liên hệ...)"
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl px-3 py-2 text-xs font-medium font-vietnam focus:outline-none focus:ring-1 focus:ring-[#8fae8d]"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full py-3 bg-[#6f8d6d] text-white text-xs font-bold font-vietnam rounded-xl shadow-md hover:bg-[#5b755a] active:scale-95 transition-all mt-2"
                >
                  Lưu Khoản Nợ
                </button>

              </div>
            </form>
          )}

          {/* Active Debts List */}
          {debts.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-8 text-center text-zinc-400 dark:text-zinc-500 shadow-[0_4px_16px_rgba(0,0,0,0.01)]">
              <Info className="mx-auto mb-2 opacity-50" size={24} />
              <p className="text-xs font-vietnam">Chưa có khoản nợ nào được thiết lập.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {debts.map(d => {
                const isPay = d.type === 'to_pay';
                const isPaid = d.status === 'paid';
                const scheduleData = calculateRepayments(d.amount, d.interestRate, d.termMonths, d.repaymentMethod);

                return (
                  <div
                    key={d.id}
                    className={`bg-white dark:bg-zinc-900 border rounded-3xl p-4.5 shadow-[0_4px_16px_rgba(0,0,0,0.02)] transition-all relative ${
                      isPaid 
                        ? 'border-zinc-100 dark:border-zinc-800/80 opacity-60' 
                        : isPay 
                          ? 'border-[#8fae8d]/40 dark:border-[#8fae8d]/20'
                          : 'border-emerald-300 dark:border-emerald-900/30'
                    }`}
                  >
                    {/* Header: Status toggle checkbox & title */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleDebtStatus(d.id)}
                          className={`shrink-0 transition-transform active:scale-90 ${
                            isPaid ? 'text-emerald-500 dark:text-emerald-400' : 'text-zinc-300 dark:text-zinc-700'
                          }`}
                          title={isPaid ? "Đánh dấu chưa tất toán" : "Đánh dấu đã tất toán"}
                        >
                          {isPaid ? <CheckCircle2 size={20} strokeWidth={2.5} /> : <Circle size={20} />}
                        </button>
                        
                        <div>
                          <h4 className={`text-xs font-bold font-vietnam text-zinc-800 dark:text-zinc-200 ${isPaid ? 'line-through text-zinc-400 dark:text-zinc-600' : ''}`}>
                            {d.name}
                          </h4>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-vietnam uppercase font-bold mt-1 inline-block ${
                            isPay 
                              ? 'bg-[#8fae8d]/10 text-[#5b755a]' 
                              : 'bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                          }`}>
                            {isPay ? 'Nợ phải trả' : 'Cần thu hồi'}
                          </span>
                        </div>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={async () => {
                          const confirmDelete = await confirm(
                            'Xác nhận xóa nợ',
                            `Bạn có chắc chắn muốn xóa khoản nợ "${d.name}" này?`
                          );
                          if (confirmDelete) {
                            deleteDebt(d.id);
                            showToast(`Đã xóa khoản nợ "${d.name}" thành công!`, 'success');
                          }
                        }}
                        className="p-1 text-zinc-300 hover:text-rose-500 active:scale-90 transition-colors cursor-pointer"
                        title="Xóa khoản nợ"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Details content */}
                    <div className="grid grid-cols-2 gap-4 mt-4 pt-3.5 border-t border-zinc-50 dark:border-zinc-800/60 text-xs font-vietnam text-zinc-500">
                      <div>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase block font-semibold">Gốc ban đầu</span>
                        <span className="font-bold text-zinc-700 dark:text-zinc-300 mt-0.5 block">{formatVND(d.amount)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase block font-semibold">Trả hàng tháng (Avg)</span>
                        <span className="font-bold text-zinc-700 dark:text-zinc-300 mt-0.5 block">{formatVND(scheduleData.monthlyPaymentAverage)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase block font-semibold">Thời hạn & Lãi suất</span>
                        <span className="font-semibold text-zinc-600 dark:text-zinc-400 mt-0.5 block">
                          {d.termMonths}T • Lãi {d.interestRate}%/năm
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase block font-semibold">Tổng trả (Gốc + Lãi)</span>
                        <span className="font-bold text-[#6f8d6d] mt-0.5 block">{formatVND(scheduleData.totalPaid)}</span>
                      </div>
                    </div>

                    {/* Notes if any */}
                    {d.notes && (
                      <div className="mt-3.5 p-2.5 bg-zinc-50 dark:bg-zinc-950/40 rounded-xl border border-zinc-100 dark:border-zinc-850/50 text-[10px] font-vietnam text-zinc-400 leading-relaxed">
                        <span className="font-bold text-zinc-500 dark:text-zinc-400">Ghi chú:</span> {d.notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* SUBTAB 2: INDEPENDENT INSTALLMENT CALCULATOR */}
      {activeSubTab === 'calculator' && (
        <div className="space-y-5">
          
          {/* User inputs card */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_16px_rgba(0,0,0,0.01)] space-y-4">
            <h3 className="text-xs font-bold font-vietnam text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
              <Calculator size={15} className="text-[#6f8d6d]" />
              Thiết lập thông số khoản vay
            </h3>

            <div className="space-y-3.5">
              {/* Vay Amount */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold font-vietnam text-zinc-400 dark:text-zinc-500 uppercase">Số tiền vay gốc (VNĐ)</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={calcAmount}
                    onChange={(e) => setCalcAmount(formatThousand(e.target.value))}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl px-3 py-2 text-xs font-bold font-vietnam focus:outline-none focus:ring-1 focus:ring-[#8fae8d]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-400">đ</span>
                </div>
              </div>

              {/* Lãi suất & Kỳ hạn */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-vietnam text-zinc-400 dark:text-zinc-500 uppercase">Lãi suất (% / năm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={calcInterest}
                    onChange={(e) => setCalcInterest(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl px-3 py-2 text-xs font-bold font-vietnam focus:outline-none focus:ring-1 focus:ring-[#8fae8d]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-vietnam text-zinc-400 dark:text-zinc-500 uppercase">Thời hạn trả nợ (Tháng)</label>
                  <CustomSelect
                    value={calcTerm}
                    onChange={setCalcTerm}
                    options={[
                      { value: '3', label: '3 tháng' },
                      { value: '6', label: '6 tháng' },
                      { value: '9', label: '9 tháng' },
                      { value: '12', label: '12 tháng' },
                      { value: '18', label: '18 tháng' },
                      { value: '24', label: '24 tháng' },
                      { value: '36', label: '36 tháng' },
                    ]}
                  />
                </div>
              </div>

              {/* Repayment Method Select */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold font-vietnam text-zinc-400 dark:text-zinc-500 uppercase block">Phương thức tính gốc & lãi</label>
                <div className="bg-zinc-100 dark:bg-zinc-950 p-1 border border-zinc-200/50 dark:border-zinc-800 rounded-xl flex gap-1">
                  <button
                    type="button"
                    onClick={() => setCalcMethod('emi')}
                    className={`flex-1 py-2 text-xs font-bold font-vietnam rounded-lg transition-all ${
                      calcMethod === 'emi' ? 'bg-white dark:bg-zinc-800 text-[#6f8d6d] shadow-sm' : 'text-zinc-400'
                    }`}
                  >
                    EMI (Trả đều định kỳ)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalcMethod('reducing_balance')}
                    className={`flex-1 py-2 text-xs font-bold font-vietnam rounded-lg transition-all ${
                      calcMethod === 'reducing_balance' ? 'bg-white dark:bg-zinc-800 text-[#6f8d6d] shadow-sm' : 'text-zinc-400'
                    }`}
                  >
                    Dư nợ gốc giảm dần
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Calculator Quick Results summary */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-850 p-3 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.01)]">
              <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-vietnam font-semibold uppercase block">Trả hàng tháng (Avg)</span>
              <span className="text-[11px] font-bold font-vietnam text-[#6f8d6d] mt-1 block">{formatVND(calcResults.monthlyPaymentAverage)}</span>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-850 p-3 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.01)]">
              <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-vietnam font-semibold uppercase block">Tổng lãi phát sinh</span>
              <span className="text-[11px] font-bold font-vietnam text-rose-500 mt-1 block">{formatVND(calcResults.totalInterest)}</span>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-850 p-3 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.01)]">
              <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-vietnam font-semibold uppercase block">Tổng tiền phải trả</span>
              <span className="text-[11px] font-bold font-vietnam text-zinc-700 dark:text-zinc-200 mt-1 block">{formatVND(calcResults.totalPaid)}</span>
            </div>
          </div>

          {/* Method detailed notice */}
          <div className="bg-[#8fae8d]/5 p-3.5 rounded-2xl border border-[#8fae8d]/10 text-[10px] font-vietnam text-zinc-500 dark:text-zinc-400 leading-relaxed flex items-start gap-2">
            <Info size={14} className="text-[#6f8d6d] shrink-0 mt-0.5" />
            <div>
              {calcMethod === 'emi' ? (
                <p>
                  <strong>Hình thức Trả đều hàng tháng (EMI):</strong> Tổng số tiền thanh toán cả gốc lẫn lãi là <strong>cố định</strong> mỗi tháng. Tiền lãi tính trên dư nợ giảm dần, nên tỷ trọng trả gốc tăng lên và trả lãi giảm đi qua từng kỳ thanh toán.
                </p>
              ) : (
                <p>
                  <strong>Hình thức Dư nợ giảm dần:</strong> Tiền gốc trả đều hàng tháng. Tiền lãi tính trực tiếp trên dư nợ còn lại, dẫn đến <strong>tổng số tiền thanh toán giảm dần</strong> theo thời gian. Tháng đầu tiên sẽ trả cao nhất và giảm dần về tháng cuối.
                </p>
              )}
            </div>
          </div>

          {/* Amortization detailed schedule table */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.01)]">
            <div className="px-4.5 py-3 border-b border-zinc-50 dark:border-zinc-800/80 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/20">
              <h4 className="text-[10px] font-bold font-vietnam text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">Bảng kế hoạch trả nợ chi tiết</h4>
              <span className="text-[9px] px-2 py-0.5 bg-zinc-100 dark:bg-zinc-850 text-zinc-500 rounded-full font-vietnam">
                {pTerm} Kỳ
              </span>
            </div>
            
            <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
              <table className="w-full text-[10px] font-vietnam text-zinc-600 dark:text-zinc-400 border-collapse">
                <thead className="bg-zinc-50/30 dark:bg-zinc-950/10 border-b border-zinc-50 dark:border-zinc-800 text-[9px] text-zinc-400 font-bold uppercase tracking-wider sticky top-0 backdrop-blur-md">
                  <tr>
                    <th className="py-2.5 px-3 text-left">Kỳ</th>
                    <th className="py-2.5 px-2 text-right">Tiền gốc</th>
                    <th className="py-2.5 px-2 text-right">Tiền lãi</th>
                    <th className="py-2.5 px-2 text-right">Phải trả</th>
                    <th className="py-2.5 px-3 text-right">Dư nợ gốc</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                  {calcResults.schedule.map(row => (
                    <tr key={row.month} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-800/10">
                      <td className="py-2 px-3 text-left font-bold text-zinc-500">T{row.month}</td>
                      <td className="py-2 px-2 text-right">{formatVND(row.principal)}</td>
                      <td className="py-2 px-2 text-right text-rose-500">{formatVND(row.interest)}</td>
                      <td className="py-2 px-2 text-right font-bold text-zinc-700 dark:text-zinc-200">{formatVND(row.payment)}</td>
                      <td className="py-2 px-3 text-right text-zinc-400">{formatVND(row.remaining)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
