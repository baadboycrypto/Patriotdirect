<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Patriot Direct - Login</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    .login-container {
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-radius: 20px;
      padding: 2.5rem 2rem;
      box-shadow: 0 8px 32px 0 rgba(31,38,135,0.37);
      width: 100%;
      max-width: 350px;
      color: #fff;
      text-align: center;
    }
    .login-container h2 {
      margin-bottom: 1.5rem;
      font-weight: 400;
    }
    .login-container input {
      width: 100%;
      padding: 0.8rem;
      margin: 0.5rem 0 1rem 0;
      border-radius: 10px;
      border: none;
      background: rgba(255,255,255,0.2);
      color: #222;
      font-size: 1rem;
    }
    .login-container button {
      width: 100%;
      padding: 0.8rem;
      border-radius: 10px;
      border: none;
      background: #4ade80;
      color: #222;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s;
    }
    .login-container button:hover {
      background: #22c55e;
    }
    .error-msg {
      color: #f87171;
      margin-bottom: 1rem;
      display: none;
    }
    .profile-pic {
      width: 70px;
      height: 70px;
      border-radius: 50%;
      margin-bottom: 1rem;
      border: 3px solid #fff;
      object-fit: cover;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(5px);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      animation: fadeIn 0.3s ease-in-out;
    }

    .modal-content {
      background: linear-gradient(145deg, #ffffff, #f8f9fa);
      border-radius: 20px;
      padding: 2.5rem 2rem;
      max-width: 450px;
      width: 90%;
      text-align: center;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
      position: relative;
      animation: slideIn 0.4s ease-out;
    }

    .modal-icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #ff6b6b, #ee5a24);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      font-size: 2.5rem;
      color: white;
      box-shadow: 0 10px 30px rgba(255, 107, 107, 0.3);
    }

    .modal-title {
      color: #2c3e50;
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
      text-align: center;
    }

    .modal-message {
      color: #5a6c7d;
      line-height: 1.6;
      margin-bottom: 2rem;
      font-size: 1rem;
      text-align: left;
    }

    .modal-close-btn {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border: none;
      padding: 0.8rem 2rem;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
    }

    .modal-close-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideIn {
      from { 
        opacity: 0;
        transform: translateY(-50px) scale(0.9);
      }
      to { 
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .warning-badge {
      display: inline-block;
      background: linear-gradient(135deg, #ff9a9e, #fecfef);
      color: #721c24;
      padding: 0.3rem 0.8rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      margin-bottom: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  </style>
</head>
<body>
  <div class="login-container">
    <img src="img/WhatsApp Image 2025-05-13 at 23.16.40_88140607.jpg" alt="Michael Wright" class="profile-pic">
    <h2>Patriot Direct Login</h2>
    <div class="error-msg" id="errorMsg"></div>
    <form id="loginForm" autocomplete="off">
      <input type="text" id="username" placeholder="Email" required>
      <input type="password" id="password" placeholder="Password" required>
      <button type="submit">Login</button>
    </form>
  </div>

  <!-- Restriction Modal -->
  <div class="modal-overlay" id="restrictionModal">
    <div class="modal-content">
      <div class="modal-icon">
        🔒
      </div>
      <div class="warning-badge">Account Access Restricted</div>
      <h3 class="modal-title">Suspicious Activity Detected</h3>
      <div class="modal-message">
        We've identified suspicious activity that indicates an unauthorized attempt to access your account. As a precaution, your access has been blocked to protect your account.
        <br><br>
        <strong>To resolve this issue:</strong> Please visit your nearest PatriotDirect branch with valid military documents to restore secure access to your account.
        <br><br>
        We urge you to act promptly to ensure your account remains protected and secure.
        <br><br>
        Thank you for your understanding.
      </div>
      <button class="modal-close-btn" onclick="closeModal()">Understood</button>
    </div>
  </div>

  <script>
    // Hardcoded credentials for Michael Wright
    const validUsername = "Michael@wright.com";
    const validPassword = "123456789";

    document.getElementById('loginForm').addEventListener('submit', function(e) {
      e.preventDefault();
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;
      const errorMsg = document.getElementById('errorMsg');

      // Hide any previous error messages
      errorMsg.style.display = "none";

      if (username === validUsername && password === validPassword) {
        // Show restriction modal only for correct credentials
        showRestrictionModal();
      } else {
        // Show error message for incorrect credentials
        errorMsg.textContent = "Invalid username or password.";
        errorMsg.style.display = "block";
      }
    });

    // For testing purposes - function to simulate successful login
    // Remove this in production and implement actual login success
    function simulateSuccessfulLogin() {
      // Set authentication (this would normally be done after restriction is resolved)
      localStorage.setItem('isLoggedIn', '1');
      localStorage.setItem('loginTime', Date.now().toString());
      localStorage.setItem('lastActivity', Date.now().toString());
      
      // Set up account data
      if (!localStorage.getItem('accounts')) {
        localStorage.setItem('accounts', JSON.stringify([
          {
            accountNumber: "1234567890",
            routingNumber: "111000025",
            name: "Michael Wright",
            balance: 674590
          }
        ]));
        localStorage.setItem('currentAccount', "1234567890");
      }
      
      // Redirect to dashboard
      window.location.href = "dashboard.html";
    }

    // Check if user is already logged in and redirect
    if (localStorage.getItem('isLoggedIn') === '1') {
      // Check if session is still valid (simple check)
      const loginTime = localStorage.getItem('loginTime');
      const lastActivity = localStorage.getItem('lastActivity');
      const currentTime = Date.now();
      const sessionTimeout = 30 * 60 * 1000; // 30 minutes
      
      if (loginTime && lastActivity) {
        const timeSinceActivity = currentTime - parseInt(lastActivity);
        if (timeSinceActivity < sessionTimeout) {
          window.location.href = "dashboard.html";
        } else {
          // Session expired, clear data
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('loginTime');
          localStorage.removeItem('lastActivity');
        }
      }
    }

    function showRestrictionModal() {
      const modal = document.getElementById('restrictionModal');
      modal.style.display = 'flex';
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      const modal = document.getElementById('restrictionModal');
      modal.style.display = 'none';
      // Restore body scrolling
      document.body.style.overflow = 'auto';
      // Clear form
      document.getElementById('loginForm').reset();
      
      // FOR TESTING: Uncomment the line below to simulate successful login after modal closes
      // simulateSuccessfulLogin();
    }

    // Close modal when clicking outside of it
    document.getElementById('restrictionModal').addEventListener('click', function(e) {
      if (e.target === this) {
        closeModal();
      }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeModal();
      }
    });
  </script>
</body>
</html>