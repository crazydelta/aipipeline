const Deal = require('../models/Deal');

exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user;
    const deals = await Deal.find({ owner: userId });

    const totalDeals = deals.length;
    const totalValue = deals.reduce((acc, deal) => acc + (deal.value || 0), 0);

    const stageDistribution = deals.reduce((acc, deal) => {
      acc[deal.stage] = (acc[deal.stage] || 0) + 1;
      return acc;
    }, {});

    const wonDeals = deals.filter(d => d.stage === 'Closed Won');
    const lostDeals = deals.filter(d => d.stage === 'Closed Lost');

    const winRate = totalDeals > 0 ? Number(((wonDeals.length / totalDeals) * 100).toFixed(2)) : 0;

    const avgDealSize = wonDeals.length > 0
      ? Number((wonDeals.reduce((acc, d) => acc + (d.value || 0), 0) / wonDeals.length).toFixed(2))
      : 0;

    // 📊 Monthly Trend (last 6 months, even if 0)
    const now = new Date();
    const monthlyTrendMap = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyTrendMap[key] = 0;
    }

    deals.forEach(deal => {
      const date = new Date(deal.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyTrendMap[key] !== undefined) {
        monthlyTrendMap[key] += (deal.value || 0);
      }
    });

    const formattedMonthlyTrend = Object.entries(monthlyTrendMap).map(([key, value]) => {
      const [year, monthNum] = key.split('-');
      const label = new Date(year, parseInt(monthNum) - 1).toLocaleString('default', {
        month: 'short',
        year: 'numeric',
      });
      return { month: label, value };
    });

    // 💡 AI Insights
    const openDeals = deals.filter(d => !['Closed Won', 'Closed Lost'].includes(d.stage));
    const lowActivityDeals = openDeals.filter(d => (d.activities?.length || 0) < 2);
    const earlyStageDeals = deals.filter(d => ['Lead', 'Prospect'].includes(d.stage));

    let insights = [];

    if (lowActivityDeals.length > 0) {
      insights.push(`🔁 ${lowActivityDeals.length} open deal(s) have low activity. Add more follow-ups to boost conversions.`);
    }

    if (lostDeals.length > 5) {
      insights.push('❌ You’ve lost more than 5 deals. Consider reviewing your pitch or negotiation strategy.');
    }

    if (winRate < 20 && totalDeals > 5) {
      insights.push(`📉 Your win rate is only ${winRate}%. Identify common patterns in lost deals to improve.`);
    }

    if (avgDealSize < 100 && wonDeals.length > 0) {
      insights.push(`💰 Your average deal size is quite low ($${avgDealSize}). Focus on higher-value opportunities.`);
    }

    if (earlyStageDeals.length > 3) {
      insights.push(`📌 You have ${earlyStageDeals.length} deal(s) stuck in early stages. Try progressing them or qualifying them better.`);
    }

    const wonByMonth = wonDeals.reduce((acc, deal) => {
      const month = new Date(deal.createdAt).toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    const topMonth = Object.entries(wonByMonth).sort((a, b) => b[1] - a[1])[0];
    if (topMonth) {
      insights.push(`🌟 ${topMonth[0]} has been your best closing month so far. Try to replicate what worked!`);
    }

    // 🕓 Recent Deals
    const recentDeals = await Deal.find({ owner: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title value stage createdAt');

    res.json({
      totalDeals,
      totalValue,
      stageDistribution,
      monthlyTrend: formattedMonthlyTrend,
      winRate,
      avgDealSize,
      insights,
      recentDeals,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
};
