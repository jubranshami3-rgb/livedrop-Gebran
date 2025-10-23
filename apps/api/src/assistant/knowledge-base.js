const fs = require('fs');
const path = require('path');

class KnowledgeBase {
  constructor() {
    this.policies = this.loadPolicies();
    this.categoryKeywords = this.buildCategoryKeywords();
  }

  loadPolicies() {
    try {
      const policiesPath = path.join(__dirname, '../../../docs/ground-truth.json');
      const policiesText = fs.readFileSync(policiesPath, 'utf8');
      return JSON.parse(policiesText);
    } catch (error) {
      console.error('Error loading knowledge base:', error);
      return [];
    }
  }

  buildCategoryKeywords() {
    return {
      'returns': ['return', 'refund', 'exchange', 'send back', 'money back'],
      'shipping': ['ship', 'delivery', 'shipping', 'deliver', 'arrive', 'when will it come'],
      'warranty': ['warranty', 'guarantee', 'broken', 'defect', 'not working'],
      'payment': ['payment', 'pay', 'credit card', 'debit', 'paypal', 'apple pay'],
      'privacy': ['privacy', 'data', 'secure', 'security', 'information'],
      'pricing': ['price', 'cost', 'expensive', 'cheap', 'discount', 'sale'],
      'tracking': ['track', 'tracking', 'where is', 'location', 'status'],
      'issues': ['damaged', 'wrong', 'incorrect', 'missing', 'problem', 'issue'],
      'loyalty': ['loyalty', 'reward', 'points', 'member', 'program'],
      'support': ['support', 'contact', 'help', 'phone', 'email', 'hours']
    };
  }

  findRelevantPolicies(userQuery, category = null) {
    const query = userQuery.toLowerCase();
    
    // If category specified, filter by category
    let policiesToSearch = category 
      ? this.policies.filter(p => p.category === category)
      : this.policies;

    // Score policies based on keyword matching
    const scoredPolicies = policiesToSearch.map(policy => {
      let score = 0;
      
      // Check policy question
      if (policy.question.toLowerCase().includes(query)) {
        score += 10;
      }
      
      // Check policy answer
      if (policy.answer.toLowerCase().includes(query)) {
        score += 5;
      }
      
      // Check category keywords
      const categoryKeywords = this.categoryKeywords[policy.category] || [];
      categoryKeywords.forEach(keyword => {
        if (query.includes(keyword)) {
          score += 3;
        }
      });
      
      // Check individual words
      const queryWords = query.split(/\s+/);
      queryWords.forEach(word => {
        if (word.length > 3) { // Only meaningful words
          if (policy.question.toLowerCase().includes(word)) score += 2;
          if (policy.answer.toLowerCase().includes(word)) score += 1;
        }
      });
      
      return { policy, score };
    });
    
    // Filter out zero-score policies and sort by score
    const relevant = scoredPolicies
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3) // Return top 3
      .map(item => item.policy);
    
    return relevant;
  }

  getPolicyById(policyId) {
    return this.policies.find(p => p.id === policyId);
  }

  getAllCategories() {
    return [...new Set(this.policies.map(p => p.category))];
  }

  validateCitations(text) {
    const citationRegex = /\[(Policy\d+\.\d+)\]/g;
    const citations = [];
    let match;
    
    while ((match = citationRegex.exec(text)) !== null) {
      citations.push(match[1]);
    }
    
    const uniqueCitations = [...new Set(citations)];
    
    const validationResults = uniqueCitations.map(citationId => {
      const policy = this.getPolicyById(citationId);
      return {
        citation: citationId,
        isValid: !!policy,
        policy: policy || null
      };
    });
    
    const validCitations = validationResults.filter(r => r.isValid).map(r => r.citation);
    const invalidCitations = validationResults.filter(r => !r.isValid).map(r => r.citation);
    
    return {
      isValid: invalidCitations.length === 0,
      validCitations,
      invalidCitations,
      details: validationResults
    };
  }

  generateContextFromPolicies(policies, userQuery) {
    if (policies.length === 0) {
      return "No specific policies found for this question. Please contact support for more detailed assistance.";
    }
    
    let context = "Based on our store policies:\n\n";
    
    policies.forEach(policy => {
      context += `• ${policy.answer} [${policy.id}]\n\n`;
    });
    
    context += `Please use this information to answer the customer's question about: "${userQuery}"`;
    
    return context;
  }
}

module.exports = KnowledgeBase;