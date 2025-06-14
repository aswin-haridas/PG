// Initialize IndexedDB
let db;
const DB_NAME = "BookmarksDB";
const DB_VERSION = 1;
const BOOKMARK_STORE = "bookmarks";
const SNIPPET_STORE = "snippets";

// Open the database
function initializeDB() {
  const request = window.indexedDB.open(DB_NAME, DB_VERSION);

  request.onerror = function (event) {
    console.error("Database error: ", event.target.error);
    showToast(
      "Error opening database. Please check if IndexedDB is supported in your browser."
    );
  };

  request.onupgradeneeded = function (event) {
    db = event.target.result;

    // Create object store for bookmarks if it doesn't exist
    if (!db.objectStoreNames.contains(BOOKMARK_STORE)) {
      const objectStore = db.createObjectStore(BOOKMARK_STORE, {
        keyPath: "_id",
      });
      objectStore.createIndex("url", "url", { unique: false });
      objectStore.createIndex("name", "name", { unique: false });
    }

    // Create object store for snippets if it doesn't exist
    if (!db.objectStoreNames.contains(SNIPPET_STORE)) {
      const objectStore = db.createObjectStore(SNIPPET_STORE, {
        keyPath: "_id",
      });
      objectStore.createIndex("title", "title", { unique: false });
      objectStore.createIndex("language", "language", { unique: false });
    }
  };

  request.onsuccess = function (event) {
    db = event.target.result;
    console.log("Database opened successfully");

    // Check which page we're on and load appropriate data
    if (window.location.href.includes("snippets.html")) {
      fetchSnippets();
    } else {
      loadLinks();
    }
  };
}

// Bookmarks page functions
async function addLink() {
  const url = prompt("Enter the URL:");
  const name = prompt("Enter the name for the link:");

  if (url && name) {
    try {
      // Generate a unique ID
      const id = Date.now().toString();

      // Create bookmark object
      const bookmark = {
        _id: id,
        url,
        name,
      };

      // Save to IndexedDB
      const transaction = db.transaction([BOOKMARK_STORE], "readwrite");
      const objectStore = transaction.objectStore(BOOKMARK_STORE);

      const request = objectStore.add(bookmark);

      request.onerror = function (event) {
        console.error("Error adding bookmark:", event.target.error);
        showToast("Failed to add bookmark. Please try again.");
      };

      request.onsuccess = function () {
        // Add to DOM
        const newLink = document.createElement("a");
        newLink.href = bookmark.url;
        newLink.textContent = bookmark.name;
        newLink.setAttribute("data-id", bookmark._id);
        newLink.style.display = "block";
        newLink.style.textAlign = "center";

        // Add delete button
        const deleteBtn = document.createElement("span");
        deleteBtn.textContent = " ×";
        deleteBtn.style.color = "#ff6200";
        deleteBtn.style.cursor = "pointer";
        deleteBtn.style.marginLeft = "10px";
        deleteBtn.onclick = function (e) {
          e.preventDefault();
          e.stopPropagation();
          deleteBookmark(bookmark._id);
        };

        newLink.appendChild(deleteBtn);
        document.getElementById("links-container").appendChild(newLink);

        // Show toast notification
        showToast("Bookmark added!");
      };
    } catch (error) {
      console.error("Error saving bookmark:", error);
      showToast("Failed to add bookmark. Please try again.");
    }
  } else {
    showToast("URL and name are required.");
  }
}

async function deleteBookmark(id) {
  if (confirm("Are you sure you want to delete this bookmark?")) {
    try {
      // Delete from IndexedDB
      const transaction = db.transaction([BOOKMARK_STORE], "readwrite");
      const objectStore = transaction.objectStore(BOOKMARK_STORE);

      const request = objectStore.delete(id);

      request.onerror = function (event) {
        console.error("Error deleting bookmark:", event.target.error);
        showToast("Failed to delete bookmark. Please try again.");
      };

      request.onsuccess = function () {
        // Remove from DOM
        document.querySelector(`a[data-id="${id}"]`).remove();
        showToast("Bookmark deleted successfully!");
      };
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      showToast("Failed to delete bookmark. Please try again.");
    }
  }
}

