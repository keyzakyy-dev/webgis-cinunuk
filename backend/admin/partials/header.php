<?php $user = Auth::check(); ?>
<header class="admin-header">
    <div class="admin-header__left">
        <a href="dashboard.php" class="admin-brand">
            <img src="/images/logo-desa.png" alt="Logo" class="admin-brand__logo">
            <span class="admin-brand__text">
                <strong>SIG Cinunuk</strong>
                <small>Panel Admin</small>
            </span>
        </a>
    </div>
    <div class="admin-header__right">
        <span class="admin-user"><?= htmlspecialchars($user['nama'] ?? $user['username']) ?></span>
        <a href="logout.php" class="btn btn--ghost">Keluar</a>
    </div>
</header>