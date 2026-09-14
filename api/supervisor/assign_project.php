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


$data = json_decode(
    file_get_contents("php://input"),
    true
);

$projectId = $data['project_id'] ?? null;
$action = $data['action'] ?? 'accept';

$supervisorId = $_SESSION['user_id'];


if (!$projectId) {
    echo json_encode([
        "success" => false,
        "message" => "Project ID is required"
    ]);
    exit;
}


if (!in_array($action, ['accept', 'reject'], true)) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid action"
    ]);
    exit;
}


try {

    $conn->beginTransaction();


    /*
    |--------------------------------------------------------------------------
    | GET PROPOSAL
    |--------------------------------------------------------------------------
    */

    $stmt = $conn->prepare("
        SELECT
            id,
            student_id,
            title,
            status,
            supervisor_id
        FROM projects
        WHERE id = ?
        LIMIT 1
        FOR UPDATE
    ");

    $stmt->execute([
        $projectId
    ]);

    $project = $stmt->fetch(PDO::FETCH_ASSOC);


    if (!$project) {

        $conn->rollBack();

        echo json_encode([
            "success" => false,
            "message" => "Project proposal not found"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | REJECT
    |--------------------------------------------------------------------------
    */

    if ($action === 'reject') {

        $stmt = $conn->prepare("
            UPDATE projects
            SET
                supervisor_id = NULL,
                status = 'Rejected',
                progress = 0,
                approved_at = NULL
            WHERE id = ?
        ");

        $stmt->execute([
            $projectId
        ]);


        createNotification(
            $conn,
            $project['student_id'],
            "Project Proposal Rejected",
            "Your project proposal \"" .
            $project['title'] .
            "\" was rejected by the supervisor. You can create a new proposal.",
            "project"
        );


        $conn->commit();


        echo json_encode([
            "success" => true,
            "message" => "Project proposal rejected"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | ACCEPT
    |--------------------------------------------------------------------------
    */

    if (
        $project['status'] !== 'Pending' ||
        !empty($project['supervisor_id'])
    ) {

        $conn->rollBack();

        echo json_encode([
            "success" => false,
            "message" => "This proposal is no longer available"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | CHECK STUDENT DOES NOT HAVE ANOTHER ACTIVE PROJECT
    |--------------------------------------------------------------------------
    */

    $stmt = $conn->prepare("
        SELECT id
        FROM projects
        WHERE student_id = ?
        AND status IN ('Approved', 'In Progress')
        AND id != ?
        LIMIT 1
    ");

    $stmt->execute([
        $project['student_id'],
        $projectId
    ]);

    if ($stmt->fetch()) {

        $conn->rollBack();

        echo json_encode([
            "success" => false,
            "message" => "This student already has an active project"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | ASSIGN PROJECT
    |--------------------------------------------------------------------------
    */

    $stmt = $conn->prepare("
        UPDATE projects
        SET
            supervisor_id = ?,
            status = 'Approved',
            progress = 0,
            approved_at = NOW()
        WHERE id = ?
    ");

    $stmt->execute([
        $supervisorId,
        $projectId
    ]);


    /*
    |--------------------------------------------------------------------------
    | FIXED SIX MILESTONES
    |--------------------------------------------------------------------------
    */

    $milestones = [

        [
            1,
            "Chapter 1",
            "Introduction: Background of the Study, Statement of the Problem, Aim and Objectives, Research Questions, Significance of the Study, Scope of the Study, and Definition of Terms."
        ],

        [
            2,
            "Chapter 2",
            "Literature Review: Conceptual Review, Theoretical Framework, Review of Related Literature and Studies, Research Gap, and Summary."
        ],

        [
            3,
            "Chapter 3",
            "Methodology and System Design: Research or Development Methodology, Requirements, System Analysis, System Architecture, Database Design, Data Design, Algorithms, and User Interface Design."
        ],

        [
            4,
            "Chapter 4",
            "Implementation and Testing: Development Environment, System Requirements, Implementation, System Screenshots, Testing Procedures, Test Results, and System Evaluation."
        ],

        [
            5,
            "Chapter 5",
            "Summary, Conclusion and Recommendations: Summary of Findings, Conclusion, Recommendations, Contributions of the Study, and Suggestions for Further Research."
        ],

        [
            6,
            "Final Submission",
            "Complete Final Submission: Final project report, completed system, corrections from supervisor, final documentation, and preparation for final submission."
        ]

    ];


    /*
    |--------------------------------------------------------------------------
    | REMOVE OLD MILESTONES IF ANY
    |--------------------------------------------------------------------------
    */

    $stmt = $conn->prepare("
        DELETE FROM milestones
        WHERE project_id = ?
    ");

    $stmt->execute([
        $projectId
    ]);


    /*
    |--------------------------------------------------------------------------
    | CREATE SIX FIXED MILESTONES
    |--------------------------------------------------------------------------
    */

    $stmt = $conn->prepare("
        INSERT INTO milestones
        (
            project_id,
            milestone_no,
            title,
            description,
            status,
            progress
        )
        VALUES
        (
            ?, ?, ?, ?, 'Pending', 0
        )
    ");


    foreach ($milestones as $milestone) {

        $stmt->execute([
            $projectId,
            $milestone[0],
            $milestone[1],
            $milestone[2]
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | NOTIFY STUDENT
    |--------------------------------------------------------------------------
    */

    createNotification(
        $conn,
        $project['student_id'],
        "Project Proposal Accepted",
        "Your project proposal \"" .
        $project['title'] .
        "\" has been accepted. Six project milestones have been created. Go to Milestones and start Chapter 1.",
        "project"
    );


    $conn->commit();


    echo json_encode([
        "success" => true,
        "message" => "Project proposal accepted and six milestones created successfully"
    ]);

} catch (PDOException $e) {

    if ($conn->inTransaction()) {
        $conn->rollBack();
    }

    error_log(
        "ASSIGN PROJECT ERROR: " .
        $e->getMessage()
    );

    echo json_encode([
        "success" => false,
        "message" => "Failed to process project proposal"
    ]);
}

?>