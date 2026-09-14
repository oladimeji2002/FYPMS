<?php

session_start();

require_once "../../config/database.php";
require_once "../notifications/create_notification.php";

header("Content-Type: application/json");


if (
    !isset($_SESSION['user_id']) ||
    $_SESSION['role'] !== 'supervisor'
) {

    echo json_encode([
        "success" => false,
        "message" => "Unauthorized"
    ]);

    exit;
}


$supervisorId = $_SESSION['user_id'];


$data = json_decode(
    file_get_contents("php://input"),
    true
);


$studentId = $data['student_id'] ?? null;

$research = (int)($data['research_score'] ?? 0);
$methodology = (int)($data['methodology_score'] ?? 0);
$presentation = (int)($data['presentation_score'] ?? 0);
$report = (int)($data['report_score'] ?? 0);

$comment = trim(
    $data['comment'] ?? ''
);


if (!$studentId) {

    echo json_encode([
        "success" => false,
        "message" => "Student ID is required"
    ]);

    exit;
}


if (
    $research < 0 || $research > 100 ||
    $methodology < 0 || $methodology > 100 ||
    $presentation < 0 || $presentation > 100 ||
    $report < 0 || $report > 100
) {

    echo json_encode([
        "success" => false,
        "message" => "Scores must be between 0 and 100"
    ]);

    exit;
}


if (empty($comment)) {

    echo json_encode([
        "success" => false,
        "message" => "Assessment comment is required"
    ]);

    exit;
}


try {

    $conn->beginTransaction();


    /*
    |--------------------------------------------------------------------------
    | GET PROJECT
    |--------------------------------------------------------------------------
    */

    $stmt = $conn->prepare("
        SELECT
            id,
            title,
            status
        FROM projects
        WHERE student_id = ?
        AND supervisor_id = ?
        LIMIT 1
        FOR UPDATE
    ");

    $stmt->execute([
        $studentId,
        $supervisorId
    ]);

    $project = $stmt->fetch(PDO::FETCH_ASSOC);


    if (!$project) {

        $conn->rollBack();

        echo json_encode([
            "success" => false,
            "message" => "This student is not assigned to you"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | VERIFY ALL SIX MILESTONES EXIST AND ARE COMPLETED
    |--------------------------------------------------------------------------
    */

    $stmt = $conn->prepare("
        SELECT
            COUNT(*) AS total_milestones,
            SUM(
                CASE
                    WHEN status = 'Completed'
                    THEN 1
                    ELSE 0
                END
            ) AS completed_milestones
        FROM milestones
        WHERE project_id = ?
    ");

    $stmt->execute([
        $project['id']
    ]);

    $milestoneSummary =
        $stmt->fetch(PDO::FETCH_ASSOC);


    $totalMilestones =
        (int)$milestoneSummary['total_milestones'];

    $completedMilestones =
        (int)$milestoneSummary['completed_milestones'];


    if (
        $totalMilestones !== 6 ||
        $completedMilestones !== 6
    ) {

        $conn->rollBack();

        echo json_encode([
            "success" => false,
            "message" => "Final assessment is only available after all six milestones have been completed",
            "total_milestones" => $totalMilestones,
            "completed_milestones" => $completedMilestones
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | CHECK EXISTING FINAL ASSESSMENT
    |--------------------------------------------------------------------------
    */

    $stmt = $conn->prepare("
        SELECT id
        FROM feedback
        WHERE project_id = ?
        AND student_id = ?
        AND supervisor_id = ?
        AND milestone_id IS NULL
        LIMIT 1
    ");

    $stmt->execute([
        $project['id'],
        $studentId,
        $supervisorId
    ]);


    if ($stmt->fetch()) {

        $conn->rollBack();

        echo json_encode([
            "success" => false,
            "message" => "Final assessment has already been submitted"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | CALCULATE FINAL SCORE
    |--------------------------------------------------------------------------
    */

    $average = (int)round(
        (
            $research +
            $methodology +
            $presentation +
            $report
        ) / 4
    );


    /*
    |--------------------------------------------------------------------------
    | SAVE FINAL ASSESSMENT
    |--------------------------------------------------------------------------
    |
    | milestone_id is NULL because this is a project-level
    | final assessment.
    |
    */

    $stmt = $conn->prepare("
        INSERT INTO feedback
        (
            project_id,
            milestone_id,
            supervisor_id,
            student_id,
            research_score,
            methodology_score,
            presentation_score,
            report_score,
            average_score,
            comment
        )
        VALUES
        (
            ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?
        )
    ");

    $stmt->execute([
        $project['id'],
        $supervisorId,
        $studentId,
        $research,
        $methodology,
        $presentation,
        $report,
        $average,
        $comment
    ]);


    /*
    |--------------------------------------------------------------------------
    | PROJECT ALREADY COMPLETED
    |--------------------------------------------------------------------------
    |
    | Final assessment does not change milestone statuses.
    |
    */

    $stmt = $conn->prepare("
        UPDATE projects
        SET
            status = 'Completed',
            progress = 100
        WHERE id = ?
    ");

    $stmt->execute([
        $project['id']
    ]);


    /*
    |--------------------------------------------------------------------------
    | NOTIFY STUDENT
    |--------------------------------------------------------------------------
    */

    createNotification(
        $conn,
        $studentId,
        "Final Assessment Submitted",
        "Your supervisor has submitted your final project assessment. Your final score is " .
        $average .
        "%.",
        "assessment"
    );


    $conn->commit();


    echo json_encode([
        "success" => true,
        "message" => "Final assessment submitted successfully",
        "average_score" => $average,
        "project_status" => "Completed"
    ]);

} catch (PDOException $e) {

    if ($conn->inTransaction()) {
        $conn->rollBack();
    }

    error_log(
        "FINAL ASSESSMENT ERROR: " .
        $e->getMessage()
    );

    echo json_encode([
        "success" => false,
        "message" => "Failed to submit final assessment"
    ]);
}

?>