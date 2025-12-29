chrome.action.setBadgeText({ text: "" });


chrome.storage.local.get(["trackingEnabled"], (res) => {
  if (res.trackingEnabled === undefined) {
    chrome.storage.local.set({ trackingEnabled: true });
  }
});

const trackingToggle = document.getElementById("trackingToggle");

safeStorageGet({ trackingEnabled: true }, (res) => {
  if (trackingToggle) {
    trackingToggle.checked = res.trackingEnabled;
  }
});


function safeStorageGet(defaults, callback) {
  try {
    chrome.storage.local.get(defaults, callback);
  } catch (e) {
    console.warn("[LLM Analyzer] Extension context invalidated");
  }
}


trackingToggle?.addEventListener("change", () => {
  chrome.storage.local.set({ trackingEnabled: trackingToggle.checked });
});

// MAIN LOGIC

chrome.storage.local.get(
  { prompts: [], trackingEnabled: true },
  (result) => {
    const prompts = result.prompts;
    const trackingEnabled = result.trackingEnabled;

    if (!prompts || prompts.length === 0) return;


    
    let totalLen = 0;
    let chatgpt = 0;
    let gemini = 0;
    let learning = 0;
    let execution = 0;
    let simple = 0;
    let medium = 0;
    let complex = 0;
    let refinements = 0;
    let repetitions = 0;

    const learningK = ["why", "how", "explain", "understand"];
    const executionK = ["code", "solve", "write", "answer"];
    const seen = {};

    prompts.forEach((p, i) => {
      const text = p.prompt.toLowerCase();
      totalLen += p.prompt.length;

      if (p.platform === "ChatGPT") chatgpt++;
      if (p.platform === "Gemini") gemini++;

      if (learningK.some(k => text.includes(k))) learning++;
      if (executionK.some(k => text.includes(k))) execution++;

      if (p.prompt.length < 30) simple++;
      else if (p.prompt.length < 80) medium++;
      else complex++;

      if (seen[text]) repetitions++;
      seen[text] = true;

      if (
        i > 0 &&
        text.includes(prompts[i - 1].prompt.toLowerCase().split(" ")[0])
      ) {
        refinements++;
      }
    });

    const total = prompts.length;
    const avgLen = Math.round(totalLen / total);
    const refinePct = Math.round((refinements / total) * 100);
    const quality = Math.max(
      0,
      Math.min(100, Math.round(avgLen + learning * 5 - execution * 2))
    );

    // UPDATE UI 
    document.getElementById("total").innerText = total;
    document.getElementById("avgLength").innerText = avgLen;
    document.getElementById("chatgpt").innerText = chatgpt;
    document.getElementById("gemini").innerText = gemini;
    document.getElementById("quality").innerText = quality;
    document.getElementById("learnExec").innerText = `${learning} / ${execution}`;
    document.getElementById("simple").innerText = simple;
    document.getElementById("medium").innerText = medium;
    document.getElementById("complex").innerText = complex;
    document.getElementById("refine").innerText = refinePct;
    document.getElementById("repeat").innerText = repetitions;

   
    // PROMPT IMPROVEMENT COACH
    
    const lastPrompt = prompts[prompts.length - 1].prompt;

    let focusHint = "general guidance";

    if (/cgpa|gpa|marks|exam|grades|low marks/i.test(lastPrompt)) {
      focusHint = "exam performance, study strategy, and preparation gaps";
    } else if (/career|future|job|placement|internship/i.test(lastPrompt)) {
      focusHint = "career direction, confidence building, and long-term planning";
    } else if (/confused|pressure|stress|worried|anxious/i.test(lastPrompt)) {
    focusHint = "emotional clarity, reassurance, and stress handling";
    } else if (/code|leetcode|algorithm|dp|array/i.test(lastPrompt)) {
    focusHint = "learning-oriented coding mindset instead of solution copying";
    }

    document.getElementById("originalPrompt").innerText = lastPrompt;

    let improvedPrompt = lastPrompt;
    if (lastPrompt.length < 40) {
      improvedPrompt = `Explain ${lastPrompt} with examples and real-world use cases.`;
    } else if (!/why|how|explain|understand/i.test(lastPrompt)) {
      improvedPrompt = `Explain the reasoning behind: ${lastPrompt}`;
    }

    document.getElementById("improvedPrompt").innerText = improvedPrompt;

    // MOTIVATIONAL SUPPORT ,, that feedback section
   
    const concernKeywords = [
  "cgpa", "gpa", "marks", "grades", "score",
  "fail", "failing", "backlog", "exam",

  
  "career", "future", "placement", "job",
  "scope", "internship",


  "confused", "pressure", "stress",
  "not good", "not good enough",
  "worried", "anxious"
];


    const lowerPrompt = lastPrompt.toLowerCase();
    const isConcerned = concernKeywords.some(k =>
      lowerPrompt.includes(k)
    );

    const supportSection = document.getElementById("supportSection");
    const supportBtn = document.getElementById("supportBtn");
    const supportResponse = document.getElementById("supportResponse");

    if (supportSection && trackingEnabled) {
    supportSection.style.display = "block"; 
    }


    if (supportBtn && supportResponse) {
      supportBtn.onclick = async () => {
        supportBtn.disabled = true;
        supportBtn.innerText = "Generating...";

        const GEMINI_API_KEY = "XXXXXXXXXXXXXXXXXXXXXX";
        
      const focusHints = [
  "Focus on study strategy and exam patterns.",
  "Focus on mindset shifts and self-belief.",
  "Focus on time management and daily habits.",
  "Focus on learning gaps and revision methods.",
  "Focus on handling pressure and expectations.",
  "Focus on long-term perspective beyond marks.",
  "Focus on skill-building outside academics."
  ];

const focusHint =
  focusHints[Math.floor(Math.random() * focusHints.length)];

        const body = {
  contents: [
    {
      role: "user",
      parts: [
        {
          text:
`You are a supportive academic and career mentor.
Each time you respond, choose ONE different perspective:
- Study strategy coach
- Senior student sharing experience
- Teacher explaining exam patterns
- Career mentor giving long-term view
- Peer giving emotional reassurance

Provide positive, encouraging, non-diagnostic feedback.
Do NOT label emotions or mental health conditions.

Do NOT reuse the same structure, phrases, or tone as previous responses.
Avoid generic advice like "small steps" or "consistent effort".

Focus on reassurance, perspective, and practical next steps.
Use this specific angle:
"${focusHint}"

Write a warm, encouraging response of around 80–120 words.
Be supportive, practical, and human.
Use ONE short real-life or relatable example if relevant.
Do not be overly brief.
Provide positive, encouraging, non-diagnostic feedback.
Do not label emotions or mental health conditions.
Focus on reassurance, perspective, and practical next steps.


User prompt:
"${lastPrompt}"

Give the supportive response now.`
        }
      ]
    }
  ],
  
  generationConfig: {
  maxOutputTokens: 220,
  temperature: 0.95,
  topP: 0.9,
  presencePenalty: 0.6,
  frequencyPenalty: 0.6 
  }

};


        try {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body)
            }
          );

          const data = await res.json();
          let text = "";

            try {
            const candidate = data.candidates?.[0];

            if (candidate?.content?.parts?.length) {
                text = candidate.content.parts
                .map(p => p.text || "")
                .join(" ")
                .trim();
            } else if (candidate?.content?.text) {
                text = candidate.content.text.trim();
            }
            } catch (e) {
                console.warn("Gemini parsing error", e);
            }

        if (!text) {
            text =
            `
A low CGPA can feel heavy, but it rarely defines your future. Many successful people 
struggled early — J.K. Rowling faced repeated rejections before her first book was accepted, 
yet persistence and skill mattered more than early results.

Grades often reflect exam patterns, not real ability. Focus on understanding concepts, 
building practical skills, and improving steadily. Growth over time speaks louder than 
a single number, especially when paired with consistency and effort.
`;
        }


          supportResponse.innerText = text;
        } catch (e) {
          supportResponse.innerText =
            "Uncertainty is normal. Keep taking consistent, focused steps forward.";
        }

        supportBtn.innerText = "Support Provided";
      };
    }
  }
);


