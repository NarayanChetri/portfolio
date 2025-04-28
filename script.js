// --- SCROLL ANIMATION (optional) ---
window.addEventListener('scroll', () => {
  const box = document.querySelector('.box');
  if (!box) return; // Protect: If .box doesn't exist, skip

  const boxTop = box.getBoundingClientRect().top;
  const triggerPoint = window.innerHeight * 0.7;

  if (boxTop < triggerPoint) {
    box.classList.add('show');
  }
});

// --- FETCH RECENT COMMITS ---
async function fetchRecentCommits(username) {
  const commitsDiv = document.getElementById('git-commits');
  if (!commitsDiv) return; // Protect: If #git-commits missing, skip

  commitsDiv.innerHTML = '<p class="loading">Loading commits...</p>';

  try {
    const response = await fetch(`https://corsproxy.io/?https://api.github.com/users/${username}/events`);
    const events = await response.json();
    
    console.log(events); // Add this line to inspect the data

    const pushEvents = events.filter(event => event.type === "PushEvent");

    commitsDiv.innerHTML = ''; // Clear "loading..." text

    if (pushEvents.length === 0) {
      commitsDiv.innerHTML = `
        <div class="commit">
          <strong>No recent commits!</strong><br>
          <small>Stay tuned for updates 🚀</small>
        </div>`;
      return;
    }

    let commitCount = 0;

    for (const event of pushEvents) {
      for (const commit of event.payload.commits) {
        if (commitCount >= 3) break; // Only show last 3 commits

        const commitElement = document.createElement('div');
        commitElement.className = 'commit';
        commitElement.innerHTML = `
          <strong>Repo:</strong> ${event.repo.name}<br>
          <strong>Message:</strong> ${commit.message}<br>
          <small>Pushed at: ${new Date(event.created_at).toLocaleString()}</small>
        `;
        commitsDiv.appendChild(commitElement);

        commitCount++;
      }
      if (commitCount >= 3) break;
    }

  } catch (error) {
    console.error(error);
    commitsDiv.innerHTML = '<p>Failed to load commits. 😢</p>';
  }
}
