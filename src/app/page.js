"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, Target, Users, TrendingUp, ArrowRight, CheckCircle, Clock } from "lucide-react";
import Skeleton from "@/components/Skeleton";
import Home_Hero_section from "@/components/Home_Hero_section";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [filter, setFilter] = useState("all");

  const [stats, setStats] = useState({
    totalDonations: 0,
    successfulCampaigns: 0,
    avgDonation: 0,
    totalDonors: 0,
    monthlyGrowth: 0,
  });


  useEffect(() => {
    fetch('/api/donations', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        const total = data.donations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;
        const donors = new Set(data.donations?.map(d => d.email)).size || 0;

        setStats(prev => ({
          ...prev,
          totalDonations: total,
          totalDonors: donors,
          avgDonation: donors > 0 ? total / donors : 0,
        }));
      })
      .catch(err => console.log(err));
  }, []);

  useEffect(() => {
    fetch('/api/campaign/getcampaign')
      .then(res => res.json())
      .then(data => {
        setCampaigns(data?.campaigns || []);
        const successful = data?.campaigns?.filter(c => c.raisedAmount >= c.targetAmount).length || 0;
        setStats(prev => ({ ...prev, successfulCampaigns: successful }));
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  const filteredCampaigns = campaigns.filter(campaign => {
    if (filter === "active") return campaign.raisedAmount < campaign.targetAmount;
    if (filter === "Completed") return campaign.raisedAmount >= campaign.targetAmount;
    return true;
  });

  const totalRaised = campaigns.reduce((sum, c) => sum + (c.raisedAmount || 0), 0);
  const successful = campaigns.filter(c => c.raisedAmount >= c.targetAmount).length;

  const formatAmount = (num) => {
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
    return `₹${num}`;
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num;
  };

  ///share campaign///



  if (loading) {
    return <Skeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16"> {/* Added pt-16 for fixed navbar */}
      {/* Hero Banner - Mobile Optimized */}
      {/* Hero Banner */}
      <div className="relative w-full h-[500px]">
        <Home_Hero_section />
      </div>


      {/* Stats Section - Mobile Optimized Grid */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 mt-6 sm:-mt-8 md:mt-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-md sm:shadow-lg border border-gray-100 text-center">
            <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">
              {formatAmount(totalRaised)}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 flex items-center justify-center gap-1 sm:gap-2">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              Total Raised
            </div>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-md sm:shadow-lg border border-gray-100 text-center">
            <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-green-600 mb-1 sm:mb-2">
              {successful}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 flex items-center justify-center gap-1 sm:gap-2">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
              Successful
            </div>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-md sm:shadow-lg border border-gray-100 text-center">
            <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-purple-600 mb-1 sm:mb-2">
              {formatNumber(stats.totalDonors)}+
            </div>
            <div className="text-xs sm:text-sm text-gray-600 flex items-center justify-center gap-1 sm:gap-2">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              Total Donors
            </div>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-md sm:shadow-lg border border-gray-100 text-center">
            <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-orange-600 mb-1 sm:mb-2">
              {campaigns.length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 flex items-center justify-center gap-1 sm:gap-2">
              <Target className="w-3 h-3 sm:w-4 sm:h-4" />
              Live Campaigns
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns Section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-12" id="campaigns">
        <div className="text-center mb-6 sm:mb-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
            Featured Campaigns
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto px-2">
            Support causes that need your help the most
          </p>
        </div>

        {/* Filter Buttons - Mobile Optimized */}
        <div className="flex justify-center gap-2 sm:gap-3 mb-6 sm:mb-8 overflow-x-auto pb-2 sm:pb-0">
          {["all", "active", "Completed"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 sm:px-6 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${filter === tab
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Campaigns Grid - Mobile Responsive */}
        {filteredCampaigns.length === 0 ? (
          <div className="text-center py-12 sm:py-20 bg-white rounded-xl sm:rounded-2xl shadow-sm mx-2 sm:mx-0">
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">❤️</div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-700 mb-2">
              No campaigns found
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto px-4">
              {filter === "Completed"
                ? "All campaigns are working towards their goals"
                : "Check back soon for new campaigns"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredCampaigns.map((campaign) => {
              const progress = Math.min((campaign.raisedAmount / campaign.targetAmount) * 100, 100);
              const isCompleted = progress >= 100;
              return (
                <div key={campaign._id} className="bg-white rounded-lg sm:rounded-xl shadow-sm sm:shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                  {/* Campaign Image */}
                  <div className="relative h-48 sm:h-56 overflow-hidden">
                    <img
                      src={campaign.media?.[0]?.url || "/placeholder.png"}
                      alt={campaign.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                      {isCompleted ? (
                        <div className="bg-green-500 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-bold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">Completed</span>
                          <span className="sm:hidden">Done</span>
                        </div>
                      ) : (
                        <div>

                        </div>

                      )}
                    </div>
                  </div>

                  {/* Campaign Content */}
                  <div className="p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                      {campaign.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">
                      {campaign.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-4 sm:mb-6">
                      <div className="flex justify-between text-xs sm:text-sm mb-1 sm:mb-2">
                        <span className="font-bold text-gray-800">
                          {formatAmount(campaign.raisedAmount || 0)}
                        </span>
                        <span className="text-gray-500">
                          Goal: {formatAmount(campaign.targetAmount)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                        <div
                          className={`h-1.5 sm:h-2 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{Math.round(progress)}% funded</span>
                        <span>{campaign.donors || 0} donors</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      {isCompleted ? (
                        <div className="bg-green-50 text-green-700 py-2 sm:py-3 rounded-lg text-center text-sm sm:text-base font-bold border border-green-200 px-2">
                          Goal Achieved 🎉
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => router.push(`/donate?id=${campaign._id}`)}
                            className="flex-1 bg-blue-600 text-white py-2 sm:py-3 rounded-lg text-sm sm:text-base font-bold hover:bg-blue-700 transition-colors active:scale-95"
                          >
                            Donate Now
                          </button>
                          <button
                            onClick={() => router.push(`/campaign-details?id=${campaign._id}`)}
                            className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm sm:text-base font-medium active:scale-95"
                          >
                            Details
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CTA Section - Mobile Optimized */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12 sm:py-16 mt-8 sm:mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
            Ready to Make an Impact?
          </h2>
          <p className="text-sm sm:text-base md:text-xl text-blue-100 mb-6 sm:mb-10 max-w-2xl mx-auto px-2">
            Your contribution can change lives. Join our community of changemakers today.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button
              onClick={() => router.push("/campaigns")}
              className="px-6 py-2.5 sm:px-10 sm:py-3 bg-white text-blue-600 font-bold rounded-full hover:bg-gray-100 transition-all active:scale-95 sm:hover:scale-105 shadow-lg text-sm sm:text-base"
            >
              Explore All Campaigns
            </button>
            <button
              onClick={() => router.push("/contact")}
              className="px-6 py-2.5 sm:px-10 sm:py-3 bg-transparent border border-white sm:border-2 rounded-full hover:bg-white/10 transition-all active:scale-95 text-sm sm:text-base"
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}