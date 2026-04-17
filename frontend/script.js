// =============================================================
// script.js — MailCraft AI Frontend Logic
// Handles form submission, API calls, UI state, copy, and saves
// =============================================================

"use strict";

// ===================== CONFIGURATION =====================

// 🔧 CHANGE THIS to your backend URL when deployed!
// Local:      "http://localhost:5000"
// Render:     "https://your-app.onrender.com"
// Railway:    "https://your-app.railway.app"
const API_BASE_URL = "http://localhost:5000";

const API_ENDPOINT = `${API_BASE_URL}/api/generate-email`;

// ===================== DOM REFERENCES =====================

const generateBtn   = document.getElementById("generateBtn");
const retryBtn      = document.getElementById("retryBtn");
const regenerateBtn = document.getElementById("regenerateBtn");
const copyBtn       = document.getElementById("copyBtn");
const saveBtn       = document.getElementById("saveBtn");
const modalCopyBtn  = document.getElementById("modalCopyBtn");

const outputEmpty  = document.getElementById("outputEmpty");
const outputError  = document.getElementById("outputError");
const outputResult = document.getElementById("outputResult");

const emailSubject = document.getElementById("emailSubject");
const emailBody    = document.getElementById("emailBody");
const errorMessage = document.getElementById("errorMessage");
const resultTone   = document.getElementById("resultTone");
const resultRecipient = document.getElementById("resultRecipient");

const savedDrawer     = document.getElementById("savedDrawer");
const drawerBackdrop  = document.getElementById("drawerBackdrop");
const savedList       = document.getElementById("savedList");
const closeDrawer     = document.getElementById("closeDrawer");
const clearSaved      = document.getElementById("clearSaved");

const modalOverlay = document.getElementById("modalOverlay");
const modalClose   = document.getElementById("modalClose");
const modalTitle   = document.getElementById("modalTitle");
const modalSubject = document.getElementById("modalSubject");
const modalBody    = document.getElementById("modalBody");

const toast = document.getElementById("toast");

// ===================== STATE =====================

let currentEmail = null;       // { subject, body, tone, recipientType }
let lastFormData  = null;       // Keep form data for regenerate
let savedEmails   = [];         // Array of saved email objects
let isGenerating  = false;

// ===================== INIT =====================

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // Load saved emails from localStorage
  loadSavedEmails();

  // Bind events
  generateBtn.addEventListener("click", handleGenerate);
  retryBtn.addEventListener("click", handleRetry);
  regenerateBtn.addEventListener("click", handleRegenerate);
  copyBtn.addEventListener("click", () => copyToClipboard(currentEmail));
  saveBtn.addEventListener("click", handleSave);
  closeDrawer.addEventListener("click", closeSavedDrawer);
  drawerBackdrop.addEventListener("click", closeSavedDrawer);
  clearSaved.addEventListener("click", handleClearSaved);
  modalClose.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  modalCopyBtn.addEventListener("click", () => {
    const email = { subject: modalSubject.textContent, body: modalBody.textContent };
    copyToClipboard(email);
  });

  // Close modal on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
      closeSavedDrawer();
    }
  });

  // Smooth scroll for nav links
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
});

// ===================== FORM HANDLING =====================

/**
 * getFormData()
 * Reads all form inputs and returns a data object.
 * Returns null if validation fails.
 */
function getFormData() {
  const purpose       = document.getElementById("purpose").value.trim();
  const recipientType = document.getElementById("recipientType").value;
  const toneEl        = document.querySelector('input[name="tone"]:checked');
  const tone          = toneEl ? toneEl.value : "";
  const keyPoints     = document.getElementById("keyPoints").value.trim();
  const senderName    = document.getElementById("senderName").value.trim();

  // Clear previous errors
  clearErrors();

  // Validate
  let isValid = true;

  if (!purpose) {
    showFieldError("purpose", "Please describe the purpose of your email.");
    isValid = false;
  }

  if (!recipientType) {
    showFieldError("recipient", "Please select a recipient type.");
    isValid = false;
  }

  if (!tone) {
    showFieldError("tone", "Please select a tone.");
    isValid = false;
  }

  if (!isValid) return null;

  return { purpose, recipientType, tone, keyPoints, senderName };
}

