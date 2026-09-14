<?php

session_start();

require_once "../../config/database.php";

header("Content-Type: application/json");


/*
|--------------------------------------------------------------------------
| CHECK LOGIN
|--------------------------------------------------------------------------
*/

if (!isset($_SESSION['user_id'])) {

    echo json_encode([
        "success" => false,
        "message" => "Unauthorized"
    ]);

    exit;
}


$userId = $_SESSION['user_id'];


/*
|--------------------------------------------------------------------------
| GET REQUEST DATA
|--------------------------------------------------------------------------
*/

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$notificationId =
    $data['notification_id'] ?? null;


/*
|--------------------------------------------------------------------------
| VALIDATE NOTIFICATION ID
|--------------------------------------------------------------------------
*/

if (!$notificationId) {

    echo json_encode([
        "success" => false,
        "message" => "Notification ID is required"
    ]);

    exit;
}


try {

    /*
    |--------------------------------------------------------------------------
    | MARK ONLY THIS USER'S NOTIFICATION AS READ
    |--------------------------------------------------------------------------
    */

    $stmt = $conn->prepare("
        UPDATE notifications

        SET is_read = 1

        WHERE id = ?
        AND user_id = ?
    ");


    $stmt->execute([
        $notificationId,
        $userId
    ]);


    /*
    |--------------------------------------------------------------------------
    | CHECK WHETHER A NOTIFICATION WAS ACTUALLY UPDATED
    |--------------------------------------------------------------------------
    */

    if ($stmt->rowCount() === 0) {

        echo json_encode([
            "success" => false,
            "message" => "Notification not found"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | SUCCESS
    |--------------------------------------------------------------------------
    */

    echo json_encode([
        "success" => true,
        "message" => "Notification marked as read"
    ]);


} catch (PDOException $e) {

    echo json_encode([
        "success" => false,
        "message" => "Failed to mark notification as read"
    ]);

}