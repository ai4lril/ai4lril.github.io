// Security measures for Language Data Collection Platform
// This file contains client-side security enhancements
// Updated to be less intrusive in development mode to avoid false positives with Turbopack

(function () {
  "use strict";

  // Development mode detection - be much less intrusive
  const isDevelopment =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  // Enhanced client-side security measures with advanced monitoring
  document.addEventListener("contextmenu", function (e) {
    // Allow context menu in form fields for accessibility
    if (
      e.target &&
      (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
    ) {
      return true;
    }
    e.preventDefault();
  });

  // Prevent common malicious keyboard shortcuts
  document.addEventListener("keydown", function (e) {
    // Prevent Ctrl+U (view source), Ctrl+Shift+I (dev tools), F12
    if (
      (e.ctrlKey && e.key === "u") ||
      (e.ctrlKey && e.shiftKey && e.key === "I") ||
      e.key === "F12"
    ) {
      e.preventDefault();
      return false;
    }
  });

  // Prevent drag and drop of potentially malicious files
  document.addEventListener("dragover", function (e) {
    e.preventDefault();
  });

  document.addEventListener("drop", function (e) {
    e.preventDefault();
  });

  // Security monitoring and anomaly detection
  let suspiciousActivities = 0;
  // Be much less sensitive in development mode to avoid false positives with Turbopack
  const MAX_SUSPICIOUS_ACTIVITIES =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
      ? 50
      : 5;

  const reportSuspiciousActivity = (activity, data = null) => {
    suspiciousActivities++;
    // Only log critical events in development mode to reduce noise
    if (
      isDevelopment &&
      (activity.includes("injection") || activity.includes("script"))
    ) {
      console.warn("Critical Security Alert:", activity, data);
    }

    if (suspiciousActivities >= MAX_SUSPICIOUS_ACTIVITIES) {
      // Could send report to security endpoint (disabled for static site)
      if (
        isDevelopment &&
        (activity.includes("injection") ||
          activity.includes("script") ||
          activity.includes("malware"))
      ) {
        // Only show error for critical security issues in development
        console.error(
          "Multiple suspicious activities detected - Critical Security Issue"
        );
      }
      // Reset counter more frequently in development
      if (isDevelopment) {
        suspiciousActivities = Math.max(0, suspiciousActivities - 10);
      }
      // In a real application, this would send a report to a security monitoring service
    }

    // Store activity for potential reporting
    try {
      const activities = JSON.parse(
        localStorage.getItem("security_activities") || "[]"
      );
      activities.push({
        activity,
        timestamp: Date.now(),
        url: window.location.href,
        data,
      });
      // Keep only last 10 activities
      localStorage.setItem(
        "security_activities",
        JSON.stringify(activities.slice(-10))
      );
    } catch (e) {
      // Ignore localStorage errors
    }
  };

  // Monitor for rapid clicks (potential bot activity)
  let clickCount = 0;
  let clickTime = Date.now();
  // Be much less sensitive in development mode to avoid flagging normal interaction
  const RAPID_CLICK_THRESHOLD =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
      ? 50
      : 10;

  document.addEventListener("click", function () {
    clickCount++;
    const now = Date.now();
    if (now - clickTime > 1000) {
      clickCount = 1;
      clickTime = now;
    } else if (clickCount > RAPID_CLICK_THRESHOLD) {
      reportSuspiciousActivity("Rapid clicking detected");
    }
  });

  // Monitor for unusual navigation patterns
  let navigationCount = 0;
  // Be much less sensitive in development mode to avoid flagging Hot Module Replacement
  const NAVIGATION_THRESHOLD =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
      ? 100
      : 20;

  const originalPushState = history.pushState;
  history.pushState = function () {
    navigationCount++;
    if (navigationCount > NAVIGATION_THRESHOLD) {
      reportSuspiciousActivity("Unusual navigation pattern");
    }
    return originalPushState.apply(this, arguments);
  };

  // Protect against prototype pollution
  // Disabled in development mode as it interferes with Turbopack's module loading
  if (!isDevelopment) {
    Object.freeze(Object.prototype);
    Object.freeze(Array.prototype);
    Object.freeze(Function.prototype);
  }

  // Additional security: Prevent certain global variable access
  const dangerousGlobals = ["eval", "Function", "setTimeout", "setInterval"];
  dangerousGlobals.forEach(function (prop) {
    if (window[prop] && typeof window[prop] === "function") {
      // Store original references
      window["_" + prop] = window[prop];

      // Override with safer versions
      if (prop === "setTimeout" || prop === "setInterval") {
        window[prop] = function (callback, delay) {
          if (typeof callback === "string") {
            // Prevent code injection via string callbacks
            return;
          }
          return window["_" + prop](callback, delay);
        };
      }
    }
  });

  // Advanced security monitoring
  let anomalyScore = 0;
  // Be less sensitive in development mode
  const MAX_ANOMALY_SCORE = isDevelopment ? 20 : 10;

  // Monitor for SQL injection patterns in form inputs
  const detectSqlInjection = (input) => {
    const sqlPatterns = [
      /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/i,
      /('|(\\x27)|(\\x2D\\x2D)|(\\#)|(\\x2F\\x2A)|(\\x2A\\x2F))/i,
      /(-{2}|\/\*|\*\/)/i,
    ];

    return sqlPatterns.some((pattern) => pattern.test(input));
  };

  // Monitor for XSS patterns
  const detectXss = (input) => {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /data:text\/html/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    ];

    return xssPatterns.some((pattern) => pattern.test(input));
  };

  // Monitor for unusual keyboard patterns (potential keyloggers)
  let keySequence = [];
  const SUSPICIOUS_KEY_SEQUENCE = ["ctrl", "shift", "j"]; // Developer tools shortcut

  document.addEventListener("keydown", function (e) {
    // Skip if key is undefined (can happen with some special keys)
    if (!e.key) {
      return;
    }
    const key = e.key.toLowerCase();
    if (e.ctrlKey) keySequence.push("ctrl");
    if (e.shiftKey) keySequence.push("shift");
    keySequence.push(key);

    // Keep only last 10 keys
    if (keySequence.length > 10) {
      keySequence = keySequence.slice(-10);
    }

    // Check for suspicious sequences - be less aggressive in development
    if (keySequence.join(",").includes(SUSPICIOUS_KEY_SEQUENCE.join(","))) {
      if (!isDevelopment) {
        anomalyScore += 2;
        reportSuspiciousActivity("Suspicious keyboard sequence detected");
      } else {
        // In development, only flag if it's very suspicious
        anomalyScore += 0.5;
      }
    }

    // Reset sequence periodically
    setTimeout(() => {
      keySequence = [];
    }, 5000);
  });

  // Monitor for rapid focus changes (potential automated scripts)
  let focusCount = 0;
  let focusTime = Date.now();

  document.addEventListener("focusin", function () {
    focusCount++;
    const now = Date.now();
    if (now - focusTime > 1000) {
      focusCount = 1;
      focusTime = now;
    } else if (focusCount > (isDevelopment ? 30 : 15) && !isDevelopment) {
      anomalyScore += 1;
      reportSuspiciousActivity("Rapid focus changes detected");
    }
  });

  // Monitor for suspicious network patterns
  const originalXMLHttpRequest = window.XMLHttpRequest;
  window.XMLHttpRequest = function () {
    const xhr = new originalXMLHttpRequest();
    const originalOpen = xhr.open;

    xhr.open = function (method, url) {
      // Monitor for suspicious URLs - be less aggressive in development
      if (
        typeof url === "string" &&
        (url.includes("eval(") ||
          url.includes("javascript:") ||
          url.includes("data:text"))
      ) {
        if (!isDevelopment) {
          anomalyScore += 3;
          reportSuspiciousActivity(
            "Suspicious network request detected: " + url
          );
        } else {
          anomalyScore += 0.5; // Much less severe in development
        }
      }
      return originalOpen.apply(this, arguments);
    };

    return xhr;
  };

  // Monitor for localStorage manipulation
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function (key, value) {
    // Check for suspicious keys or values - be less aggressive in development
    if (
      key.includes("script") ||
      key.includes("eval") ||
      (typeof value === "string" && detectXss(value))
    ) {
      if (!isDevelopment) {
        anomalyScore += 2;
        reportSuspiciousActivity("Suspicious localStorage access detected");
      } else {
        anomalyScore += 0.2; // Much less severe in development
      }
    }
    return originalSetItem.apply(this, arguments);
  };

  // Enhanced anomaly detection
  setInterval(() => {
    if (anomalyScore > MAX_ANOMALY_SCORE) {
      reportSuspiciousActivity("High anomaly score detected: " + anomalyScore);
      anomalyScore = 0; // Reset after reporting
    } else if (anomalyScore > 0) {
      anomalyScore = Math.max(0, anomalyScore - 0.1); // Gradual decay
    }
  }, 30000); // Check every 30 seconds

  // CSP violation reporting (if CSP is violated)
  document.addEventListener("securitypolicyviolation", function (e) {
    anomalyScore += 1;
    // Report CSP violations (disabled for static site)
    // Silenced in development to reduce console noise
    if (
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1"
    ) {
      console.warn("CSP Violation:", {
        violatedDirective: e.violatedDirective,
        blockedURI: e.blockedURI,
        sourceFile: e.sourceFile,
      });
    }
  });

  // Monitor for WebSocket connections (potential C2 channels)
  const originalWebSocket = window.WebSocket;
  window.WebSocket = function (url) {
    if (
      typeof url === "string" &&
      !url.startsWith("wss://") &&
      !url.startsWith("ws://localhost")
    ) {
      if (!isDevelopment) {
        anomalyScore += 2;
        reportSuspiciousActivity("Suspicious WebSocket connection: " + url);
      } else {
        anomalyScore += 0.1; // Much less severe in development
      }
    }
    return new originalWebSocket(url);
  };

  // Monitor for suspicious eval usage
  // In development mode, Turbopack uses eval() for hot module replacement, so we skip monitoring
  if (!isDevelopment) {
    const originalEval = window.eval;
    window.eval = function (code) {
      anomalyScore += 5; // High score for eval usage
      reportSuspiciousActivity("Eval usage detected - potential security risk");
      return originalEval(code);
    };
  }
})();
