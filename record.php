<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST, GET");
header("Access-Control-Allow-Headers: Content-Type");

header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST, GET");
header("Access-Control-Allow-Headers: Content-Type");

session_start();

$host = "localhost";
$db = "test";
$db_user = "root";
$db_password = "";

$dsn = "mysql:host=".$host.";dbname=".$db.";charset=utf8";
$pdo = new PDO($dsn, $db_user, $db_password);


if ($_SERVER["REQUEST_METHOD"] == "POST")
{
    $action = $_POST["action"];

    if ($action == "create_exercise" && isset($_POST["date"]) && isset($_POST["name"]))
    {
        $stmt = $pdo->prepare("INSERT INTO exercise (date, exercise_name) VALUES (?, ?)");
        $stmt->execute([$_POST["date"], $_POST["exercise_name"]]);
        echo json_encode(["success" => True]);
        http_response_code(200);
    }
    elseif ($action == "get_exercise_by_date" && isset($_POST["date"]))
    {
        $stmt = $pdo->prepare("SELECT * FROM exercise WHERE date = ?");
        $stmt->execute([$_POST["date"]]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["success" => True, "result" => $rows]);
        http_response_code(200);
    }
    elseif ($action == "get_exercise_by_id" && isset($_POST["exercise_id"]))
    {
        $stmt = $pdo->prepare("SELECT * FROM exercise WHERE id = ?");
        $stmt->execute([$_POST["exercise_id"]]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row)
        {
            return echo json_encode(["success" => True, "result" => $row]);
        }
        else
        {
            return echo json_encode(["success" => False]);
        }
    }
}

?>