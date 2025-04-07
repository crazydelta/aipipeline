// server/controllers/analyticsController.js

exports.getDashboardStats = async (req, res) => {
    try {
      // Example static data – replace with real queries
      const stats = {
        totalDeals: 42,
        closedDeals: 18,
        openDeals: 24,
        revenue: 125000,
        aiInsights: "Use more follow-ups for better conversion rates."
      };
  
      res.json(stats);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch dashboard stats' });
    }
  };
  