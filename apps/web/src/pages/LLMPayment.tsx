import { motion } from 'framer-motion'
import { ArrowLeft, CreditCard } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { GlassCard } from '../components/GlassCard'
import { Navbar } from '../components/Navbar'
import { PricingSection } from '../components/ui/pricing'
import { ShinyButton } from '../components/ui/shiny-button'
import { useAuth } from '../context/AuthContext'
import { useApi as apiEnabled } from '../lib/api/client'
import * as subscriptionsApi from '../lib/api/subscriptions.api'

export function LLMPayment() {
  const { isAuthenticated } = useAuth()
  const useApiMode = apiEnabled
  const [selectedPlan, setSelectedPlan] = useState('pro')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(useApiMode)

  useEffect(() => {
    if (!useApiMode || !isAuthenticated) {
      setLoading(false)
      return
    }

    subscriptionsApi
      .fetchCurrentSubscription()
      .then((subscription) => {
        setSelectedPlan(subscription.planId)
        setBillingCycle(subscription.billingCycle)
      })
      .catch(() => undefined)
      .finally(() => setLoading(false))
  }, [isAuthenticated, useApiMode])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const handleSelectPlan = async (planId: string) => {
    setSelectedPlan(planId)
    setError(null)

    if (!useApiMode) {
      localStorage.setItem('memoroute_llm_plan', planId)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
      return
    }

    try {
      await subscriptionsApi.checkoutSubscription({
        planId,
        billingCycle,
        paymentToken: 'tok_mock_card_1234',
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : 'Checkout failed')
    }
  }

  const plans = [
    {
      name: 'Starter',
      price: '0',
      yearlyPrice: '0',
      period: 'month',
      features: [
        '10 LECTOR AI evaluations/day',
        'Basic spaced repetition',
        'Text explanations only',
        'Community access',
      ],
      description: 'Perfect for individual learners & light practice.',
      buttonText: selectedPlan === 'starter' ? 'Selected Plan' : 'Select Starter',
      href: '#',
      onSelect: () => handleSelectPlan('starter'),
    },
    {
      name: 'Pro Mastery',
      price: '299',
      yearlyPrice: '239',
      period: 'month',
      features: [
        'Unlimited LECTOR evaluations',
        'Voice + text explanations',
        'Accelerated Exam Mode access',
        'Priority adaptive scheduling',
        'Personalized retention health stats',
      ],
      description: 'Ideal for students preparing for major exams.',
      buttonText: selectedPlan === 'pro' ? 'Selected Plan' : 'Select Pro Mastery',
      href: '#',
      isPopular: true,
      onSelect: () => handleSelectPlan('pro'),
    },
    {
      name: 'Enterprise / Team',
      price: '999',
      yearlyPrice: '799',
      period: 'month',
      features: [
        'Everything in Pro Mastery',
        'Up to 10 team members',
        'Admin analytics dashboard',
        'Custom LECTOR API integration',
        'Dedicated support & setup',
      ],
      description: 'For institutions, study groups & organizations.',
      buttonText: selectedPlan === 'team' ? 'Selected Plan' : 'Select Team',
      href: '#',
      onSelect: () => handleSelectPlan('team'),
    },
  ]

  return (
    <div className="min-h-screen bg-[#1e1917] text-white">
      <Navbar />
      
      <div className="pt-20">
        <PricingSection
          plans={plans}
          title="Find the Perfect Plan for LECTOR AI"
          description={`Choose the plan that fits your study pace.\nSelected Plan: ${selectedPlan.toUpperCase()}`}
        />
      </div>

      <main className="mx-auto max-w-xl px-4 pb-20">
        <GlassCard dark className="p-8 border border-white/15 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[#e8c89b]" />
              Payment Method &amp; Checkout
            </h2>
            <span className="rounded-full bg-[#e8c89b]/20 px-3 py-0.5 text-xs font-bold text-[#e8c89b]">
              Active: {selectedPlan.toUpperCase()}
            </span>
          </div>

          <p className="text-xs text-white/60 mb-6">
            {useApiMode
              ? 'Checkout uses the mock payment provider in development. Select a plan and confirm to activate it on your account.'
              : 'Enter payment credentials below to activate your plan. In development mode, clicking Save Plan Selection updates local storage.'}
          </p>

          <div className="mb-4 flex gap-2">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                billingCycle === 'monthly'
                  ? 'bg-[#e8c89b] text-[#1e1917]'
                  : 'bg-white/10 text-white/70 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                billingCycle === 'annual'
                  ? 'bg-[#e8c89b] text-[#1e1917]'
                  : 'bg-white/10 text-white/70 hover:text-white'
              }`}
            >
              Annual
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              void handleSelectPlan(selectedPlan)
            }}
            className="space-y-4"
          >
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#e8c89b]">
                Card Number
              </label>
              <div className="glass flex items-center gap-3 rounded-2xl px-4 py-3 border border-white/15">
                <CreditCard className="h-4 w-4 text-white/50" />
                <input
                  type="text"
                  placeholder="4532 •••• •••• 8892"
                  className="w-full bg-transparent text-sm text-white placeholder:text-white/40 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#e8c89b]">
                  Expiry
                </label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="glass w-full rounded-2xl px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none border border-white/15"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#e8c89b]">
                  CVV
                </label>
                <input
                  type="password"
                  placeholder="•••"
                  className="glass w-full rounded-2xl px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none border border-white/15"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/15 p-3 text-center text-xs font-semibold text-red-300">
                {error}
              </div>
            )}

            {saved && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-emerald-500/30 bg-emerald-500/15 p-3 text-center text-xs font-semibold text-emerald-300"
              >
                Plan selection successfully saved!
              </motion.div>
            )}

            <ShinyButton
              type="submit"
              label={
                loading
                  ? 'Loading plan...'
                  : saved
                    ? 'Plan Saved'
                    : 'Confirm & Save Plan Selection'
              }
              accentColor="#e8c89b"
              accentSoftColor="#f5efe8"
              fillColor="#2b2421"
              cornerRadius={9999}
              className="mt-4 w-full py-3.5 text-sm font-semibold"
            />
          </form>

          <Link
            to="/dashboard"
            className="mt-6 flex items-center justify-center gap-2 text-sm text-white/50 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </GlassCard>
      </main>
    </div>
  )
}

export default LLMPayment;
