<?php
session_start();


require_once "../../config/database.php";

$data = json_decode(file_get_contents("php://input"));

$email = trim($data->email);
$password = trim($data->password);

$stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);

$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user && password_verify($password, $user['password'])) {

    $_SESSION['user_id'] = $user['id'];
    $_SESSION['role'] = $user['role'];
    $_SESSION['fullname'] = $user['fullname'];

echo json_encode([
    "success" => true,
    "user" => [
        "id" => $user['id'],
        "fullname" => $user['fullname'],
        "email" => $user['email'],
        "role" => $user['role'],
        "department" => $user['department'],
        "matric_no" => $user['matric_no']
    ]
]);

} else {

    echo json_encode([
        "success" => false,
        "message" => "Invalid credentials"
    ]);
}