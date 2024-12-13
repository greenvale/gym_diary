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

    if ($action == "get_exercise_by_date" && isset($_SESSION["user_id"]) && isset($_POST["date"]))
    {
        $stmt = $pdo->prepare("SELECT * FROM exercise WHERE user_id = ? AND date = ?");
        $stmt->execute([$_SESSION["user_id"], $_POST["date"]]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["success" => True, "result" => $rows]);
        http_response_code(200);
    }
    elseif ($action == "create_exercise" && isset($_POST["date"]) && isset($_POST["ex_name"])
        && isset($_POST["ex_type"]) && isset($_POST["ex_data"]))
    {
        $stmt = $pdo->prepare("INSERT INTO exercise (user_id, date, ex_type, ex_name, ex_data) VALUES (?,?,?,?,?)");
        $stmt->execute([$_SESSION["user_id"], $_POST["date"], $_POST["ex_type"], $_POST["ex_name"], json_encode($_POST["ex_data"])]);

        echo json_encode(["success" => True]);
        http_response_code(200);
    }
    
    elseif ($action == "edit_exercise" && isset($_SESSION["user_id"]) && isset($_POST["ex_id"]) && isset($_POST["ex_name"]) 
        && isset($_POST["ex_type"]) && isset($_POST["ex_data"]))
    {
        $stmt = $pdo->prepare("UPDATE exercise SET ex_name = ?, ex_type = ?, ex_data = ? WHERE id = ? AND user_id = ?");
        $stmt->execute([$_POST["ex_name"], $_POST["ex_type"], json_encode($_POST["ex_data"]), $_POST["ex_id"], $_SESSION["user_id"]]);

        echo json_encode(["success" => True]);
        http_response_code(200);
    }
}

?>