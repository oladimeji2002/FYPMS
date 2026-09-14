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


$studentId = $_SESSION['user_id'];


/*
|--------------------------------------------------------------------------
| GET INPUT
|--------------------------------------------------------------------------
*/

$milestoneId = $_POST['milestone_id'] ?? null;


/*
|--------------------------------------------------------------------------
| VALIDATE MILESTONE
|--------------------------------------------------------------------------
*/

if (!$milestoneId) {

    echo json_encode([
        "success" => false,
        "message" => "Milestone ID is required"
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| CHECK FILE
|--------------------------------------------------------------------------
*/

if (
    !isset($_FILES['document']) ||
    $_FILES['document']['error'] !== UPLOAD_ERR_OK
) {

    echo json_encode([
        "success" => false,
        "message" => "Please upload a milestone document"
    ]);

    exit;
}


$file = $_FILES['document'];


/*
|--------------------------------------------------------------------------
| FILE VALIDATION
|--------------------------------------------------------------------------
*/

$maxSize = 10 * 1024 * 1024; // 10MB

if ($file['size'] > $maxSize) {

    echo json_encode([
        "success" => false,
        "message" => "Document must not exceed 10MB"
    ]);

    exit;
}


$allowedExtensions = [
    "pdf",
    "doc",
    "docx"
];


$extension = strtolower(
    pathinfo($file['name'], PATHINFO_EXTENSION)
);


if (!in_array($extension, $allowedExtensions, true)) {

    echo json_encode([
        "success" => false,
        "message" => "Only PDF, DOC and DOCX files are allowed"
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| VERIFY MILESTONE BELONGS TO STUDENT
|--------------------------------------------------------------------------
*/

$stmt = $conn->prepare("
    SELECT
        m.id,
        m.project_id,
        m.milestone_no,
        m.status,
        m.document,
        p.student_id,
        p.status AS project_status
    FROM milestones m

    INNER JOIN projects p
        ON p.id = m.project_id

    WHERE m.id = ?
    AND p.student_id = ?

    LIMIT 1
");

$stmt->execute([
    $milestoneId,
    $studentId
]);

$milestone = $stmt->fetch(PDO::FETCH_ASSOC);


if (!$milestone) {

    echo json_encode([
        "success" => false,
        "message" => "Milestone not found"
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| ONLY ACTIVE / INCONCLUSIVE MILESTONE CAN BE UPDATED
|--------------------------------------------------------------------------
*/

if (
    $milestone['status'] !== 'Active' &&
    $milestone['status'] !== 'Inconclusive'
) {

    echo json_encode([
        "success" => false,
        "message" => "This milestone cannot be updated"
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| CREATE UPLOAD DIRECTORY
|--------------------------------------------------------------------------
*/

$uploadDirectory =
    "../../uploads/milestones/";


if (!is_dir($uploadDirectory)) {

    if (!mkdir(
        $uploadDirectory,
        0755,
        true
    )) {

        echo json_encode([
            "success" => false,
            "message" => "Unable to create upload directory"
        ]);

        exit;
    }
}


/*
|--------------------------------------------------------------------------
| GENERATE UNIQUE FILE NAME
|--------------------------------------------------------------------------
*/

$fileName =
    "milestone_" .
    $milestoneId .
    "_" .
    time() .
    "_" .
    bin2hex(random_bytes(4)) .
    "." .
    $extension;


$filePath =
    $uploadDirectory .
    $fileName;


/*
|--------------------------------------------------------------------------
| REMOVE OLD DOCUMENT
|--------------------------------------------------------------------------
*/

if (!empty($milestone['document'])) {

    $oldDocument =
        "../../" .
        ltrim(
            $milestone['document'],
            "/"
        );

    if (
        file_exists($oldDocument) &&
        is_file($oldDocument)
    ) {

        unlink($oldDocument);
    }
}


/*
|--------------------------------------------------------------------------
| MOVE UPLOADED FILE
|--------------------------------------------------------------------------
*/

if (!move_uploaded_file(
    $file['tmp_name'],
    $filePath
)) {

    echo json_encode([
        "success" => false,
        "message" => "Failed to upload document"
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| DATABASE PATH
|--------------------------------------------------------------------------
*/

$documentPath =
    "uploads/milestones/" .
    $fileName;


/*
|--------------------------------------------------------------------------
| UPDATE MILESTONE
|--------------------------------------------------------------------------
*/

try {

    $stmt = $conn->prepare("
        UPDATE milestones
        SET
            document = ?,
            progress = 100
        WHERE id = ?
    ");

    $success = $stmt->execute([
        $documentPath,
        $milestoneId
    ]);


    if (!$success) {

        if (file_exists($filePath)) {
            unlink($filePath);
        }

        echo json_encode([
            "success" => false,
            "message" => "Failed to save document"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    echo json_encode([
        "success" => true,
        "message" => "Milestone document uploaded successfully",
        "document" => $documentPath
    ]);

} catch (PDOException $e) {

    if (file_exists($filePath)) {
        unlink($filePath);
    }

    echo json_encode([
        "success" => false,
        "message" => "Failed to save milestone document"
    ]);

}

?>