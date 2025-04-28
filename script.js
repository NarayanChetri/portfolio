window.addEventListener('scroll', () => {
    const box = document.querySelector('.box');
    const boxTop = box.getBoundingClientRect().top;
    const triggerPoint = window.innerHeight * 0.7;
  
    if (boxTop < triggerPoint) {
      box.classList.add('show');
    }
  });
  
  async function fetchTodayCommits(username) {
    const commitsDiv = document.getElementById('git-commits');
    commitsDiv.innerHTML = '<p class="loading">Loading commits...</p>';
  
    try {
      const response = await fetch(`https://api.github.com/users/${username}/events`);
      const events = await response.json();
      const today = new Date().toISOString().slice(0, 10);
  
      const todayPushEvents = events.filter(event =>
        event.type === "PushEvent" &&
        event.created_at.startsWith(today)
      );
  
      if (todayPushEvents.length === 0) {
        commitsDiv.innerHTML = '<p>No pushes today yet! 🚀</p>';
        return;
      }
  
      commitsDiv.innerHTML = '';
  
      todayPushEvents.forEach(event => {
        event.payload.commits.forEach(commit => {
          const commitElement = document.createElement('div');
          commitElement.className = 'commit';
          commitElement.innerHTML = `
            <strong>Repo:</strong> ${event.repo.name}<br>
            <strong>Message:</strong> ${commit.message}
          `;
          commitsDiv.appendChild(commitElement);
        });
      });
  
    } catch (error) {
      console.error(error);
      commitsDiv.innerHTML = '<p>Failed to load commits. 😢</p>';
    }
  }
  
  // Run the function with your GitHub username
  fetchTodayCommits('narayanchetri');
  

