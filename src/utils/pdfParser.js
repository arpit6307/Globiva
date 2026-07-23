import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker to use cdnjs/unpkg js worker script
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs`;
}

/**
 * Extracts text content page-by-page from an uploaded PDF file.
 * @param {File} pdfFile 
 * @returns {Promise<string>} Full extracted plain text
 */
export const extractTextFromPdf = async (pdfFile) => {
  if (!pdfFile) {
    throw new Error("No PDF file selected. Please select a valid PDF.");
  }

  try {
    const arrayBuffer = await pdfFile.arrayBuffer();
    let fullText = '';

    // Primary Attempt: pdfjs-dist page parsing
    try {
      const loadingTask = pdfjsLib.getDocument({ 
        data: arrayBuffer,
        useSystemFonts: true,
        isEvalSupported: false
      });
      const pdf = await loadingTask.promise;
      
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageStrings = textContent.items.map(item => item.str);
        fullText += pageStrings.join(' ') + '\n';
      }
    } catch (pdfJsErr) {
      console.warn("pdfjs-dist worker warning, attempting binary stream extraction fallback:", pdfJsErr);
      
      // Fallback Attempt: Binary TextDecoder parsing for embedded text streams
      const decoder = new TextDecoder('utf-8');
      const rawString = decoder.decode(arrayBuffer);
      
      // Extract text content inside PDF text objects (Tj / TJ operators) or text blocks
      const textMatches = rawString.match(/\(([^\(\)]+)\)\s*Tj/g) || rawString.match(/\[([^\[\]]+)\]\s*TJ/g);
      if (textMatches && textMatches.length > 0) {
        fullText = textMatches
          .map(m => m.replace(/[()\[\]]/g, '').replace(/Tj|TJ/g, '').trim())
          .filter(t => t.length > 2)
          .join(' ');
      } else {
        // Fallback 2: Extract clean printable words
        const printableWords = rawString.replace(/[^a-zA-Z0-9\s.,;:\-\_\?\!\(\)]/g, ' ').split(/\s+/).filter(w => w.length >= 3);
        if (printableWords.length > 30) {
          fullText = printableWords.join(' ');
        }
      }
    }

    const trimmedText = fullText.trim();
    if (!trimmedText || trimmedText.length < 15) {
      throw new Error("This PDF has no readable text. Please upload a text-based PDF.");
    }
    return trimmedText;
  } catch (error) {
    console.error("Error reading PDF text:", error);
    throw new Error(error.message || "Could not parse text from PDF file. Please ensure it is a valid text-based PDF.");
  }
};

/**
 * Dynamic Character Pairs Pool
 */
const CHARACTER_PAIRS = [
  {
    host: { name: "Lead Sarah", defaultRole: "Subject Matter Expert", avatar: "👩‍💼", gender: "female" },
    guest: { name: "Analyst Alex", defaultRole: "Domain Associate", avatar: "👨‍💼", gender: "male" }
  },
  {
    host: { name: "Captain Vikram", defaultRole: "Principal Specialist", avatar: "👨‍✈️", gender: "male" },
    guest: { name: "Auditor Priya", defaultRole: "Quality Analyst", avatar: "👩‍💼", gender: "female" }
  },
  {
    host: { name: "Coach David", defaultRole: "Senior Mentor", avatar: "🧑‍🏫", gender: "male" },
    guest: { name: "Associate Maya", defaultRole: "Process Learner", avatar: "👩‍🎓", gender: "female" }
  },
  {
    host: { name: "Director Marcus", defaultRole: "Executive Director", avatar: "👨‍💼", gender: "male" },
    guest: { name: "Research Sophia", defaultRole: "Senior Analyst", avatar: "👩‍💻", gender: "female" }
  },
  {
    host: { name: "Commander Rohan", defaultRole: "Master Educator", avatar: "👨‍🚀", gender: "male" },
    guest: { name: "Cadet Ananya", defaultRole: "Domain Specialist", avatar: "👩‍🚀", gender: "female" }
  }
];

/**
 * Background AI Analyzer & PDF Course Generator
 * Converts 100% PDF extracted text into:
 * - 10 Contextual Animated Video Scenes with Dynamic Visual Templates (HeadingIntro, BulletList, ComparisonTable, Timeline, QuoteHighlight, DiagramPlaceholder)
 * - Synced Audio Narration Engine Data
 * - 2 Fun Interactive Mini-Games based on PDF content
 * - 20 Distinct, Non-Repeating MCQs derived strictly from unique PDF sentences
 * 
 * @param {string} rawText 
 * @param {string} fileName 
 * @returns {Object} Complete Course Object ready for Firestore
 */
export const generateCourseFromPdf = (rawText, fileName = 'Uploaded_Document.pdf') => {
  // Clean up text
  const text = rawText.replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ');
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // Pick dynamic character pair based on string hash of fileName
  let hash = 0;
  for (let i = 0; i < fileName.length; i++) {
    hash = fileName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const charPair = CHARACTER_PAIRS[Math.abs(hash) % CHARACTER_PAIRS.length];
  const { host, guest } = charPair;

  // Derive domain/topic dynamically from PDF text content to assign relevant character roles
  const lowerText = text.toLowerCase();
  let domainRoleHost = host.defaultRole;
  let domainRoleGuest = guest.defaultRole;

  if (lowerText.includes('security') || lowerText.includes('cyber') || lowerText.includes('threat') || lowerText.includes('attack') || lowerText.includes('vulnerability')) {
    domainRoleHost = "Chief Cyber Security Officer";
    domainRoleGuest = "Security Operations Analyst";
  } else if (lowerText.includes('bank') || lowerText.includes('credit') || lowerText.includes('financial') || lowerText.includes('account') || lowerText.includes('transaction')) {
    domainRoleHost = "Financial Operations Director";
    domainRoleGuest = "Banking Operations Associate";
  } else if (lowerText.includes('patient') || lowerText.includes('medical') || lowerText.includes('clinical') || lowerText.includes('health') || lowerText.includes('pharma')) {
    domainRoleHost = "Clinical Operations Lead";
    domainRoleGuest = "Health & Safety Associate";
  } else if (lowerText.includes('software') || lowerText.includes('code') || lowerText.includes('api') || lowerText.includes('system') || lowerText.includes('data')) {
    domainRoleHost = "Principal Software Architect";
    domainRoleGuest = "Systems Engineer";
  } else if (lowerText.includes('policy') || lowerText.includes('hr') || lowerText.includes('employee') || lowerText.includes('governance')) {
    domainRoleHost = "Head of Organizational Governance";
    domainRoleGuest = "People Operations Lead";
  }

  // Derive title from filename or first line
  let title = fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
  if (lines.length > 0 && lines[0].length < 80) {
    title = lines[0].toUpperCase();
  }
  
  const processName = title.length > 30 ? title.substring(0, 30) : title;

  // Extract sentences and clean paragraphs from PDF
  const rawSentences = text.match(/[^.!?]+[.!?]+/g) || lines;
  const cleanedSentences = rawSentences
    .map(s => s.trim().replace(/\s+/g, ' '))
    .filter(s => s.length > 15 && s.length < 350);

  const sentencesPool = cleanedSentences.length >= 10 ? cleanedSentences : lines.filter(l => l.length > 15);

  // Extract key terms directly from PDF text
  const keyTermMatches = [];
  lines.forEach(line => {
    if (line.includes(':') || line.includes('-') || line.includes('–')) {
      const parts = line.split(/[:\-\–]/);
      if (parts.length >= 2) {
        const term = parts[0].trim();
        const def = parts.slice(1).join(' ').trim();
        if (term.length >= 2 && term.length <= 50 && def.length >= 10) {
          keyTermMatches.push({ term, definition: def });
        }
      }
    }
  });

  // Dynamically generate key terms from PDF sentences if colon matches are under 20
  const finalKeyTerms = [...keyTermMatches];
  let termCounter = 1;
  sentencesPool.forEach((sent) => {
    if (finalKeyTerms.length < 25) {
      const words = sent.split(' ');
      let termHead = words.slice(0, Math.min(4, words.length)).join(' ').replace(/[^a-zA-Z0-9 ]/g, "").trim();
      if (!termHead || termHead.length < 3) {
        termHead = `Document Principle ${termCounter++}`;
      } else {
        termHead = termHead.toUpperCase();
      }
      if (!finalKeyTerms.some(t => t.term.toLowerCase() === termHead.toLowerCase())) {
        finalKeyTerms.push({
          term: termHead,
          definition: sent
        });
      }
    }
  });

  // Ensure at least 10 final key terms strictly from PDF content
  while (finalKeyTerms.length < 10) {
    const idx = finalKeyTerms.length;
    const s = sentencesPool[idx % sentencesPool.length] || `Core clause ${idx + 1} from ${title}.`;
    finalKeyTerms.push({
      term: `Section Rule ${idx + 1}`,
      definition: s
    });
  }

  // ----------------------------------------------------------------------------------------------
  // GENERATE 10 ANIMATED SLIDE SCENES WITH VISUAL TYPES (HeadingIntro, BulletList, Timeline, etc.)
  // ----------------------------------------------------------------------------------------------
  const videoScenes = [];
  const totalScenesToMake = 10;
  const sentencesPerScene = Math.max(1, Math.floor(sentencesPool.length / totalScenesToMake));

  const visualTypesList = [
    "heading-intro",
    "bullet-list",
    "quote-highlight",
    "timeline",
    "comparison-table",
    "diagram-placeholder",
    "bullet-list",
    "quote-highlight",
    "timeline",
    "heading-intro"
  ];

  for (let scIdx = 0; scIdx < totalScenesToMake; scIdx++) {
    const sceneNum = scIdx + 1;
    const startIdx = scIdx * sentencesPerScene;
    const sceneSentences = sentencesPool.slice(startIdx, startIdx + sentencesPerScene);
    const mainSentence = sceneSentences[0] || sentencesPool[scIdx % sentencesPool.length] || `Understanding key concepts defined in ${title}.`;
    const secondarySentence = sceneSentences[1] || sentencesPool[(scIdx + 1) % sentencesPool.length] || `Adhering to the official document instructions.`;
    const termObj = finalKeyTerms[scIdx % finalKeyTerms.length];
    const visualType = visualTypesList[scIdx % visualTypesList.length];

    let sceneTitle = `Scene ${sceneNum}: ${termObj.term}`;
    if (sceneNum === 1) sceneTitle = `Scene 1: Introduction & Motive of ${title}`;
    if (sceneNum === 10) sceneTitle = `Scene 10: Document Summary & Assessment Readiness`;

    let visualData = {};
    if (visualType === "heading-intro") {
      visualData = {
        heading: sceneNum === 1 ? title : `Chapter Summary: ${termObj.term}`,
        subheading: mainSentence,
        highlights: [title, `Section ${sceneNum}`, domainRoleHost]
      };
    } else if (visualType === "bullet-list") {
      visualData = {
        heading: `Key Directives: ${termObj.term}`,
        points: [mainSentence, secondarySentence, `Mandatory Compliance Clause: ${termObj.definition.substring(0, 120)}`]
      };
    } else if (visualType === "comparison-table") {
      visualData = {
        headers: ["Document Concept", "Primary Directive", "Compliance Scope"],
        rows: [[termObj.term, mainSentence, secondarySentence]]
      };
    } else if (visualType === "timeline") {
      visualData = {
        heading: `Operational Sequence for ${termObj.term}`,
        steps: [
          { title: "Verification Phase", description: mainSentence },
          { title: "Execution Protocol", description: secondarySentence }
        ]
      };
    } else if (visualType === "quote-highlight") {
      visualData = {
        quote: mainSentence,
        author: title,
        highlightKey: termObj.term
      };
    } else if (visualType === "diagram-placeholder") {
      visualData = {
        title: `Architecture Flow: ${termObj.term}`,
        nodes: ["PDF Document", termObj.term, "Execution Phase", "Audit Clearance"]
      };
    }

    videoScenes.push({
      sceneId: `scene-${sceneNum}`,
      title: sceneTitle,
      subtitle: `PDF Document Breakdown Part ${sceneNum} of 10`,
      visualTheme: sceneNum === 1 ? "intro" : (sceneNum === 10 ? "summary" : "deep_dive"),
      visualType,
      visualData,
      narration: `Scene ${sceneNum}. ${termObj.term}. The document explicitly outlines: ${mainSentence}. Furthermore: ${secondarySentence}`,
      keyHighlights: [termObj.term, `${title}`, `Section ${sceneNum}`],
      dialogues: [
        {
          speaker: host.name,
          role: domainRoleHost,
          avatar: host.avatar,
          voiceGender: host.gender,
          text: sceneNum === 1 
            ? `Welcome ${guest.name.split(' ')[1] || guest.name}! Today we are reviewing the uploaded document "${title}". Let's discuss its core motive and objectives.`
            : `${guest.name.split(' ')[1] || guest.name}, let's examine the next critical section from the text regarding "${termObj.term}".`
        },
        {
          speaker: guest.name,
          role: domainRoleGuest,
          avatar: guest.avatar,
          voiceGender: guest.gender,
          text: sceneNum === 1
            ? `Hello ${host.name.split(' ')[1] || host.name}! I'm ready. What does the document specify as its primary statement?`
            : `What specifically does the document state regarding "${termObj.term}"?`
        },
        {
          speaker: host.name,
          role: domainRoleHost,
          avatar: host.avatar,
          voiceGender: host.gender,
          text: `The text explicitly outlines: "${mainSentence}"`
        },
        {
          speaker: guest.name,
          role: domainRoleGuest,
          avatar: guest.avatar,
          voiceGender: guest.gender,
          text: `Got it! And how does the document further detail this for our understanding?`
        },
        {
          speaker: host.name,
          role: domainRoleHost,
          avatar: host.avatar,
          voiceGender: host.gender,
          text: `The document adds: "${secondarySentence}". Remember this key rule for your final test!`
        }
      ]
    });
  }

  const videoModule = {
    title: `${title} - PDF Animated Explainer Video (10 Scenes)`,
    description: `Complete PDF script converted to 10 character animated scenes featuring ${host.name} (${domainRoleHost}) and ${guest.name} (${domainRoleGuest}).`,
    totalDurationSeconds: 240,
    scenes: videoScenes
  };

  // 2 FUN INTERACTIVE MINI-GAMES DERIVED FROM PDF CONTENT
  const sections = [
    {
      id: `sec-${Date.now()}-1`,
      title: "Game 1: Interactive Term & Definition Flashcard Challenge",
      gameType: "flashcards",
      content: sentencesPool.slice(0, 4).join(' ') || `Master key terms and definitions extracted directly from ${title}.`,
      keyTerms: finalKeyTerms.slice(0, Math.ceil(finalKeyTerms.length / 2))
    },
    {
      id: `sec-${Date.now()}-2`,
      title: "Game 2: Speed Match Protocol Duel",
      gameType: "match",
      content: sentencesPool.slice(4, 8).join(' ') || `Match core document concepts with their exact definitions from ${title}.`,
      keyTerms: finalKeyTerms.slice(Math.ceil(finalKeyTerms.length / 2))
    }
  ];

  // ----------------------------------------------------------------------------------------------
  // AUTO-GENERATE EXACTLY 20 DISTINCT & UNIQUE MCQS DIRECTLY FROM PDF SENTENCES
  // ----------------------------------------------------------------------------------------------
  const mcqs = [];
  const totalMcqCount = 20;

  // Build a rich pool of unique factual statements from sentencesPool & lines
  const uniqueStatements = Array.from(new Set([
    ...sentencesPool,
    ...lines.filter(l => l.length > 25 && l.length < 300)
  ]));

  // Ensure we have at least 20 unique statements
  while (uniqueStatements.length < 20) {
    const idx = uniqueStatements.length;
    uniqueStatements.push(`Section Directive ${idx + 1}: Adhere strictly to all specified operational procedures in ${title}.`);
  }

  const questionTemplates = [
    (term) => `According to the document, what is specified regarding "${term}"?`,
    (term) => `Which option accurately describes the official directive for "${term}"?`,
    (term) => `Based on the uploaded text, what is the mandatory requirement for "${term}"?`,
    (term) => `Regarding "${term}", which statement is explicitly validated by the PDF text?`,
    (term) => `In the context of ${title}, how is "${term}" defined?`
  ];

  for (let i = 0; i < totalMcqCount; i++) {
    const targetStatement = uniqueStatements[i % uniqueStatements.length];
    
    // Extract key topic/term from the target statement
    const words = targetStatement.split(' ').filter(w => w.length > 3);
    let term = words.slice(0, Math.min(3, words.length)).join(' ').replace(/[^a-zA-Z0-9 ]/g, "").toUpperCase();
    if (!term || term.length < 3) {
      term = `Section Clause ${i + 1}`;
    }

    const correctOption = targetStatement;

    // Pick 3 distinct distractors from other statements in uniqueStatements
    const availableDistractors = uniqueStatements.filter((_, idx) => idx !== (i % uniqueStatements.length));
    
    // Shuffle distractors with a distinct index offset so every question gets unique distractors
    const offset = (i * 3) % Math.max(1, availableDistractors.length);
    const pickedDistractors = [];
    for (let d = 0; d < 3; d++) {
      const distIndex = (offset + d) % availableDistractors.length;
      pickedDistractors.push(availableDistractors[distIndex]);
    }

    // Ensure all 4 options are unique
    const rawOptions = [correctOption, ...pickedDistractors];
    const uniqueOptions = Array.from(new Set(rawOptions));

    // Fallback if duplicates existed
    while (uniqueOptions.length < 4) {
      uniqueOptions.push(`Alternative procedure ${uniqueOptions.length + 1} not specified in ${title}.`);
    }

    const shuffledOptions = uniqueOptions.slice(0, 4).sort(() => 0.5 - Math.random());
    const correctIndex = shuffledOptions.indexOf(correctOption);

    const qTemplate = questionTemplates[i % questionTemplates.length];
    const questionText = `Q${i + 1}: ${qTemplate(term)}`;

    mcqs.push({
      id: `q-${Date.now()}-${i + 1}`,
      question: questionText,
      options: shuffledOptions,
      correctIndex: correctIndex >= 0 ? correctIndex : 0,
      explanation: `According to the ${title} document: "${targetStatement}"`
    });
  }

  const courseDescription = sentencesPool.length > 0 
    ? sentencesPool.slice(0, 2).join(' ') 
    : `Auto-generated training course created directly from uploaded PDF document (${fileName}).`;

  return {
    title,
    processName,
    description: courseDescription,
    passPercentage: 75,
    maxAttempts: 2,
    mcqTimeLimitMinutes: 15,
    isActive: true,
    createdBy: "trainer_pdf_upload",
    sourcePdfName: fileName,
    createdAt: new Date().toISOString(),
    sections,
    mcqs,
    videoModule
  };
};