function showFieldError(fieldId, message) {
  const errorEl = document.getElementById(`error-${fieldId}`);
  const groupEl = document.getElementById(`group-${fieldId}`);
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add("visible");
  }
  if (groupEl) {
    groupEl.classList.add("has-error");
  }
}

function clearErrors() {
  document.querySelectorAll(".field-error").forEach((el) => {
    el.textContent = "";
    el.classList.remove("visible");
  });
  document.querySelectorAll(".form-group.has-error").forEach((el) => {
    el.classList.remove("has-error");
  });
}

// ===================== GENERATE EMAIL =====================

async function handleGenerate() {
  if (isGenerating) return;

  const formData = getFormData();
  if (!formData) return;

  lastFormData = formData;
  await generateEmail(formData);
}

async function handleRetry() {
  if (!lastFormData) return;
  await generateEmail(lastFormData);
}

async function handleRegenerate() {
  if (!lastFormData) return;
  await generateEmail(lastFormData);
}

async function generateEmail(formData) {
  isGenerating = true;
  setLoadingState(true);
  showPanel("loading");

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || `Server error: ${response.status}`);
    }

    // Success!
    currentEmail = {
      subject: data.data.subject,
      body: data.data.body,
      tone: formData.tone,
      recipientType: formData.recipientType,
      purpose: formData.purpose,
      savedAt: new Date().toLocaleString(),
    };

    displayResult(currentEmail);

  } catch (err) {
    console.error("Generate email error:", err);
    showError(err.message || "An unexpected error occurred. Please try again.");
  } finally {
    isGenerating = false;
    setLoadingState(false);
  }
}

// ===================== UI STATE MANAGEMENT =====================

function setLoadingState(loading) {
  const btnDefault = generateBtn.querySelector(".btn-default");
  const btnLoading = generateBtn.querySelector(".btn-loading");

  if (loading) {
    btnDefault.hidden = true;
    btnLoading.hidden = false;
    generateBtn.disabled = true;
  } else {
    btnDefault.hidden = false;
    btnLoading.hidden = true;
    generateBtn.disabled = false;
  }
}

function showPanel(state) {
  outputEmpty.hidden  = state !== "empty";
  outputError.hidden  = state !== "error";
  outputResult.hidden = state !== "result";

  // Hide all while loading
  if (state === "loading") {
    outputEmpty.hidden  = true;
    outputError.hidden  = true;
    outputResult.hidden = true;
  }
}

