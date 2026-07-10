import { interpretQuery } from '../services/aiQueryService.js';

// @route POST /api/ai-query  (protected, mla/admin only)
export const askAIAssistant = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ message: 'query is required' });
    }
    const result = await interpretQuery(query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};