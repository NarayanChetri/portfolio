    const username = "narayan-dev";
    const proxyUrl = `https://leetcode-api-proxy.vercel.app/api/leetcode?username=${username}`;

    async function fetchLeetCodeStats() {
      try {
        const response = await fetch(proxyUrl);
        const data = await response.json();

        const stats = data?.data?.matchedUser?.submitStats?.acSubmissionNum;
        const totalSolved = stats?.find(item => item.difficulty === "All")?.count || 0;

        document.getElementById("leetcode-count").textContent = `LeetCode Solved: ${totalSolved}`;
      } catch (error) {
        document.getElementById("leetcode-count").textContent = "Error fetching LeetCode stats.";
        console.error("Fetch error:", error);
      }
    }

    fetchLeetCodeStats();