function displayResult(email) {
  // Set badge content
  resultTone.textContent = `✦ ${capitalize(email.tone)}`;
  resultRecipient.textContent = email.recipientType;

  // Set email content
  emailSubject.textContent = email.subject;
  emailBody.textContent = email.body;

  // Reset copy button
  resetCopyButton();

  // Show result panel
  showPanel("result");

  // Scroll to result on mobile
  if (window.innerWidth < 900) {
    document.getElementById("outputPanel").scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  // Re-initialize Lucide icons (for dynamically shown elements)
  if (window.lucide) lucide.createIcons();
}

function showError(message) {
  errorMessage.textContent = message;
  showPanel("error");
  if (window.lucide) lucide.createIcons();
}

// ===================== COPY TO CLIPBOARD =====================

async function copyToClipboard(email) {
  if (!email) return;

  const fullText = `Subject: ${email.subject}\n\n${email.body}`;

  try {
    await navigator.clipboard.writeText(fullText);

    // Update active button (could be copyBtn or modalCopyBtn)
    const btn = modalOverlay.hidden === false ? modalCopyBtn : copyBtn;
    const iconEl = btn.querySelector("svg");
    const textEl = btn.querySelector("span");

    btn.classList.add("copied");
    if (textEl) textEl.textContent = "Copied!";
    // Swap icon manually
    if (iconEl) iconEl.outerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

    showToast("Copied to clipboard!", "success");

    // Reset after 2.5s
    setTimeout(() => {
      resetCopyButton();
      resetModalCopyButton();
    }, 2500);
  } catch {
    // Fallback for older browsers
    const ta = document.createElement("textarea");
    ta.value = fullText;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    showToast("Copied to clipboard!", "success");
  }
}

function resetCopyButton() {
  copyBtn.classList.remove("copied");
  const iconSpan = copyBtn.querySelector("svg");
  if (iconSpan) iconSpan.outerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
  const textEl = copyBtn.querySelector("span");
  if (textEl) textEl.textContent = "Copy to Clipboard";
}

function resetModalCopyButton() {
  modalCopyBtn.classList.remove("copied");
  const textEl = modalCopyBtn.querySelector("span");
  if (textEl) textEl.textContent = "Copy to Clipboard";
}

// ===================== SAVE EMAILS =====================

function handleSave() {
  if (!currentEmail) return;

  // Check for duplicate subject
  const isDuplicate = savedEmails.some(
    (e) => e.subject === currentEmail.subject
  );

  if (isDuplicate) {
    showToast("This email is already saved.", "");
    return;
  }

  savedEmails.unshift({ ...currentEmail, id: Date.now() });

  // Keep max 20 saved emails
  if (savedEmails.length > 20) savedEmails.pop();

  persistSavedEmails();
  showToast("Email saved! ✦", "success");
  openSavedDrawer();
}

function loadSavedEmails() {
  try {
    const raw = localStorage.getItem("mailcraft_saved");
    savedEmails = raw ? JSON.parse(raw) : [];
  } catch {
    savedEmails = [];
  }
}

function persistSavedEmails() {
  localStorage.setItem("mailcraft_saved", JSON.stringify(savedEmails));
}

function handleClearSaved() {
  if (savedEmails.length === 0) return;
  if (!confirm("Delete all saved emails?")) return;
  savedEmails = [];
  persistSavedEmails();
  renderSavedList();
  showToast("All saved emails cleared.", "");
}

// ===================== SAVED DRAWER =====================

function openSavedDrawer() {
  renderSavedList();
  savedDrawer.hidden = false;
  drawerBackdrop.hidden = false;
  // Trigger animation on next frame
  requestAnimationFrame(() => {
    savedDrawer.classList.add("open");
  });
  if (window.lucide) lucide.createIcons();
}

function closeSavedDrawer() {
  savedDrawer.classList.remove("open");
  setTimeout(() => {
    savedDrawer.hidden = true;
    drawerBackdrop.hidden = true;
  }, 350);
}

function renderSavedList() {
  savedList.innerHTML = "";

  if (savedEmails.length === 0) {
    savedList.innerHTML = `
      <div class="drawer-empty">
        <i data-lucide="inbox"></i>
        <p>No saved emails yet.</p>
      </div>`;
    if (window.lucide) lucide.createIcons();
    return;
  }

  savedEmails.forEach((email) => {
    const item = document.createElement("div");
    item.className = "saved-item";
    item.innerHTML = `
      <div class="saved-item-subject">${escapeHtml(email.subject)}</div>
      <div class="saved-item-meta">${capitalize(email.tone)} · ${escapeHtml(email.recipientType)} · ${email.savedAt}</div>
    `;
    item.addEventListener("click", () => openEmailModal(email));
    savedList.appendChild(item);
  });
}

// ===================== EMAIL MODAL =====================

function openEmailModal(email) {
  modalTitle.textContent = `${capitalize(email.tone)} Email`;
  modalSubject.textContent = email.subject;
  modalBody.textContent = email.body;
  modalCopyBtn.dataset.email = JSON.stringify(email);
  modalOverlay.hidden = false;

  // Bind copy for modal
  modalCopyBtn.onclick = () => copyToClipboard(email);

  if (window.lucide) lucide.createIcons();
}

function closeModal() {
  modalOverlay.hidden = true;
}

// ===================== TOAST NOTIFICATIONS =====================

let toastTimer = null;

function showToast(message, type = "") {
  toast.textContent = message;
  toast.className = `toast ${type} show`;

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// ===================== UTILS =====================

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(str) {
  const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;" };
  return String(str).replace(/[&<>"']/g, (c) => map[c]);
}
