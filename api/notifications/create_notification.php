<?php

function createNotification(
    PDO $conn,
    int $userId,
    string $title,
    string $message,
    string $type = "general"
) {

    $stmt = $conn->prepare("
        INSERT INTO notifications
        (
            user_id,
            title,
            message,
            type
        )
        VALUES
        (
            ?, ?, ?, ?
        )
    ");

    return $stmt->execute([
        $userId,
        $title,
        $message,
        $type
    ]);
}