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
    ($_SESSION['role'] ?? '') !== 'student'
) {

    echo json_encode([
        "success" => false,
        "message" => "Unauthorized"
    ]);

    exit;
}


$studentId = $_SESSION['user_id'];


try {

    /*
    |--------------------------------------------------------------------------
    | GET FINAL ASSESSMENT
    |--------------------------------------------------------------------------
    |
    | Final assessment uses:
    |
    | milestone_id = NULL
    |
    | Chapter-level feedback may still exist in older records.
    |
    */

    $stmt = $conn->prepare("
        SELECT
            f.id,
            f.project_id,
            f.milestone_id,

            f.comment,

            f.research_score,
            f.methodology_score,
            f.presentation_score,
            f.report_score,
            f.average_score,

            f.created_at,

            u.fullname AS supervisor_name,

            m.milestone_no,
            m.title AS milestone_title,

            p.title AS project_title,
            p.status AS project_status

        FROM feedback f

        LEFT JOIN users u
            ON f.supervisor_id = u.id

        LEFT JOIN milestones m
            ON f.milestone_id = m.id

        LEFT JOIN projects p
            ON f.project_id = p.id

        WHERE f.student_id = ?

        ORDER BY f.created_at DESC
    ");

    $stmt->execute([
        $studentId
    ]);

    $feedback = $stmt->fetchAll(PDO::FETCH_ASSOC);


    /*
    |--------------------------------------------------------------------------
    | FORMAT FEEDBACK
    |--------------------------------------------------------------------------
    */

    foreach ($feedback as &$item) {

        $item['is_final_assessment'] =
            empty($item['milestone_id']);

        $item['average_score'] =
            $item['average_score'] !== null
                ? (int)$item['average_score']
                : null;

        $item['research_score'] =
            $item['research_score'] !== null
                ? (int)$item['research_score']
                : null;

        $item['methodology_score'] =
            $item['methodology_score'] !== null
                ? (int)$item['methodology_score']
                : null;

        $item['presentation_score'] =
            $item['presentation_score'] !== null
                ? (int)$item['presentation_score']
                : null;

        $item['report_score'] =
            $item['report_score'] !== null
                ? (int)$item['report_score']
                : null;
    }

    unset($item);


    /*
    |--------------------------------------------------------------------------
    | FIND FINAL ASSESSMENT
    |--------------------------------------------------------------------------
    */

    $finalAssessment = null;

    foreach ($feedback as $item) {

        if ($item['is_final_assessment']) {

            $finalAssessment = $item;

            break;
        }
    }


    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    echo json_encode([
        "success" => true,

        "final_assessment" => $finalAssessment,

        "feedback" => $feedback
    ]);

} catch (PDOException $e) {

    echo json_encode([
        "success" => false,
        "message" => "Failed to load feedback"
    ]);

}

?>