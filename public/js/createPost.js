// Function to create a new post
function createPost(content) {
  // Create a new post element
  var postElement = document.createElement("div");
  postElement.className = "card mb-3";
  postElement.innerHTML = `
      <div class="card-body">
        <p class="card-text">${content}</p>
      </div>
    `;

  // Add the post element to the post container
  var postContainer = document.getElementById("postContainer");
  postContainer.prepend(postElement);
}

// Event listener for the submit post button
document.getElementById("submitPost").addEventListener("click", function () {
  var postContent = document.getElementById("postContent").value;

  if (postContent.trim() !== "") {
    createPost(postContent);
    document.getElementById("postContent").value = "";
    $("#postModal").modal("hide");
  }
});
