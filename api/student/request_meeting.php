<?php

session_start();

require_once "../../config/database.php";
require_once "../notifications/create_notification.php";

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


$studentId = $_SESSION['user_id'];


/*
|--------------------------------------------------------------------------
| GET REQUEST DATA
|--------------------------------------------------------------------------
*/

$data = json_decode(
    file_get_contents("php://input"),
    true
);


$milestoneId = intval(
    $data['milestone_id'] ?? 0
);

$meetingDate = trim(
    $data['meeting_date'] ?? ''
);

$agenda = trim(
    $data['agenda'] ?? ''
);


/*
|--------------------------------------------------------------------------
| VALIDATE INPUT
|--------------------------------------------------------------------------
*/

if (
    $milestoneId <= 0 ||
    empty($meetingDate) ||
    empty($agenda)
) {

    echo json_encode([
        "success" => false,
        "message" => "Milestone, meeting date and agenda are required"
    ]);

    exit;
}


try {

    /*
    |--------------------------------------------------------------------------
    | GET STUDENT'S ACTIVE PROJECT
    |--------------------------------------------------------------------------
    */

    $stmt = $conn->prepare("
        SELECT
            id,
            supervisor_id,
            status
        FROM projects
        WHERE student_id = ?
        AND status IN ('Approved', 'In Progress')
        ORDER BY id DESC
        LIMIT 1
    ");

    $stmt->execute([
        $studentId
    ]);

    $project = $stmt->fetch(PDO::FETCH_ASSOC);


    if (!$project) {

        echo json_encode([
            "success" => false,
            "message" => "You do not have an active project"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | CHECK SUPERVISOR
    |--------------------------------------------------------------------------
    */

    if (empty($project['supervisor_id'])) {

        echo json_encode([
            "success" => false,
            "message" => "No supervisor has been assigned to your project"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | GET MILESTONE
    |--------------------------------------------------------------------------
    */

    $stmt = $conn->prepare("
        SELECT
            id,
            milestone_no,
            title,
            description,
            document,
            status
        FROM milestones
        WHERE id = ?
        AND project_id = ?
        LIMIT 1
    ");

    $stmt->execute([
        $milestoneId,
        $project['id']
    ]);

    $milestone = $stmt->fetch(PDO::FETCH_ASSOC);


    if (!$milestone) {

        echo json_encode([
            "success" => false,
            "message" => "Invalid milestone selected"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | CURRENT MILESTONE CHECK
    |--------------------------------------------------------------------------
    |
    | Active = current milestone
    | Inconclusive = current milestone needing corrections
    |
    */

    if (
        $milestone['status'] !== 'Active' &&
        $milestone['status'] !== 'Inconclusive'
    ) {

        echo json_encode([
            "success" => false,
            "message" => "You can only request a meeting for the current milestone"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | DOCUMENT REQUIRED
    |--------------------------------------------------------------------------
    */

    if (
        empty($milestone['document']) ||
        trim($milestone['document']) === ''
    ) {

        echo json_encode([
            "success" => false,
            "message" => "Please upload your milestone document before requesting a meeting"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | CHECK EXISTING PENDING/CONFIRMED MEETING
    |--------------------------------------------------------------------------
    */

    $stmt = $conn->prepare("
        SELECT id
        FROM meetings
        WHERE student_id = ?
        AND supervisor_id = ?
        AND milestone_id = ?
        AND status IN ('Pending', 'Confirmed')
        LIMIT 1
    ");

    $stmt->execute([
        $studentId,
        $project['supervisor_id'],
        $milestoneId
    ]);

    $existingMeeting = $stmt->fetch(PDO::FETCH_ASSOC);


    if ($existingMeeting) {

        echo json_encode([
            "success" => false,
            "message" => "There is already a pending meeting for this milestone"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | CREATE MEETING
    |--------------------------------------------------------------------------
    */

    $stmt = $conn->prepare("
        INSERT INTO meetings
        (
            student_id,
            supervisor_id,
            milestone_id,
            meeting_date,
            agenda,
            status
        )
        VALUES
        (
            ?, ?, ?, ?, ?, 'Pending'
        )
    ");

    $stmt->execute([
        $studentId,
        $project['supervisor_id'],
        $milestoneId,
        $meetingDate,
        $agenda
    ]);


    /*
    |--------------------------------------------------------------------------
    | NOTIFY SUPERVISOR
    |--------------------------------------------------------------------------
    */

    $notification = $conn->prepare("
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

    $notification->execute([
        $project['supervisor_id'],
        "New Meeting Request",
        "A student has requested a supervisor meeting for " . $milestone['title'] . ".",
        "meeting"
    ]);


    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    echo json_encode([
        "success" => true,
        "message" => "Meeting request sent successfully"
    ]);

} catch (Exception $e) {

    echo json_encode([
        "success" => false,
        "message" => "Failed to request meeting",
        "error" => $e->getMessage()
    ]);
}

?>