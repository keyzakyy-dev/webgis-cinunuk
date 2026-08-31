<?php
$path = basename($_SERVER['SCRIPT_NAME']);
$nav  = [
    'dashboard.php' => 'Dashboard',
    'layers.php'    => 'Kelola Layer',
    'features.php'  => 'Kelola Fitur',
    'upload.php'    => 'Upload Foto',
    'import.php'    => 'Import GeoJSON',
];
?>
<nav class="admin-sidebar">
    <ul class="admin-nav">
        <?php foreach ($nav as $href => $label): ?>
        <li>
            <a href="<?= $href ?>" class="admin-nav__item <?= $path === $href ? 'admin-nav__item--active' : '' ?>">
                <?= $label ?>
            </a>
        </li>
        <?php endforeach; ?>
    </ul>
</nav>