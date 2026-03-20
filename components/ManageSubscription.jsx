// components/ManageSubscription.jsx
const handleManageSubscription = async () => {
  try {
    const response = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        customerId: user.stripeCustomerId 
      })
    });
    
    const { url } = await response.json();
    window.location.href = url;
  } catch (error) {
    console.error('Error:', error);
  }
};