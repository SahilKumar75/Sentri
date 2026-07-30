'use strict';

const path = require('path');

// Mock ML classifier - in a real implementation, this would use a trained model
const mockClassify = (text) => {
  const lowerText = text.toLowerCase();
  
  // Simple keyword-based mock classification
  if (lowerText.includes('note') || lowerText.includes('reminder')) {
    return { category: 'note', confidence: 0.85 };
  }
  
  if (lowerText.includes('schedule') || lowerText.includes('timetable') || lowerText.includes('class')) {
    return { category: 'timetable', confidence: 0.80 };
  }
  
  if (lowerText.includes('study') || lowerText.includes('material') || lowerText.includes('lecture')) {
    return { category: 'study_material', confidence: 0.75 };
  }
  
  if (lowerText.includes('http') || lowerText.includes('www.')) {
    return { category: 'link', confidence: 0.90 };
  }
  
  if (lowerText.includes('.pdf') || lowerText.includes('.doc') || lowerText.includes('file')) {
    return { category: 'file', confidence: 0.70 };
  }
  
  // Default fallback
  return { category: 'note', confidence: 0.50 };
};

// Rule-based fallback classifier
const ruleBasedClassify = (text) => {
  const lowerText = text.toLowerCase();
  
  // Timetable rules
  const timePattern = /\b(\d{1,2}:\d{2}|am|pm)\b/i;
  const dayPattern = /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i;
  
  if (timePattern.test(lowerText) && dayPattern.test(lowerText)) {
    return { category: 'timetable', confidence: 0.95 };
  }
  
  // Study material rules
  const studyKeywords = ['syllabus', 'assignment', 'homework', 'exam', 'quiz', 'test'];
  if (studyKeywords.some(keyword => lowerText.includes(keyword))) {
    return { category: 'study_material', confidence: 0.90 };
  }
  
  // Link rules
  const urlPattern = /(https?:\/\/|www\.)[\w\-]+(\.[\w\-]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/i;
  if (urlPattern.test(lowerText)) {
    return { category: 'link', confidence: 0.95 };
  }
  
  // File rules
  const fileExtensions = ['.pdf', '.doc', '.docx', '.txt', '.xls', '.xlsx', '.ppt', '.pptx'];
  if (fileExtensions.some(ext => lowerText.includes(ext))) {
    return { category: 'file', confidence: 0.90 };
  }
  
  // Screenshot rules (based on common screenshot naming)
  const screenshotPatterns = ['screenshot', 'screen shot', 'capture', 'image'];
  if (screenshotPatterns.some(pattern => lowerText.includes(pattern))) {
    return { category: 'screenshot', confidence: 0.85 };
  }
  
  // Default to note
  return { category: 'note', confidence: 0.60 };
};

// Normalize category names to match expected output
const normalizeCategory = (category) => {
  const categoryMap = {
    'study_material': 'study material'
  };
  
  return categoryMap[category] || category;
};

// Main classification function
const classifyCapture = (captureText) => {
  try {
    // First try ML classification
    let result = mockClassify(captureText);
    
    // If confidence is too low, fall back to rule-based classification
    if (result.confidence < 0.7) {
      result = ruleBasedClassify(captureText);
    }
    
    // Normalize the category name
    result.category = normalizeCategory(result.category);
    
    return result;
  } catch (error) {
    // If anything fails, fall back to rule-based classification
    const fallbackResult = ruleBasedClassify(captureText);
    fallbackResult.category = normalizeCategory(fallbackResult.category);
    return fallbackResult;
  }
};

module.exports = {
  classifyCapture,
  mockClassify,
  ruleBasedClassify
};