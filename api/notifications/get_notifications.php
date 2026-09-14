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


try {

    /*
    |--------------------------------------------------------------------------
    | GET USER ROLE
    |--------------------------------------------------------------------------
    */

    $stmt = $conn->prepare("
        SELECT role
        FROM users
        WHERE id = ?
        LIMIT 1
    ");

    $stmt->execute([
        $userId
    ]);

    $user = $stmt->fetch(PDO::FETCH_ASSOC);


    if (!$user) {

        echo json_encode([
            "success" => false,
            "message" => "User not found"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | GET USER NOTIFICATIONS
    |--------------------------------------------------------------------------
    */

    $stmt = $conn->prepare("
        SELECT
            id,
            title,
            message,
            type,
            is_read,
            created_at

        FROM notifications

        WHERE user_id = ?

        ORDER BY created_at DESC
    ");

    $stmt->execute([
        $userId
    ]);

    $notifications =
        $stmt->fetchAll(PDO::FETCH_ASSOC);


    /*
    |--------------------------------------------------------------------------
    | GET UNREAD COUNT
    |--------------------------------------------------------------------------
    */

    $stmt = $conn->prepare("
        SELECT COUNT(*)
        FROM notifications
        WHERE user_id = ?
        AND is_read = 0
    ");

    $stmt->execute([
        $userId
    ]);

    $unreadCount =
        (int) $stmt->fetchColumn();


    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    echo json_encode([

        "success" => true,

        "user" => [
            "role" => $user["role"]
        ],

        "notifications" => $notifications,

        "unread_count" => $unreadCount

    ]);


} catch (PDOException $e) {

    echo json_encode([

        "success" => false,

        "message" => "Failed to load notifications"

    ]);

}