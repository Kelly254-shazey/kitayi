import React, { useState } from 'react';
import { api } from '../services/api';
import {
  AlertCircle, CheckCircle, Clock, DollarSign, Mail, Phone,
  ArrowRight, Search, ShieldCheck, Smartphone, CreditCard, Lock
} from 'lucide-react';

interface BillPaymentState {
  step: 'account-lookup' | 'bill-details' | 'payment' | 'confirmation';
  accountNumber: string;
  outstandingBalance: string;
  paymentMethod: string;
  email: string;
  phone: string;
  amount: string;
  transactionRef: string;
}

const AnonymousBillPay: React.FC = () => {
  const [state, setState] = useState<BillPaymentState>({
    step: 'account-lookup',
    accountNumber: '',
    outstandingBalance: '0',
    paymentMethod: '',
    email: '',
    phone: '',
    amount: '',
    transactionRef: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  const handleAccountLookup = async () => {
    if (!state.accountNumber.match(/^KS-\d{4}-\d{4}$/)) {
      setError('Invalid account number format. Expected: KS-XXXX-XXXX');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/bill-pay/initiate/', {
        kitayi_account_number: state.accountNumber,
        email: state.email,
        phone: state.phone,
      });

      setState(prev => ({
        ...prev,
        outstandingBalance: response.data.outstanding_balance || '0',
        step: 'bill-details',
      }));
    } catch (err) {
      setError('Failed to look up account. Please verify your details.');
      console.error('Bill lookup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentInitiate = async () => {
    if (!state.amount || !state.paymentMethod) {
      setError('Please enter amount and select payment method');
      return;
    }

    if (parseFloat(state.amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/bill-pay/pay/', {
        kitayi_account_number: state.accountNumber,
        amount: state.amount,
        payment_method: state.paymentMethod,
        email: state.email,
        phone: state.phone,
      });

      setState(prev => ({
        ...prev,
        transactionRef: response.data.transaction_reference,
        step: 'payment',
      }));
    } catch (err) {
      setError('Failed to initiate payment. Please try again.');
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Account Lookup Step
  if (state.step === 'account-lookup') {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Pay Your Kitayi Bill</h1>
          <p className="text-slate-600">No account required. Just enter your account number to pay</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Account Number */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Kitayi Account Number
              </label>
              <input
                type="text"
                placeholder="KS-1234-5678"
                value={state.accountNumber}
                onChange={(e) => setState(prev => ({
                  ...prev,
                  accountNumber: e.target.value.toUpperCase()
                }))}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-500 mt-1">Format: KS-XXXX-XXXX (shown on your bill)</p>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  <Mail size={16} className="inline mr-1" />
                  Email (optional)
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={state.email}
                  onChange={(e) => setState(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  <Phone size={16} className="inline mr-1" />
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  placeholder="+254..."
                  value={state.phone}
                  onChange={(e) => setState(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Security Note */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
              <ShieldCheck size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-blue-700 text-sm">
                Your information is secure and encrypted. We use PCI-DSS compliant payment processing.
              </p>
            </div>

            <button
              onClick={handleAccountLookup}
              disabled={loading || !state.accountNumber}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-all"
            >
              {loading ? 'Looking up account...' : 'Look Up Account'}
              {!loading && <Search size={20} />}
            </button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Clock, title: 'Instant Processing', desc: 'Payments processed in seconds' },
            { icon: Lock, title: 'Secure Payment', desc: 'Bank-level encryption' },
            { icon: DollarSign, title: 'No Hidden Fees', desc: 'Transparent pricing' },
          ].map((card, idx) => (
            <div key={idx} className="bg-white rounded-lg border border-slate-200 p-4 text-center">
              <card.icon size={32} className="mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold text-slate-900">{card.title}</h3>
              <p className="text-sm text-slate-600">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Bill Details Step
  if (state.step === 'bill-details') {
    const balance = parseFloat(state.outstandingBalance);

    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Outstanding Bill</h1>
          <p className="text-slate-600">Account: {state.accountNumber}</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle size={20} className="text-red-600" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Balance Display */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 mb-6 border border-blue-200">
            <p className="text-slate-600 text-sm mb-1">Outstanding Balance</p>
            <p className="text-4xl font-bold text-slate-900">KES {balance.toFixed(2)}</p>
          </div>

          {/* Payment Amount */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Amount to Pay
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-600 font-semibold">
                KES
              </span>
              <input
                type="number"
                min="0"
                max={balance}
                value={state.amount}
                onChange={(e) => setState(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mt-2 flex gap-2 flex-wrap">
              {[balance * 0.25, balance * 0.5, balance * 0.75, balance].map(amount => (
                <button
                  key={amount}
                  onClick={() => setState(prev => ({ ...prev, amount: amount.toFixed(2) }))}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm rounded-lg transition-colors"
                >
                  KES {amount.toFixed(0)}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              Select Payment Method
            </label>
            <div className="space-y-2">
              {[
                { value: 'M-Pesa', icon: Smartphone, label: 'M-Pesa' },
                { value: 'Card', icon: CreditCard, label: 'Credit/Debit Card' },
                { value: 'Bank Transfer', icon: DollarSign, label: 'Bank Transfer' },
              ].map(method => (
                <label key={method.value} className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  state.paymentMethod === method.value ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <input
                    type="radio"
                    name="payment-method"
                    value={method.value}
                    checked={state.paymentMethod === method.value}
                    onChange={(e) => setState(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    className="w-4 h-4"
                  />
                  <method.icon size={20} className="text-slate-600" />
                  <span className="font-semibold text-slate-900">{method.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-4">
            <button
              onClick={() => setState(prev => ({ ...prev, step: 'account-lookup' }))}
              className="flex-1 px-6 py-3 border border-slate-300 text-slate-900 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handlePaymentInitiate}
              disabled={loading || !state.amount || !state.paymentMethod}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-all"
            >
              {loading ? 'Processing...' : 'Continue to Payment'}
              {!loading && <ArrowRight size={20} />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Payment Processing & Confirmation
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="bg-white rounded-lg border border-emerald-200 p-8 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-emerald-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Payment Successful!</h1>
        <p className="text-slate-600 mb-2">Your bill payment has been processed.</p>
        
        <div className="bg-slate-50 rounded-lg p-4 my-6 text-left">
          <p className="text-sm text-slate-600">
            <strong>Transaction Reference:</strong> {state.transactionRef}
          </p>
          <p className="text-sm text-slate-600 mt-1">
            <strong>Amount Paid:</strong> KES {parseFloat(state.amount).toFixed(2)}
          </p>
        </div>

        <p className="text-slate-600 mb-6">
          You'll receive a confirmation email shortly. Keep your transaction reference for your records.
        </p>

        <button
          onClick={() => window.location.href = '/'}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
        >
          Return Home <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default AnonymousBillPay;
