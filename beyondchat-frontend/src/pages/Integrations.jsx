function Integrations() {

  const connectGmail = () => {
    window.location.href = "http://localhost/api/auth/google";
  };

  return (
    <div>
      <h1>Integrations</h1>

      <p>Connect your Gmail account to sync emails.</p>

      <button onClick={connectGmail}>
        Connect Gmail
      </button>
    </div>
  );
}

export default Integrations;