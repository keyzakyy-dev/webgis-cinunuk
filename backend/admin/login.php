<?php
require_once __DIR__ . '/../models/Auth.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    if (Auth::login($username, $password)) {
        header('Location: dashboard.php');
        exit;
    }
    $error = 'Username atau password salah';
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Login — Admin SIG Cinunuk</title>
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; }
        body { font-family: 'Inter', system-ui, sans-serif; background: #fafaf9; color: #292524; min-height: 100vh; display: grid; place-items: center; padding: 1rem; }
        .login { width: 100%; max-width: 380px; }
        .login__card { background: #fff; border: 1px solid #e7e5e4; border-radius: 12px; padding: 2.5rem 2rem; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
        .login__logo { text-align: center; margin-bottom: 1.5rem; }
        .login__logo img { height: 56px; margin-bottom: 0.75rem; }
        .login__logo h1 { font-size: 1.1rem; font-family: 'Space Grotesk', system-ui, sans-serif; }
        .login__logo small { display: block; color: #a8a29e; font-size: 0.78rem; margin-top: 0.2rem; }
        .login__field { margin-bottom: 1rem; }
        .login__field label { display: block; font-size: 0.82rem; font-weight: 600; color: #57534e; margin-bottom: 0.35rem; }
        .login__field input { width: 100%; padding: 0.7rem 0.85rem; border: 1px solid #e7e5e4; border-radius: 8px; font-size: 0.95rem; background: #fff; outline: none; transition: border-color 0.15s; }
        .login__field input:focus { border-color: #292524; box-shadow: 0 0 0 3px rgba(41,37,36,0.08); }
        .login__btn { width: 100%; padding: 0.75rem; background: #292524; color: #fff; border: none; border-radius: 8px; font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: background 0.2s; margin-top: 0.5rem; }
        .login__btn:hover { background: #44403c; }
        .login__error { background: #fef2f2; color: #991b1b; font-size: 0.82rem; padding: 0.6rem 0.85rem; border-radius: 6px; margin-bottom: 1rem; border: 1px solid #fecaca; }
    </style>
</head>
<body>
    <div class="login">
        <div class="login__card">
            <div class="login__logo">
                <img src="/images/logo-desa.png" alt="Logo Desa">
                <h1>SIG Desa Cinunuk</h1>
                <small>Panel Administrator</small>
            </div>
            <?php if (!empty($error)): ?>
                <div class="login__error"><?= htmlspecialchars($error) ?></div>
            <?php endif; ?>
            <form method="POST" action="">
                <div class="login__field">
                    <label>Username</label>
                    <input type="text" name="username" required autofocus placeholder="admin">
                </div>
                <div class="login__field">
                    <label>Password</label>
                    <input type="password" name="password" required placeholder="••••••••">
                </div>
                <button type="submit" class="login__btn">Masuk</button>
            </form>
        </div>
    </div>
</body>
</html>