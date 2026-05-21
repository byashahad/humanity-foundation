

"use client";
import React, { useState, useEffect } from "react";
import { useRouter, } from "next/navigation";
import { useMemo } from "react";
import { Heart, Target, Users, CreditCard, CheckCircle, ArrowRight, IndianRupee } from "lucide-react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

const PageContent = () => {
  const [donationData, setDonationData] = useState({
    name: "",
    email: "",
    amount: "",
  });
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [campaignData, setCampaignData] = useState(null);
  const [campaignID, setCampaignID] = useState(null);
  const [quickAmount, setQuickAmount] = useState(0);

  // Fetch campaign data
  useEffect(() => {
    if (id) {
      fetch(`/api/campaign/getcampaign?id=${id}`)
        .then((res) => res.json())
        .then((data) => {
          const campaigns = data.campaigns;
          if (Array.isArray(campaigns)) {
            const exactCampaign = campaigns.find((campaign) => campaign._id === id);
            setCampaignData(exactCampaign || null);
          } else if (campaigns && typeof campaigns === 'object') {
            setCampaignData(campaigns);
          } else {
            setCampaignData(null);
          }
        })
        .catch(err => console.error(err));
    } else if (!id) {
      fetch('/api/campaign/getcampaign')
        .then((res) => res.json())
        .then((data) => {
          setCampaignData(data?.campaigns || []);
        })
        .catch((err) => console.log(err));
    }
  }, [id]);

  // Selected campaign
  const selectedCampaign = useMemo(() => {
    if (id && campaignData) return campaignData;
    if (!id && campaignData && campaignID) {
      return campaignData.find((c) => c._id === campaignID);
    }
    return null;
  }, [id, campaignData, campaignID]);

  // Check if target reached
  const isTargetReached =
    selectedCampaign &&
    selectedCampaign.raisedAmount >= selectedCampaign.targetAmount;

  // Form disabled state
  const isFormDisabled =
    (id ? false : !campaignID) || isTargetReached;

  // Quick amount options
  const quickAmounts = [100, 500, 1000, 2000, 5000, 10000];

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    setDonationData({
      ...donationData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle quick amount selection
  const handleQuickAmount = (amount) => {
    setDonationData({ ...donationData, amount: amount.toString() });
    setQuickAmount(amount);
  };

  // Calculate progress percentage
  const calculateProgress = (raised, target) => {
    if (!raised || !target) return 0;
    return Math.min((raised / target) * 100, 100);
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return "₹0";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (isFormDisabled || !donationData.amount || donationData.amount <= 0) return;

    setLoading(true);

    const amount = Number(donationData.amount);
    const amountInPaise = Math.round(amount * 100);
    const campaignId = id || campaignID;

    fetch("/api/donations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: donationData.name,
        email: donationData.email,
        amount,
        campaignId,
      }),
    })
      .then(res => res.json())
      .then((result) => {
        // console.log("donation:",result)
        setLoading(false);

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: amountInPaise,
          currency: "INR",
          name: "Humanity Foundation",
          description: "Donation for a better tomorrow",
          order_id: result.donation.razorpayOrderId,

          handler: async function (response) {
            try {
              const verifyRes = await fetch("/api/verify-payments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderId: response.razorpay_order_id,     // ✅ FIX
                  paymentId: response.razorpay_payment_id, // ✅ FIX
                  signature: response.razorpay_signature,  // ✅ FIX
                }),
              });

              const verifyData = await verifyRes.json();

              if (verifyData.success) {
                router.push(
                  `/thank-you?name=${donationData.name}&orderId=${response.razorpay_order_id}&amount=${donationData.amount}`
                );
              } else {
                alert("Payment verification failed.");
              }
            } catch {
              alert("Payment verification error.");
            }
          },

          prefill: {
            name: donationData.name,
            email: donationData.email,
          },
          theme: { color: "#2563eb" },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      })
      .catch((err) => {
        setLoading(false);
        console.error("Donation error:", err);
        alert("Something went wrong: " + err.message);
      });
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Support a Cause
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your donation makes a real difference. Choose an amount and complete your secure payment.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Campaign Selection (Only when no ID) */}
          {!id && campaignData && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Heart className="w-8 h-8 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Select a Campaign</h2>
                </div>

                <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-4">
                  {campaignData?.length > 0 ? (
                    campaignData.map((item) => {
                      const progress = calculateProgress(item.raisedAmount, item.targetAmount);
                      const isItemSelected = campaignID === item._id;

                      return (
                        <div
                          key={item._id}
                          onClick={() => setCampaignID(item._id)}
                          className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all duration-300 hover:shadow-lg ${isItemSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                            }`}
                        >
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">
                                {item.title}
                              </h3>
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {item.description}
                              </p>

                              {/* Progress */}
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="font-medium text-gray-700">
                                    Raised: {formatCurrency(item.raisedAmount || 0)}
                                  </span>
                                  <span className="font-bold text-gray-900">
                                    {Math.round(progress)}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <div className="text-xs text-gray-500 flex justify-between">
                                  <span>Goal: {formatCurrency(item.targetAmount)}</span>
                                  <span>{item.donors || 0} donors</span>
                                </div>
                              </div>
                            </div>

                            {isItemSelected && (
                              <div className="flex items-center justify-center">
                                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                  <CheckCircle className="w-6 h-6 text-white" />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-10 text-gray-500">
                      No campaigns available at the moment.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Right Column - Donation Form & Campaign Info */}
          <div className={`${!id ? 'lg:col-span-1' : 'lg:col-span-2'}`}>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Donation Form */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center gap-3 mb-8">
                  <CreditCard className="w-8 h-8 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Donation Details</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={donationData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        placeholder="Enter your name"
                        required
                        disabled={isFormDisabled}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={donationData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        placeholder="you@example.com"
                        required
                        disabled={isFormDisabled}
                      />
                    </div>
                  </div>

                  {/* Amount Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Select Amount (₹)
                    </label>

                    {/* Quick Amounts */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {quickAmounts.map((amount) => (
                        <button
                          type="button"
                          key={amount}
                          onClick={() => handleQuickAmount(amount)}
                          className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${quickAmount === amount
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                            } ${isFormDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={isFormDisabled}
                        >
                          ₹{amount.toLocaleString()}
                        </button>
                      ))}
                    </div>

                    {/* Custom Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Or Enter Custom Amount
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <IndianRupee className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          name="amount"
                          value={donationData.amount}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          placeholder="Enter amount"
                          min="10"
                          required
                          disabled={isFormDisabled}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isFormDisabled || loading}
                    className={`w-full py-3 px-6 rounded-lg font-bold text-lg transition-all duration-300 ${isTargetReached
                      ? 'bg-green-500 text-white cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-lg'
                      } ${loading ? 'opacity-70 cursor-wait' : ''}`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </span>
                    ) : isTargetReached ? (
                      <span className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Target Completed
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <ArrowRight className="w-5 h-5" />
                        Proceed to Payment
                      </span>
                    )}
                  </button>

                  {/* Security Note */}
                  <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
                    <p className="flex items-center justify-center gap-2">
                      <span className="text-green-500">🔒</span>
                      Secure payment powered by Razorpay
                    </p>
                  </div>
                </form>
              </div>

              {/* Selected Campaign Info */}
              {selectedCampaign && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Target className="w-8 h-8 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Campaign Info</h2>
                  </div>

                  <div className="space-y-6">
                    {/* Campaign Image */}
                    <div className="rounded-xl overflow-hidden">
                      <img
                        src={selectedCampaign.media?.[0]?.url || "/placeholder.jpg"}
                        alt={selectedCampaign.title}
                        className="w-full h-48 object-cover"
                      />
                    </div>

                    {/* Campaign Details */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {selectedCampaign.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {selectedCampaign.description}
                      </p>
                    </div>

                    {/* Progress Stats */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium text-gray-700">Progress</span>
                          <span className="font-bold text-gray-900">
                            {Math.round(calculateProgress(selectedCampaign.raisedAmount, selectedCampaign.targetAmount))}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${isTargetReached ? 'bg-green-500' : 'bg-blue-500'
                              }`}
                            style={{
                              width: `${calculateProgress(selectedCampaign.raisedAmount, selectedCampaign.targetAmount)}%`
                            }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="text-sm text-gray-600 mb-1">Raised</div>
                          <div className="text-lg font-bold text-blue-700">
                            {formatCurrency(selectedCampaign.raisedAmount || 0)}
                          </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-sm text-gray-600 mb-1">Goal</div>
                          <div className="text-lg font-bold text-gray-900">
                            {formatCurrency(selectedCampaign.targetAmount)}
                          </div>
                        </div>
                      </div>

                      {/* Donor Count */}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{selectedCampaign.donors || 0} donors have contributed</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    {isTargetReached && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="font-bold text-green-700">
                            This campaign has reached its goal! 🎉
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center px-4">Loading...</div>}>
      <PageContent />
    </Suspense>
  );
}
