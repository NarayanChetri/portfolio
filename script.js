document.addEventListener('DOMContentLoaded', function() {
  let locationFound = false; // flag to track if location was successfully found

  document.getElementById('contactform').addEventListener('submit', async function(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        document.getElementById('successMessage').style.display = 'block';
        form.reset();
        setTimeout(() => {
          document.getElementById('successMessage').style.display = 'none';
        }, 5000);
      } else {
        alert('Submission failed. Try again.');
      }
    } catch (error) {
      alert('Error submitting form.');
      console.error(error);
    }
  });

  // ============== LOCATION + MAP LOGIC ============= //

  const myLat = 27.533;
  const myLng = 88.512;

  function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function showMap(userLat, userLng, userLabel = "You") {
    const map = L.map('map', {
      zoomControl: false // remove zoom buttons
    }).setView([myLat, myLng], 5);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    L.marker([myLat, myLng]).addTo(map);
    L.marker([userLat, userLng]).addTo(map);

    L.polyline([[myLat, myLng], [userLat, userLng]], { color: 'red' }).addTo(map);
  }

  function handleLocation(lat, lng, label = "You") {
    locationFound = true; // mark location as found

    const outputEl = document.getElementById('output');
    if (!outputEl) {
      console.warn("🚨 'output' element not found in DOM");
      return;
    }

    console.log(`📍 Location received: ${label} (${lat}, ${lng})`);
    const distance = getDistance(lat, lng, myLat, myLng).toFixed(2);
    outputEl.textContent = `You are ~${distance} km away from me.`;
    showMap(lat, lng, label);
  }

  function fallbackToIPLocation() {
    fetch('https://ipapi.co/json/')
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch IP location");
        return res.json();
      })
      .then(data => {
        try {
          const lat = parseFloat(data.latitude);
          const lng = parseFloat(data.longitude);

          if (isNaN(lat) || isNaN(lng)) throw new Error("Invalid coordinates from IP API");

          const city = data.city || "Your rough location";
          handleLocation(lat, lng, city);
        } catch (innerError) {
          console.error("Handled error inside .then():", innerError);
          if (!locationFound) {
            const outputEl = document.getElementById('output');
            if (outputEl) outputEl.textContent = "Could not get your location.";
          }
        }
      })
      .catch(err => {
        console.error("IP location fetch error:", err);
        if (!locationFound) {
          const outputEl = document.getElementById('output');
          if (outputEl) outputEl.textContent = "Could not get your location.";
        }
      });
  }

  function getUserLocation() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          handleLocation(lat, lng, "You (Precise)");
        },
        (err) => {
          console.warn("Geolocation failed, using IP instead:", err.message);
          fallbackToIPLocation();
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      fallbackToIPLocation();
    }
  }

  // 🚀 Start
  getUserLocation();
});