chrome.storage.local.get({ directCodeRequests: 0 }, (res) => {
  const count = res.directCodeRequests || 0;
  const el = document.getElementById("directCodeCount");
  const warning = document.getElementById("directCodeWarning");

  if (!el) return;

  el.innerText = count;

  if (count >= 1) {
    el.style.color = "#ff7043";
    el.style.fontWeight = "bold";
    el.parentElement.insertAdjacentHTML(
    "beforeend",
    `<p class="muted" style="color:#ffab91">
      Consider focusing on approaches and intuition.
     </p>`
    );
  }

  // for warning message
  if (count >= 1 && warning) {
    warning.style.display = "block";
  }
});



const weeklyWrapBtn = document.getElementById("weeklyWrapBtn");

weeklyWrapBtn?.addEventListener("click", () => {
  chrome.storage.local.get({ prompts: [] }, (res) => {
    const prompts = res.prompts || [];
    if (!prompts.length) return;

    // Get last 7 days
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

    const weekly = prompts.filter(p => p.timestamp >= weekAgo);

    // Topic keywords
    const topics = {
      Academics: ["cgpa", "CGPA","CG","gpa", "marks", "exam", "grades"],
      Career: ["career", "job", "placement", "internship"],
      Coding: ["code", "algorithm", "dp", "array", "tree"],
      AI_ML: ["ai", "ml", "model", "neural", "dataset"]
    };

    function detectTopic(text) {
      text = text.toLowerCase();
      for (const [topic, keys] of Object.entries(topics)) {
        if (keys.some(k => text.includes(k))) return topic;
      }
      return "Other";
    }

   

    const topicCount = {};
    weekly.forEach(p => {
      const t = detectTopic(p.prompt);
      topicCount[t] = (topicCount[t] || 0) + 1;
    });

  //Summary calculations

// Top Topic
let topTopic = "N/A";
let maxCount = 0;

for (const [topic, count] of Object.entries(topicCount)) {
  if (count > maxCount) {
    maxCount = count;
    topTopic = topic;
  }
}

// Average Engagement
let engagementScore = 0;

weekly.forEach(p => {
  const len = p.prompt.length;
  if (len < 20) engagementScore += 1;
  else if (len <= 60) engagementScore += 2;
  else engagementScore += 3;
});

const avgScore = engagementScore / weekly.length;

let avgEngagement = "Low";
if (avgScore >= 1.7 && avgScore < 2.3) avgEngagement = "Medium";
if (avgScore >= 2.3) avgEngagement = "High";

let directCodeCount = 0;
let leetcodeDirectCode = 0;
let learningCount = 0;

weekly.forEach(p => {
  const isDirect = p.directCodeRequest === true;

  const isLearning =
    !isDirect &&
    /why|how|explain|intuition|approach|dry run|time complexity/i.test(
      p.prompt.toLowerCase()
    );

  if (isDirect) {
    directCodeCount++;
  } else if (isLearning) {
    learningCount++;
  }

  if (isDirect && p.problemPlatform === "LeetCode") {
    leetcodeDirectCode++;
  }
});

const ratio =
  directCodeCount === 0
    ? `${learningCount}:0`
    : `${learningCount}:${directCodeCount}`;

let csv =
  `Weekly Summary,,,\n` +
  `Top Topic,${topTopic}\n` +
  `Average Engagement,${avgEngagement}\n` +
  `Total Prompts,${weekly.length}\n` +
  `Direct Code Requests,${directCodeCount}\n` +
  `Learning Prompts,${learningCount}\n` +
  `Learning to Code Ratio,${ratio}\n` +
  `LeetCode Direct Code Requests,${leetcodeDirectCode}\n\n` +
  `Date,Day,Topic,Prompt Length,Prompt Category,Learning Type,Engagement Level,Repeated Topic,LLM Platform,Problem Platform,Direct Code Request\n`;

weekly.forEach(p => {
  const dateObj = new Date(p.timestamp);
  const dateStr = dateObj.toISOString().split("T")[0];
  const day = dateObj.toLocaleDateString("en-US", { weekday: "short" });

  const topic = detectTopic(p.prompt);
  const length = p.prompt.length;

  const learningType =
    /why|how|explain|intuition|approach|dry run|time complexity/i.test(p.prompt)
      ? "Learning"
      : "Execution";

  const promptCategory =
    /worried|confused|future|stress|pressure/i.test(p.prompt)
      ? "Reflection"
      : learningType;

  let engagement = "Low";
  if (length >= 20 && length <= 60) engagement = "Medium";
  if (length > 60) engagement = "High";

  const repeated = topicCount[topic] >= 3 ? "Yes" : "No";

  csv +=
    `"${dateStr}","${day}","${topic}",${length},` +
    `"${promptCategory}","${learningType}","${engagement}","${repeated}",` +
    `"${p.llmPlatform || p.platform}","${p.problemPlatform || "Other"}","${p.directCodeRequest ? "Yes" : "No"}"\n`;
});

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    // Open Google Sheets
    chrome.tabs.create({
      url: "https://docs.google.com/spreadsheets/u/0/"
    });

    // Auto-download CSV
    const a = document.createElement("a");
    a.href = url;
    a.download = "Weekly_Learning_Wrap.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);


  });
});
// NOTEBOOK LLM INTEGRATION

const notebookBtn = document.getElementById("notebookBtn");

notebookBtn?.addEventListener("click", () => {
  chrome.tabs.create({
    url: "https://notebooklm.google.com/"
  });
});


// at last for clearing DATA
const clearBtn = document.getElementById("clear");

if (clearBtn) {
  clearBtn.addEventListener("click", () => {
    const confirmClear = confirm(
      "Are you sure you want to clear all stored prompt data?\nThis action cannot be undone."
    );

    if (!confirmClear) return;

    chrome.storage.local.clear(() => {
      location.reload();
    });
  });
}


