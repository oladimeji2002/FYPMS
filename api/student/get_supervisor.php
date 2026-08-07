<?php

require_once "../../config/database.php";


$stmt = $conn->prepare("
SELECT id, fullname, department
FROM users
WHERE role = 'supervisor'
ORDER BY fullname
");

$stmt->execute();

echo json_encode([
    "success" => true,
    "supervisors" => $stmt->fetchAll(PDO::FETCH_ASSOC)
]);