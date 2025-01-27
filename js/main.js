const API = 'https://6797b85bc2c861de0c6dc442.mockapi.io/api/v1/news';
const postsContainer = document.getElementById('postsContainer');
const createPostForm = document.getElementById('createPostForm');
const updateFormContainer = document.getElementById('updateFormContainer');

// Initialize event listeners when the page loads
document.addEventListener('DOMContentLoaded', () => {
  getPosts();
  createPostForm.addEventListener('submit', handleCreatePost);
});

// Fetch posts from the API and display them
async function getPosts() {
  try {
    const response = await fetch(API);
    if (!response.ok) throw new Error('Failed to fetch posts');
    
    const posts = await response.json();
    renderPosts(posts);
  } catch (error) {
    showError(error.message);
  }
}

// Dynamically render posts in the DOM
function renderPosts(posts) {
  postsContainer.innerHTML = ''; // Clear previous content
  
  posts.forEach(post => {
    const postElement = document.createElement('div');
    postElement.className = 'post';
    postElement.innerHTML = `
      <div class="postBody">
        <h2>${post.name}</h2>
        <p>${post.description}</p>
        <div class="actions">
          <button data-id="${post.id}" class="deleteBtn">Delete</button>
          <button data-id="${post.id}" class="updateBtn">Update</button>
        </div>
      </div>
    `;
    
    postsContainer.appendChild(postElement);
  });

  // Attach event listeners to buttons for each post
  addPostEventListeners();
}

// Handle creating a new post
async function handleCreatePost(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const postData = {
    name: formData.get('title'),
    description: formData.get('description')
  };

  try {
    const response = await fetch(API, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(postData)
    });
    
    if (!response.ok) throw new Error('Failed to create post');
    
    e.target.reset();
    await getPosts(); // Refresh posts after adding a new one
  } catch (error) {
    showError(error.message);
  }
}

// Handle deleting a post
async function deletePost(id) {
  try {
    const response = await fetch(`${API}/${id}`, {method: 'DELETE'});
    if (!response.ok) throw new Error('Failed to delete post');
    
    postsContainer.querySelector(`[data-id="${id}"]`).closest('.post').remove();
  } catch (error) {
    showError(error.message);
  }
}

// Display the update form with existing post data
function showUpdateForm(post) {
  updateFormContainer.innerHTML = `
    <form id="updatePostForm">
      <input type="text" id="updateTitle" value="${post.name}" required>
      <textarea id="updateDescription" required>${post.description}</textarea>
      <button type="submit">Save Changes</button>
    </form>
  `;

  document.getElementById('updatePostForm').addEventListener('submit', (e) => {
    e.preventDefault();
    handleUpdatePost(post.id);
  });
}

// Handle updating a post
async function handleUpdatePost(id) {
  const postData = {
    name: document.getElementById('updateTitle').value,
    description: document.getElementById('updateDescription').value
  };

  try {
    const response = await fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(postData)
    });
    
    if (!response.ok) throw new Error('Failed to update post');
    
    updateFormContainer.innerHTML = ''; // Clear the update form
    await getPosts(); // Refresh posts after updating
  } catch (error) {
    showError(error.message);
  }
}

// Add event listeners for delete and update buttons
function addPostEventListeners() {
  document.querySelectorAll('.deleteBtn').forEach(btn => {
    btn.addEventListener('click', () => deletePost(btn.dataset.id));
  });

  document.querySelectorAll('.updateBtn').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        const response = await fetch(`${API}/${btn.dataset.id}`);
        if (!response.ok) throw new Error('Failed to fetch post');
        const post = await response.json();
        showUpdateForm(post);
      } catch (error) {
        showError(error.message);
      }
    });
  });
}

// Display error messages for user feedback
function showError(message) {
  const errorElement = document.createElement('div');
  errorElement.className = 'error';
  errorElement.textContent = message;
  document.body.prepend(errorElement);
  setTimeout(() => errorElement.remove(), 3000);
}

// Delete all posts from the API
async function deleteAllPosts() {
  try {
    const response = await fetch(API);
    if (!response.ok) throw new Error('Failed to fetch posts');
    
    const posts = await response.json();
    posts.forEach(post => deletePost(post.id));
  } catch (error) {
    showError(error.message);
  }
}

// Search for posts by name
async function searchPosts() {
  const query = document.getElementById('searchInput').value;
  try {
    const response = await fetch(`${API}?name=${query}`);
    if (!response.ok) throw new Error('Failed to fetch posts');
    
    const posts = await response.json();
    renderPosts(posts);
  } catch (error) {
    showError(error.message);
  }
}
