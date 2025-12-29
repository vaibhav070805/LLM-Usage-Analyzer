
const DIRECT_CODE_KEYWORDS = [  // direct code detection
  "give code",
  "give solution",
  "solution code",
  "full solution",
  "solve this",
  "solve it",
  "write code",
  "provide code",
  "complete code",

 
  "cpp code",
  "c++ code",
  "python code",
  "java code",
  "javascript code",
  "js code",
  "golang code",

  
  "leetcode solution",
  "codeforces solution",
  "editorial code",
  "accepted code",
  "ac code",
  "submit code",

  // copy intent
  "only code",
  "just code",
  "direct code",
  "no explanation"
];

const LEARNING_KEYWORDS = [
  // understanding
  "explain",
  "intuition",
  "concept",
  "idea",
  "logic",
  "reasoning",
  "how it works",
  "why this works",

  
  "approach",
  "strategy",
  "thinking",
  "breakdown",
  "step by step",
  "dry run",

  // analysis
  "time complexity",
  "space complexity",
  "optimization",
  "better approach",
  "edge case",
  "constraints",

  "example",
  "visualize",
  "simplify",
  "beginner explanation"
];

function isDirectCodeRequest(promptText) {
  if (!promptText) return false;

  const p = promptText.toLowerCase();

  const asksForCode = DIRECT_CODE_KEYWORDS.some(k => p.includes(k));
  const asksForLearning = LEARNING_KEYWORDS.some(k => p.includes(k));

  // Direct code request only if learning intent is absent
  return asksForCode && !asksForLearning;
}

function detectProblemPlatform() {
  const host = window.location.hostname.toLowerCase();

  if (host.includes("leetcode")) return "LeetCode";
  if (host.includes("codeforces")) return "Codeforces";

  return "Other";
}

(function () {
  const hostname = window.location.hostname;
  let platform = "Unknown";

  if (hostname.includes("openai.com") || hostname.includes("chatgpt.com")) {
    platform = "ChatGPT";
  } else if (hostname.includes("gemini.google.com")) {
    platform = "Gemini";
  }

  console.log("[LLM Analyzer] Active on:", platform);
  function safeStorageGet(defaults, callback) {
  try {
    chrome.storage.local.get(defaults, callback);
  } catch (e) {
    console.warn("[LLM Analyzer] Extension context invalidated");
  }
}


  function savePrompt(promptText) {
  if (!promptText || !promptText.trim()) return;

  const problemPlatform = detectProblemPlatform(); // LeetCode / Codeforces / Other
  const directCode = isDirectCodeRequest(promptText);

  if (directCode) {
    showThinkTwiceNudge();
  }


  safeStorageGet(
    {
      prompts: [],
      directCodeRequests: 0,
      trackingEnabled: true
    },
    (res) => {
      if (!res.trackingEnabled) return;

      const prompts = res.prompts || [];
      let directCount = res.directCodeRequests || 0;

      // UPDATED: count direct code everywhere
      if (directCode) {
        directCount += 1;
      }

      prompts.push({
        prompt: promptText.trim(),
        timestamp: Date.now(),
        llmPlatform: platform,              // Gemini / ChatGPT
        problemPlatform: problemPlatform,   
        directCodeRequest: directCode
      });

      try {
        chrome.storage.local.set({
          prompts,
          directCodeRequests: directCount
        });
      } catch (e) {
        console.warn("[LLM Analyzer] Storage write skipped", e);
      }
    }
  );
}


  //  ChatGPT 
  if (platform === "ChatGPT") {
    const observer = new MutationObserver(() => {
      const textarea = document.querySelector("textarea");
      if (!textarea) return;

      textarea.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          const text = textarea.value;
          savePrompt(text);
        }
      });

      console.log("[LLM Analyzer] ChatGPT prompt listener attached");
      observer.disconnect();
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  // Gemini
  if (platform === "Gemini") {
    const observer = new MutationObserver(() => {
      const inputBox = document.querySelector('[contenteditable="true"]');
      if (!inputBox) return;

      inputBox.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          const text = inputBox.innerText;
          savePrompt(text);
        }
      });

      console.log("[LLM Analyzer] Gemini prompt listener attached");
      observer.disconnect();
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }
})();

function runBasicAnalytics() {
  chrome.storage.local.get({ prompts: [] }, (result) => {
    const prompts = result.prompts;

    if (!prompts.length) {
      console.log("[LLM Analyzer] No prompts to analyze yet");
      return;
    }

    const total = prompts.length;

    let totalLength = 0;
    let chatgptCount = 0;
    let geminiCount = 0;
    let learning = 0;
    let execution = 0;
    let nightUsage = 0;

    const learningKeywords = ["why", "how", "explain", "understand"];
    const executionKeywords = ["code", "solve", "give", "write", "answer"];

    prompts.forEach((p) => {
      const text = p.prompt.toLowerCase();
      totalLength += p.prompt.length;

      if (p.platform === "ChatGPT") chatgptCount++;
      if (p.platform === "Gemini") geminiCount++;

      if (learningKeywords.some((k) => text.includes(k))) learning++;
      if (executionKeywords.some((k) => text.includes(k))) execution++;

      const hour = new Date(p.timestamp).getHours();
      if (hour >= 22 || hour <= 5) nightUsage++;
    });

    console.log("===== LLM USAGE ANALYTICS =====");
    console.log("Total Prompts:", total);
    console.log("Average Prompt Length:", Math.round(totalLength / total));
    console.log("ChatGPT Prompts:", chatgptCount);
    console.log("Gemini Prompts:", geminiCount);
    console.log("Learning-Oriented Prompts:", learning);
    console.log("Execution-Oriented Prompts:", execution);
    console.log("Late Night Usage:", nightUsage);
    console.log("===============================");
  });
}

function showThinkTwiceNudge() {
  if (document.getElementById("llm-think-twice")) return;

  const box = document.createElement("div");
  box.id = "llm-think-twice";

  box.innerHTML = `
    <div style="font-size:20px; margin-bottom:8px;">
      🚨 <b>Think Twice Before Copying Code</b>
    </div>
    <div style="font-size:15px; line-height:1.6;">
      You requested a direct solution.<br/>
      Try asking for the <b>approach</b>, <b>intuition</b>, or a <b>step-by-step explanation</b> first.
    </div>
  `;

  box.style.cssText = `
    position: fixed;
    top: 24px;
    right: 24px;
    width: 380px;
    background: #3a0000;
    color: #ffe0e0;
    padding: 18px 20px;
    border-radius: 12px;
    border-left: 6px solid #ff5252;
    font-family: Arial, sans-serif;
    box-shadow: 0 8px 22px rgba(0,0,0,0.45);
    z-index: 99999;
  `;

  document.body.appendChild(box);

  // Stay visible for 8 seconds
  setTimeout(() => {
    box.style.transition = "opacity 0.6s ease";
    box.style.opacity = "0";

    setTimeout(() => box.remove(), 600);
  }, 8000);
}

runBasicAnalytics();
