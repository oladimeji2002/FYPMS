<?php

session_start();

require_once "../../config/database.php";

header("Content-Type: application/json");


/*
|--------------------------------------------------------------------------
| CHECK LOGIN
|--------------------------------------------------------------------------
*/

if (
    !isset($_SESSION['user_id']) ||
    ($_SESSION['role'] ?? '') !== 'supervisor'
) {

    echo json_encode([
        "success" => false,
        "message" => "Unauthorized"
    ]);

    exit;
}


$supervisorId = $_SESSION['user_id'];


try {

    /*
    |--------------------------------------------------------------------------
    | GET SUPERVISOR MEETINGS
    |--------------------------------------------------------------------------
    */

    $stmt = $conn->prepare("
        SELECT
            m.id,
            m.student_id,
            m.supervisor_id,
            m.milestone_id,
            m.meeting_date,
            m.agenda,
            m.status,

            u.fullname AS student_name,
            u.matric_no,
            u.email AS student_email,

            ms.milestone_no,
            ms.title AS milestone_title,
            ms.document AS milestone_document,
            ms.status AS milestone_status,
            ms.progress AS milestone_progress

        FROM meetings m

        INNER JOIN users u
            ON u.id = m.student_id

        INNER JOIN milestones ms
            ON ms.id = m.milestone_id

        WHERE m.supervisor_id = ?

        ORDER BY
            CASE
                WHEN m.status = 'Pending' THEN 1
                WHEN m.status = 'Confirmed' THEN 2
                WHEN m.status = 'Inconclusive' THEN 3
                WHEN m.status = 'Completed' THEN 4
                ELSE 5
            END,

            m.meeting_date ASC
    ");

    $stmt->execute([
        $supervisorId
    ]);

    $meetings = $stmt->fetchAll(PDO::FETCH_ASSOC);


    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    echo json_encode([
        "success" => true,
        "meetings" => $meetings
    ]);

} catch (PDOException $e) {

    echo json_encode([
        "success" => false,
        "message" => "Failed to load meetings"
    ]);

}

?>