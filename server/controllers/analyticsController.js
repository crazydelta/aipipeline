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

    const winRate = totalDeals > 0 ? ((wonDeals.length / totalDeals) * 100).toFixed(2) : 0;
    const avgDealSize = wonDeals.length > 0
      ? (wonDeals.reduce((acc, d) => acc + d.value, 0) / wonDeals.length).toFixed(2)
      : 0;

    const monthlyTrend = deals.reduce((acc, deal) => {
      const date = new Date(deal.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      acc[key] = (acc[key] || 0) + deal.value;
      return acc;
    }, {});

    const formattedMonthlyTrend = Object.entries(monthlyTrend).map(([month, value]) => ({
      month,
      value
    }));

    // AI Insights
    const openDeals = deals.filter(d => !['Closed Won', 'Closed Lost'].includes(d.stage));
    const lowActivityDeals = openDeals.filter(d => (d.activities?.length || 0) < 2);

    let insights = [];

    if (lowActivityDeals.length > 0) {
      insights.push(`Consider adding more follow-ups to ${lowActivityDeals.length} open deal(s) for better conversion.`);
    }

    if (lostDeals.length > 5) {
      insights.push('Several deals were lost at the final stages. Review your negotiation process.');
    }

    const wonByMonth = wonDeals.reduce((acc, deal) => {
      const month = new Date(deal.createdAt).toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    const topMonth = Object.entries(wonByMonth).sort((a, b) => b[1] - a[1])[0];
    if (topMonth) {
      insights.push(`Your best closing month appears to be ${topMonth[0]}.`);
    }

    res.json({
      totalDeals,
      totalValue,
      stageDistribution,
      monthlyTrend: formattedMonthlyTrend,
      winRate,
      avgDealSize,
      insights
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
};
