//   // ============== Form submission and reset logic ============= //
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


 });
