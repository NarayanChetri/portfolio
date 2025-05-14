const username = "narayan-dev"; // ✅ Fix: Added missing quote

async function fetchLeetCodeStats(username) {
  const query = {
    query: `
      {
        matchedUser(username: "${username}") {
          submitStats {
            acSubmissionNum {
              difficulty
              count
            }
          }
        }
      }
    ` // ✅ Fix: Closed template literal correctly
  };

  try {
    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(query),
    });

    const data = await response.json();

    // ✅ Safely access data
    const stats = data?.data?.matchedUser?.submitStats?.acSubmissionNum;
    const totalSolved = stats?.find(item => item.difficulty === "All")?.count || 0;

    document.getElementById("leetcode-count").textContent = `LeetCode Solved: ${totalSolved}`;
  } catch (error) {
    document.getElementById("leetcode-count").textContent = ":-(";
    console.error("Error:", error);
  }
}

fetchLeetCodeStats(username);
