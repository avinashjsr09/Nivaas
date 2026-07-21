/**
 * Nivaas AI Service - Automated Complaint Summarization, Categorization, & Priority Detection
 */

function analyzeComplaintText(title, description) {
  const text = `${title} ${description}`.toLowerCase();

  let category = 'General';
  let priority = 'Medium';

  // Category Detection Rules
  if (text.match(/water|leak|pipe|plumb|tap|overflow|drain|tank|sewage/i)) {
    category = 'Plumbing';
  } else if (text.match(/electric|wire|power|spark|light|fuse|meter|short|voltage/i)) {
    category = 'Electrical';
  } else if (text.match(/elevator|lift|stuck|button|floor/i)) {
    category = 'Elevator / Lift';
  } else if (text.match(/noise|loud|party|dog|bark|music|dispute|shout/i)) {
    category = 'Disturbance & Noise';
  } else if (text.match(/clean|garbage|trash|sweeping|stink|smell|waste/i)) {
    category = 'Sanitation & Hygiene';
  } else if (text.match(/gate|security|guard|stranger|thief|parking|car|bike/i)) {
    category = 'Security & Parking';
  }

  // Priority Detection Rules
  if (text.match(/urgent|emergency|hazard|danger|fire|smoke|spark|stuck|breakdown|flooding|immediate/i)) {
    priority = 'Urgent';
  } else if (text.match(/minor|small|slow|request|paint|cosmetic/i)) {
    priority = 'Low';
  } else {
    priority = 'Medium';
  }

  // AI Summarization
  const cleanDesc = description.trim();
  const summary = cleanDesc.length > 80 ? cleanDesc.slice(0, 80) + '...' : cleanDesc;
  const aiSummary = `[AI Auto-Summary] Category: ${category} | Priority: ${priority} | Concise Note: ${summary}`;

  return {
    category,
    priority,
    aiSummary
  };
}

module.exports = {
  analyzeComplaintText
};
