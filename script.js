document.getElementById('contactform').addEventListener('submit', async function(e) {
  e.preventDefault(); // Stop default form submission

  const form = e.target;
  const formData = new FormData(form);

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (result.success) {
      // Show success message
      document.getElementById('successMessage').style.display = 'block';

      // Clear form
      form.reset();

      // Optional: hide message after 3 seconds
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