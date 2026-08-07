<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once "../../config/database.php";

header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"));

$fullname   = trim($data->fullname);
$email      = trim($data->email);
$matric_no  = trim($data->matric_no ?? '');
$phone      = trim($data->phone);
$department = trim($data->department);
$password   = password_hash($data->password, PASSWORD_DEFAULT);
$role       = trim($data->role);

$sql = "INSERT INTO users
(
    fullname,
    email,
    matric_no,
    phone,
    department,
    password,
    role
)
VALUES
(
    ?, ?, ?, ?, ?, ?, ?
)";

$stmt = $conn->prepare($sql);

if($stmt->execute([
    $fullname,
    $email,
    $matric_no,
    $phone,
    $department,
    $password,
    $role
])){
    echo json_encode([
        "success" => true,
        "message" => "Registration Successful"
    ]);
}else{
    echo json_encode([
        "success" => false,
        "message" => "Registration Failed"
    ]);
}