async function loadLinks() {
  try {
    const container = document.getElementById("links-container");
    container.innerHTML = ""; // Clear existing content

    // Get all bookmarks from IndexedDB
    const transaction = db.transaction([BOOKMARK_STORE], "readonly");
    const objectStore = transaction.objectStore(BOOKMARK_STORE);
    const request = objectStore.getAll();

    request.onerror = function (event) {
      console.error("Error loading bookmarks:", event.target.error);
      container.innerHTML =
        '<p style="color: white; text-align: center;">Failed to load bookmarks. Please try again later.</p>';
    };

    request.onsuccess = function (event) {
      const bookmarks = event.target.result;

      if (bookmarks.length === 0) {
        container.innerHTML =
          '<p style="color: white; text-align: center;">No bookmarks found. Add your first bookmark!</p>';
        return;
      }

      bookmarks.forEach((bookmark) => {
        const newLink = document.createElement("a");
        newLink.href = bookmark.url;
        newLink.textContent = bookmark.name;
        newLink.setAttribute("data-id", bookmark._id);
        newLink.style.display = "block";
        newLink.style.textAlign = "center";

        // Add delete button
        const deleteBtn = document.createElement("span");
        deleteBtn.textContent = " ×";
        deleteBtn.style.color = "#ff6200";
        deleteBtn.style.cursor = "pointer";
        deleteBtn.style.marginLeft = "10px";
        deleteBtn.onclick = function (e) {
          e.preventDefault();
          e.stopPropagation();
          deleteBookmark(bookmark._id);
        };

        newLink.appendChild(deleteBtn);
        container.appendChild(newLink);
      });
    };
  } catch (error) {
    console.error("Error loading bookmarks:", error);
    document.getElementById("links-container").innerHTML =
      '<p style="color: white; text-align: center;">Failed to load bookmarks. Please try again later.</p>';
  }
}

function showSnippets() {
  // Navigate to the snippets page
  window.location.href = "snippets.html";
}

// Snippets page functions
function goToHome() {
  window.location.href = "index.html";
}

// Toggle add snippet form
function toggleAddForm(isEdit = false) {
  const form = document.getElementById("snippet-form");
  const formTitle = document.getElementById("form-title");
  const saveBtn = document.getElementById("save-btn");

  if (form.style.display === "block" && !isEdit) {
    form.style.display = "none";
    resetForm();
  } else {
    form.style.display = "block";
    if (isEdit) {
      formTitle.textContent = "Edit Snippet";
      saveBtn.textContent = "Update Snippet";
    } else {
      formTitle.textContent = "Add New Snippet";
      saveBtn.textContent = "Save Snippet";
      resetForm();
    }
    document.getElementById("title").focus();
  }
}

// Reset the form
function resetForm() {
  document.getElementById("snippet-id").value = "";
  document.getElementById("title").value = "";
  document.getElementById("language").value = "javascript";
  document.getElementById("code").value = "";
  document.getElementById("description").value = "";
}

// Fetch all snippets
async function fetchSnippets() {
  try {
    const snippetsList = document.getElementById("snippets-list");
    snippetsList.innerHTML = ""; // Clear existing content

    // Get all snippets from IndexedDB
    const transaction = db.transaction([SNIPPET_STORE], "readonly");
    const objectStore = transaction.objectStore(SNIPPET_STORE);
    const request = objectStore.getAll();

    request.onerror = function (event) {
      console.error("Error loading snippets:", event.target.error);
      snippetsList.innerHTML =
        "<p>Failed to load snippets. Please try again later.</p>";
    };

    request.onsuccess = function (event) {
      const snippets = event.target.result;

      if (snippets.length === 0) {
        snippetsList.innerHTML =
          "<p>No snippets found. Add your first snippet!</p>";
        return;
      }

      snippets.forEach((snippet) => {
        const snippetItem = createSnippetElement(snippet);
        snippetsList.appendChild(snippetItem);
      });

      // Re-highlight code
      hljs.highlightAll();
    };
  } catch (error) {
    console.error("Error fetching snippets:", error);
    document.getElementById("snippets-list").innerHTML =
      "<p>Failed to load snippets. Please try again later.</p>";
  }
}

// Create snippet DOM element
function createSnippetElement(snippet) {
  const item = document.createElement("div");
  item.className = "snippet-item";
  item.dataset.id = snippet._id;

  item.innerHTML = `
    <div class="snippet-header">
      <div class="snippet-title">${snippet.title}
        <span class="language-badge">${snippet.language}</span>
      </div>
      <div class="snippet-actions">
        <button class="action-btn copy-btn" onclick="copySnippet('${
          snippet._id
        }')">Copy</button>
        <button class="action-btn edit-btn" onclick="editSnippet('${
          snippet._id
        }')">Edit</button>
        <button class="action-btn delete-btn" onclick="deleteSnippet('${
          snippet._id
        }')">Delete</button>
      </div>
    </div>
    <div class="snippet-content">
      <pre><code class="language-${snippet.language}">${escapeHtml(
    snippet.code
  )}</code></pre>
      ${
        snippet.description
          ? `<div class="snippet-description">${snippet.description}</div>`
          : ""
      }
    </div>
  `;

  return item;
}

// Escape HTML to prevent XSS
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Copy snippet to clipboard
async function copySnippet(id) {
  try {
    const transaction = db.transaction([SNIPPET_STORE], "readonly");
    const objectStore = transaction.objectStore(SNIPPET_STORE);
    const request = objectStore.get(id);

    request.onerror = function (event) {
      console.error("Error retrieving snippet:", event.target.error);
      showToast("Failed to copy snippet");
    };

    request.onsuccess = async function (event) {
      const snippet = event.target.result;

      if (!snippet) {
        throw new Error("Snippet not found");
      }

      await navigator.clipboard.writeText(snippet.code);
      showToast("Snippet copied to clipboard!");
    };
  } catch (error) {
    console.error("Failed to copy snippet:", error);
    showToast("Failed to copy snippet");
  }
}

