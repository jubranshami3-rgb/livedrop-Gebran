class CitationValidator {
  constructor(knowledgeBase) {
    this.knowledgeBase = knowledgeBase;
  }

  extractCitations(text) {
    const citationRegex = /\[(Policy\d+\.\d+)\]/g;
    const citations = new Set();
    let match;
    
    while ((match = citationRegex.exec(text)) !== null) {
      citations.add(match[1]);
    }
    
    return Array.from(citations);
  }

  validateResponse(responseText) {
    const citations = this.extractCitations(responseText);
    
    const validationResults = citations.map(citationId => {
      const policy = this.knowledgeBase.getPolicyById(citationId);
      return {
        citation: citationId,
        isValid: !!policy,
        policy: policy || null,
        reason: policy ? 'Valid policy reference' : 'Policy ID not found in knowledge base'
      };
    });

    const validCitations = validationResults.filter(r => r.isValid).map(r => r.citation);
    const invalidCitations = validationResults.filter(r => !r.isValid).map(r => r.citation);

    return {
      isValid: invalidCitations.length === 0,
      validCitations,
      invalidCitations,
      totalCitations: citations.length,
      details: validationResults
    };
  }

  generateValidationReport(validationResult) {
    if (validationResult.isValid) {
      return {
        status: 'VALID',
        message: `All ${validationResult.totalCitations} citations are valid`,
        citations: validationResult.validCitations
      };
    } else {
      return {
        status: 'INVALID',
        message: `Found ${validationResult.invalidCitations.length} invalid citation(s)`,
        validCitations: validationResult.validCitations,
        invalidCitations: validationResult.invalidCitations,
        warning: 'Assistant may be hallucinating policy references'
      };
    }
  }
}

module.exports = CitationValidator;