// Edit snippet
async function editSnippet(id) {
  try {
    const transaction = db.transaction([SNIPPET_STORE], "readonly");
    const objectStore = transaction.objectStore(SNIPPET_STORE);
    const request = objectStore.get(id);

    request.onerror = function (event) {
      console.error("Error retrieving snippet:", event.target.error);
      showToast("Failed to load snippet for editing");
    };

    request.onsuccess = function (event) {
      const snippet = event.target.result;

      if (!snippet) {
        throw new Error("Snippet not found");
      }

      document.getElementById("snippet-id").value = snippet._id;
      document.getElementById("title").value = snippet.title;
      document.getElementById("language").value = snippet.language;
      document.getElementById("code").value = snippet.code;
      document.getElementById("description").value = snippet.description || "";

      toggleAddForm(true);
    };
  } catch (error) {
    console.error("Failed to load snippet for editing:", error);
    showToast("Failed to load snippet for editing");
  }
}

// Delete snippet
async function deleteSnippet(id) {
  if (!confirm("Are you sure you want to delete this snippet?")) {
    return;
  }

  try {
    const transaction = db.transaction([SNIPPET_STORE], "readwrite");
    const objectStore = transaction.objectStore(SNIPPET_STORE);
    const request = objectStore.delete(id);

    request.onerror = function (event) {
      console.error("Error deleting snippet:", event.target.error);
      showToast("Failed to delete snippet");
    };

    request.onsuccess = function () {
      const snippetElement = document.querySelector(
        `.snippet-item[data-id="${id}"]`
      );
      if (snippetElement) {
        snippetElement.remove();
      }
      showToast("Snippet deleted successfully");

      // Check if no snippets remain
      const snippetsList = document.getElementById("snippets-list");
      if (snippetsList.children.length === 0) {
        snippetsList.innerHTML =
          "<p>No snippets found. Add your first snippet!</p>";
      }
    };
  } catch (error) {
    console.error("Failed to delete snippet:", error);
    showToast("Failed to delete snippet");
  }
}

// Handle form submission
function setupSnippetForm() {
  document
    .getElementById("add-snippet-form")
    .addEventListener("submit", async function (event) {
      event.preventDefault();

      const snippetId = document.getElementById("snippet-id").value;
      const title = document.getElementById("title").value.trim();
      const language = document.getElementById("language").value;
      const code = document.getElementById("code").value;
      const description = document.getElementById("description").value.trim();

      if (!title || !code) {
        showToast("Title and Code are required");
        return;
      }

      try {
        const transaction = db.transaction([SNIPPET_STORE], "readwrite");
        const objectStore = transaction.objectStore(SNIPPET_STORE);

        if (snippetId) {
          // Update existing snippet
          const getRequest = objectStore.get(snippetId);

          getRequest.onsuccess = function (event) {
            const existingSnippet = event.target.result;
            if (existingSnippet) {
              // Update the existing snippet
              const updatedSnippet = {
                ...existingSnippet,
                title,
                language,
                code,
                description,
              };

              const updateRequest = objectStore.put(updatedSnippet);

              updateRequest.onsuccess = function () {
                showToast("Snippet updated successfully");
                toggleAddForm(false);
                fetchSnippets();
              };

              updateRequest.onerror = function (event) {
                console.error("Error updating snippet:", event.target.error);
                showToast("Failed to update snippet");
              };
            } else {
              showToast("Snippet not found");
            }
          };

          getRequest.onerror = function (event) {
            console.error(
              "Error retrieving snippet for update:",
              event.target.error
            );
            showToast("Failed to retrieve snippet for update");
          };
        } else {
          // Create new snippet
          const newSnippet = {
            _id: Date.now().toString(),
            title,
            language,
            code,
            description,
          };

          const addRequest = objectStore.add(newSnippet);

          addRequest.onsuccess = function () {
            showToast("Snippet added successfully");
            toggleAddForm(false);
            fetchSnippets();
          };

          addRequest.onerror = function (event) {
            console.error("Error adding snippet:", event.target.error);
            showToast("Failed to add snippet");
          };
        }
      } catch (error) {
        console.error("Error saving snippet:", error);
        showToast("Failed to save snippet");
      }
    });
}

// Toast notification
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show-toast");

  setTimeout(() => {
    toast.classList.remove("show-toast");
  }, 3000);
}

// Initialize the application
document.addEventListener("DOMContentLoaded", function () {
  initializeDB();

  // Initialize highlight.js if on snippets page
  if (window.location.href.includes("snippets.html")) {
    hljs.highlightAll();
    setupSnippetForm();
  }
});
